import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  InteractionManager,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { PerspectiveGrid } from '../components/PerspectiveGrid';
import {
  FloatingScorePopup,
  GameplayHUD,
  LaneCard,
  MultiplierPowerUpButton,
  NumberTile,
  PauseModal,
  SwapPowerUpButton,
  TargetPanel,
  TutorialOverlay,
} from '../components/gameplay';
import type { TutorialStep } from '../components/gameplay/TutorialOverlay';
import { LANE_COUNT, TARGET_VALUE, TILE_MOVE_DURATION } from '../game/gameConstants';
import { resolveRunConfig } from '../game/gameModes';
import type { DailyResultsParams, GameOverPayload } from '../game/gameTypes';
import { useNumberRushGame } from '../hooks/useNumberRushGame';
import type { RootStackParamList } from '../navigation/navigationTypes';
import {
  getTutorialCompleted,
  setTutorialCompleted,
} from '../storage/gameStorage';
import {
  measureTutorialTarget,
  type TutorialTargetRect,
} from '../utils/measureTutorialTarget';
import { colors, fontFamilies, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Gameplay'>;

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Traveling-tile animation uses a controlled approximation toward each lane's
 * horizontal center (equal-width columns) rather than measureInWindow, which is
 * fragile across Expo Web and native. The game still resolves after TILE_MOVE_DURATION.
 */
export function GameplayScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>(1);
  const [tutorialTargetRect, setTutorialTargetRect] =
    useState<TutorialTargetRect | null>(null);
  const [boardWidth, setBoardWidth] = useState(360);
  const [rootSize, setRootSize] = useState({ width: 0, height: 0 });

  const gameplayRootRef = useRef<View>(null);
  const currentTileTargetRef = useRef<View>(null);
  const laneGroupTargetRef = useRef<View>(null);
  const targetPanelTargetRef = useRef<View>(null);

  const runConfig = useMemo(
    () =>
      resolveRunConfig({
        mode: route.params?.mode ?? 'classic',
        seed: route.params?.seed,
        officialAttempt: route.params?.officialAttempt,
      }),
    [
      route.params?.mode,
      route.params?.seed,
      route.params?.officialAttempt,
    ],
  );

  const onGameOver = useCallback(
    (payload: GameOverPayload) => {
      navigation.replace('GameOver', payload);
    },
    [navigation],
  );

  const onDailyComplete = useCallback(
    (params: DailyResultsParams) => {
      navigation.replace('DailyResults', params);
    },
    [navigation],
  );

  const game = useNumberRushGame({
    configuration: runConfig,
    onGameOver,
    onDailyComplete,
  });

  useEffect(() => {
    if (runConfig.mode !== 'classic') return;
    let mounted = true;
    void getTutorialCompleted().then((done) => {
      if (mounted && !done) setTutorialVisible(true);
    });
    return () => {
      mounted = false;
    };
  }, [runConfig.mode]);

  const finishTutorial = useCallback(() => {
    setTutorialVisible(false);
    setTutorialTargetRect(null);
    void setTutorialCompleted(true);
  }, []);

  const getActiveTargetRef = useCallback(() => {
    if (tutorialStep === 1) return currentTileTargetRef;
    if (tutorialStep === 2) return laneGroupTargetRef;
    return targetPanelTargetRef;
  }, [tutorialStep]);

  const measureActiveTarget = useCallback(async () => {
    let attempt = 0;
    while (attempt < 3) {
      attempt += 1;
      const rect = await measureTutorialTarget(
        gameplayRootRef,
        getActiveTargetRef(),
      );
      if (rect && rect.width > 0 && rect.height > 0) {
        setTutorialTargetRect(rect);
        return;
      }
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });
    }
    setTutorialTargetRect(null);
  }, [getActiveTargetRef]);

  const scheduleMeasure = useCallback(() => {
    if (!tutorialVisible) return;
    requestAnimationFrame(() => {
      void measureActiveTarget();
    });
  }, [tutorialVisible, measureActiveTarget]);

  useEffect(() => {
    if (!tutorialVisible) return;
    setTutorialTargetRect(null);
  }, [tutorialStep, tutorialVisible]);

  useEffect(() => {
    if (!tutorialVisible || rootSize.width <= 0 || rootSize.height <= 0) return;

    let cancelled = false;
    const handle = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        if (!cancelled) {
          void measureActiveTarget();
        }
      });
    });

    const retry = setTimeout(() => {
      if (!cancelled) void measureActiveTarget();
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(retry);
      if (handle && typeof handle.cancel === 'function') {
        handle.cancel();
      }
    };
  }, [
    tutorialVisible,
    tutorialStep,
    rootSize.width,
    rootSize.height,
    windowWidth,
    windowHeight,
    insets.top,
    insets.bottom,
    measureActiveTarget,
  ]);

  const inputLocked =
    game.gameStatus === 'resolving' ||
    game.gameStatus === 'paused' ||
    game.gameStatus === 'gameOver' ||
    tutorialVisible;

  const travelAnim = useRef(new Animated.Value(0)).current;
  const [travelVisual, setTravelVisual] = useState<{
    laneIndex: number;
    value: number;
  } | null>(null);

  useEffect(() => {
    if (!game.travel) {
      setTravelVisual(null);
      return;
    }
    setTravelVisual({
      laneIndex: game.travel.laneIndex,
      value: game.travel.tile.value,
    });
    travelAnim.setValue(0);
    Animated.timing(travelAnim, {
      toValue: 1,
      duration: TILE_MOVE_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [game.travel, travelAnim]);

  const onBoardLayout = (e: LayoutChangeEvent) => {
    setBoardWidth(e.nativeEvent.layout.width);
  };

  const onRootLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setRootSize({ width, height });
  };

  const quitToMenu = () => {
    game.quitGame();
    navigation.navigate('MainMenu');
  };

  const powerLocked = game.powerUpsEnabled ? null : 'DISABLED IN TOURNAMENT';
  const modeBadge = game.mode === 'daily' ? 'DAILY' : null;
  const attemptLabel =
    game.mode === 'daily'
      ? game.officialAttempt
        ? 'OFFICIAL'
        : 'PRACTICE'
      : null;

  const lanePad = 10;
  const laneGap = 7;
  const laneWidth =
    (boardWidth - lanePad * 2 - laneGap * (LANE_COUNT - 1)) / LANE_COUNT;

  return (
    <View
      ref={gameplayRootRef}
      collapsable={false}
      style={[styles.root, { paddingTop: insets.top }]}
      onLayout={onRootLayout}
    >
      <View style={[styles.decorLayer, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground intensity="menu" />
        <PerspectiveGrid />
      </View>

      <GameplayHUD
        score={game.score}
        comboMultiplier={game.comboMultiplier}
        strikesRemaining={game.strikesRemaining}
        scorePulseKey={game.scorePulseKey}
        comboPulseKey={game.comboPulseKey}
        onPause={game.pauseGame}
        pauseDisabled={inputLocked && game.gameStatus !== 'paused'}
        modeBadge={modeBadge}
        attemptLabel={attemptLabel}
        tilesRemaining={game.tilesRemaining}
      />

      <TargetPanel
        target={TARGET_VALUE}
        measureRef={targetPanelTargetRef}
        onPanelLayout={scheduleMeasure}
      />

      <View
        ref={laneGroupTargetRef}
        collapsable={false}
        style={styles.lanes}
        onLayout={(e) => {
          onBoardLayout(e);
          scheduleMeasure();
        }}
      >
        {game.lanes.map((lane, idx) => (
          <LaneCard
            key={lane.id}
            lane={lane}
            target={TARGET_VALUE}
            disabled={inputLocked && game.swapMode === 'off'}
            selected={false}
            swapSelected={
              game.selectedSwapLane === idx || lane.status === 'selected'
            }
            onPress={() => {
              if (game.swapMode !== 'off') game.selectSwapLane(idx);
              else if (!inputLocked) game.placeTile(idx);
            }}
          />
        ))}
      </View>

      {game.floatingPopups.map((popup) => (
        <FloatingScorePopup
          key={popup.id}
          popup={popup}
          xPercent={((popup.laneIndex + 0.5) / LANE_COUNT) * 100}
        />
      ))}

      {travelVisual ? (
        <Animated.View
          style={[
            styles.travelTile,
            {
              pointerEvents: 'none',
              opacity: travelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.55],
              }),
              transform: [
                {
                  translateX: travelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      0,
                      lanePad +
                        travelVisual.laneIndex * (laneWidth + laneGap) +
                        laneWidth / 2 -
                        boardWidth / 2,
                    ],
                  }),
                },
                {
                  translateY: travelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -120],
                  }),
                },
                {
                  scale: travelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.75],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.travelInner}>
            <Text style={styles.travelValue}>{travelVisual.value}</Text>
          </View>
        </Animated.View>
      ) : null}

      <View style={styles.tilesRow}>
        <NumberTile
          tile={game.currentTile}
          variant="current"
          multiplierSelected={game.multiplierSelected}
          showEffective
          measureRef={currentTileTargetRef}
          onCardLayout={scheduleMeasure}
        />
        <NumberTile tile={game.nextTile} variant="next" />
      </View>

      <View style={styles.controls}>
        <MultiplierPowerUpButton
          quantity={game.multiplierQuantity}
          selected={game.multiplierSelected}
          disabled={inputLocked || !game.powerUpsEnabled}
          lockedReason={powerLocked}
          onPress={game.toggleMultiplier}
        />
        <View style={styles.instructions}>
          <Text style={styles.instructionMain}>{game.instructionText}</Text>
          <Text style={styles.instructionSub}>
            Hit exactly {TARGET_VALUE}. Don't go over.
          </Text>
        </View>
        <SwapPowerUpButton
          quantity={game.swapQuantity}
          active={game.swapMode !== 'off'}
          disabled={inputLocked || !game.powerUpsEnabled}
          lockedReason={powerLocked}
          onPress={game.toggleSwap}
        />
      </View>

      <PauseModal
        visible={game.gameStatus === 'paused'}
        mode={game.mode}
        officialAttempt={game.officialAttempt}
        onResume={game.resumeGame}
        onRestart={game.restartGame}
        onSettings={() => navigation.navigate('Settings')}
        onQuit={quitToMenu}
        onForfeitOfficial={() => {
          void game.forfeitOfficialDaily();
        }}
      />

      <TutorialOverlay
        visible={tutorialVisible}
        step={tutorialStep}
        targetRect={tutorialTargetRect}
        bounds={rootSize}
        onNext={() =>
          setTutorialStep((s) => (s < 3 ? ((s + 1) as TutorialStep) : s))
        }
        onSkip={finishTutorial}
        onComplete={finishTutorial}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  decorLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  lanes: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    flexGrow: 1,
    flexShrink: 1,
    maxHeight: 248,
    minHeight: 160,
    zIndex: 5,
  },
  tilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    paddingBottom: 12,
    zIndex: 5,
    gap: 6,
  },
  instructions: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  instructionMain: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.white,
    textAlign: 'center',
  },
  instructionSub: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 9,
    color: colors.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  travelTile: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 210,
    zIndex: 40,
  },
  travelInner: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: withAlpha(colors.purple, 0.45),
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelValue: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 34,
    color: colors.white,
  },
});
