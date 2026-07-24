import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  InteractionManager,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
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
  PowerUpTray,
  SwapPowerUpButton,
  TargetPanel,
  TutorialOverlay,
  WildValuePicker,
} from '../components/gameplay';
import type { TutorialStep } from '../components/gameplay/TutorialOverlay';
import { useOptionalAudio } from '../audio/AudioProvider';
import { LANE_COUNT, TARGET_VALUE, TILE_MOVE_DURATION } from '../game/gameConstants';
import { resolveRunConfig } from '../game/gameModes';
import type { DailyResultsParams, GameOverPayload } from '../game/gameTypes';
import { useOptionalHaptics } from '../haptics/HapticsProvider';
import { useNumberRushGame } from '../hooks/useNumberRushGame';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { useReducedMotionPreference } from '../settings/SettingsProvider';
import {
  getTutorialCompleted,
  setTutorialCompleted,
} from '../storage/gameStorage';
import {
  measureTutorialTarget,
  type TutorialTargetRect,
} from '../utils/measureTutorialTarget';
import { RevivePanel } from '../components/monetization/RevivePanel';
import { rewardedAdsEnabled } from '../config/featureFlags';
import { useAds } from '../hooks/useAds';
import type { RunStats } from '../game/gameTypes';
import {
  isReviveUsedForRun,
  markReviveUsedForRun,
  readAdFrequencyState,
} from '../storage/adFrequencyStorage';
import { colors, fontFamilies, neonGlow, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Gameplay'>;

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function GameplayScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const reducedMotion = useReducedMotionPreference();
  const audio = useOptionalAudio();
  const haptics = useOptionalHaptics();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>(1);
  const [tutorialTargetRect, setTutorialTargetRect] =
    useState<TutorialTargetRect | null>(null);
  const [boardWidth, setBoardWidth] = useState(360);
  const [rootSize, setRootSize] = useState({ width: 0, height: 0 });
  const [trayOpen, setTrayOpen] = useState(false);
  const [wildPickerOpen, setWildPickerOpen] = useState(false);
  const [showRevive, setShowRevive] = useState(false);
  const [reviveBusy, setReviveBusy] = useState(false);

  const ads = useAds();
  const runIdRef = useRef(
    `run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  );
  const reviveAlreadyUsedRef = useRef(false);
  const pendingProceedRef = useRef<(() => void) | null>(null);
  const gameOverNavigatedRef = useRef(false);

  const gameplayRootRef = useRef<View>(null);
  const currentTileTargetRef = useRef<View>(null);
  const laneGroupTargetRef = useRef<View>(null);
  const targetPanelTargetRef = useRef<View>(null);
  const prevCombo = useRef(1);
  const prevStatus = useRef<string>('playing');
  const lastPopupId = useRef<string | null>(null);

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
      if (gameOverNavigatedRef.current) return;
      gameOverNavigatedRef.current = true;
      audio?.playSound('gameOver');
      navigation.replace('GameOver', payload);
    },
    [navigation, audio],
  );

  const onReviveOpportunity = useCallback(
    ({
      stats: _stats,
      proceed,
    }: {
      stats: RunStats;
      proceed: () => void;
    }) => {
      if (runConfig.mode !== 'classic') return false;
      if (!rewardedAdsEnabled || !ads.adsAvailable) return false;
      if (reviveAlreadyUsedRef.current) return false;
      pendingProceedRef.current = proceed;
      setShowRevive(true);
      return true;
    },
    [runConfig.mode, ads.adsAvailable],
  );

  const onDailyComplete = useCallback(
    (params: DailyResultsParams) => {
      audio?.playSound('victory');
      navigation.replace('DailyResults', params);
    },
    [navigation, audio],
  );

  const game = useNumberRushGame({
    configuration: runConfig,
    onGameOver,
    onDailyComplete,
    onReviveOpportunity:
      runConfig.mode === 'classic' ? onReviveOpportunity : undefined,
    runId: runIdRef.current,
  });

  useEffect(() => {
    if (runConfig.mode !== 'classic') return;
    void readAdFrequencyState().then((state) => {
      reviveAlreadyUsedRef.current = isReviveUsedForRun(
        state,
        runIdRef.current,
      );
    });
    ads.preloadRewarded();
  }, [runConfig.mode, ads]);

  useEffect(() => {
    if (!focused) return;
    void audio?.playMusic('gameplay');
  }, [focused, audio]);

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

  const modalBlocking =
    tutorialVisible ||
    trayOpen ||
    wildPickerOpen ||
    game.gameStatus === 'paused' ||
    showRevive;

  const inputLocked =
    game.gameStatus === 'resolving' ||
    game.gameStatus === 'paused' ||
    game.gameStatus === 'gameOver' ||
    tutorialVisible ||
    trayOpen ||
    wildPickerOpen;

  // Feedback: popups / combo / status
  useEffect(() => {
    const latest = game.floatingPopups[game.floatingPopups.length - 1];
    if (!latest || latest.id === lastPopupId.current) return;
    lastPopupId.current = latest.id;
    if (latest.kind === 'perfect') {
      audio?.playSound('perfect');
      haptics?.success();
    } else if (latest.kind === 'bust') {
      audio?.playSound('bust');
      haptics?.error();
      if (game.strikesRemaining <= 1) haptics?.warning();
    } else if (latest.kind === 'shielded') {
      audio?.playSound('shield');
      haptics?.success();
    } else if (latest.kind === 'bomb') {
      audio?.playSound('bomb');
      haptics?.heavyImpact();
    } else {
      audio?.playSound('tilePlace');
      haptics?.lightImpact();
    }
  }, [game.floatingPopups, game.strikesRemaining, audio, haptics]);

  useEffect(() => {
    if (game.comboMultiplier > prevCombo.current) {
      audio?.playSound('comboUp');
      haptics?.mediumImpact();
    }
    prevCombo.current = game.comboMultiplier;
  }, [game.comboMultiplier, audio, haptics]);

  useEffect(() => {
    if (
      game.gameStatus === 'paused' &&
      prevStatus.current !== 'paused'
    ) {
      audio?.playSound('buttonTap');
    }
    prevStatus.current = game.gameStatus;
  }, [game.gameStatus, audio]);

  // Open wild picker when wild selected without value
  useEffect(() => {
    if (game.wildSelected && game.selectedWildValue == null) {
      setWildPickerOpen(true);
    }
    if (!game.wildSelected) {
      setWildPickerOpen(false);
    }
  }, [game.wildSelected, game.selectedWildValue]);

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
      value: game.travel.effectiveValue,
    });
    travelAnim.setValue(0);
    if (reducedMotion) {
      Animated.timing(travelAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
      return;
    }
    Animated.timing(travelAnim, {
      toValue: 1,
      duration: TILE_MOVE_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [game.travel, travelAnim, reducedMotion]);

  // Keyboard controls (web/desktop)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (modalBlocking || game.gameStatus === 'resolving') {
        if (e.key === 'Escape' && game.gameStatus === 'paused') {
          e.preventDefault();
          game.resumeGame();
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (trayOpen) setTrayOpen(false);
        else if (game.gameStatus === 'playing') game.pauseGame();
        return;
      }
      const laneKey = Number.parseInt(e.key, 10);
      if (laneKey >= 1 && laneKey <= 4) {
        e.preventDefault();
        haptics?.selection();
        game.placeTile(laneKey - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalBlocking, game, trayOpen, haptics]);

  const onBoardLayout = (e: LayoutChangeEvent) => {
    setBoardWidth(e.nativeEvent.layout.width);
  };

  const onRootLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setRootSize({ width, height });
  };

  const quitToMenu = () => {
    game.quitGame();
    void audio?.playMusic('menu');
    navigation.navigate('MainMenu');
  };

  const powerLocked = game.powerUpsEnabled ? null : 'DISABLED IN TOURNAMENT';
  const modeBadge =
    game.mode === 'daily' ? 'DAILY' : game.mode === 'ranked' ? 'RANKED' : null;
  const attemptLabel =
    game.mode === 'daily'
      ? game.officialAttempt
        ? 'OFFICIAL'
        : 'PRACTICE'
      : game.mode === 'ranked'
        ? 'MATCH'
        : null;

  const lanePad = 10;
  const laneGap = 7;
  const laneWidth =
    (boardWidth - lanePad * 2 - laneGap * (LANE_COUNT - 1)) / LANE_COUNT;

  const endRunAfterReviveDecline = useCallback(() => {
    setShowRevive(false);
    const proceed = pendingProceedRef.current;
    pendingProceedRef.current = null;
    proceed?.();
  }, []);

  const watchReviveAd = useCallback(() => {
    if (reviveBusy) return;
    setReviveBusy(true);
    void (async () => {
      try {
        const result = await ads.showRewarded({
          placement: 'classic_revive',
          opportunityId: runIdRef.current,
        });
        if (result.earned) {
          await markReviveUsedForRun(runIdRef.current);
          reviveAlreadyUsedRef.current = true;
          game.reviveFromRewardedAd();
          setShowRevive(false);
          pendingProceedRef.current = null;
        }
      } finally {
        setReviveBusy(false);
      }
    })();
  }, [ads, game, reviveBusy]);

  const extraSelectedCount =
    (game.bombSelected ? 1 : 0) +
    (game.freezeSelected ? 1 : 0) +
    (game.shieldArmed ? 1 : 0) +
    (game.wildSelected ? 1 : 0);

  return (
    <View
      ref={gameplayRootRef}
      collapsable={false}
      style={[styles.root, { paddingTop: insets.top }]}
      onLayout={onRootLayout}
      testID="gameplay-screen"
    >
      <View
        style={[styles.decorLayer, { pointerEvents: 'none' }]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground
          intensity="menu"
          reducedMotion={reducedMotion || !focused}
        />
        <PerspectiveGrid />
      </View>

      <GameplayHUD
        score={game.score}
        comboMultiplier={game.comboMultiplier}
        strikesRemaining={game.strikesRemaining}
        scorePulseKey={game.scorePulseKey}
        comboPulseKey={game.comboPulseKey}
        onPause={() => {
          audio?.playSound('buttonTap');
          game.pauseGame();
        }}
        pauseDisabled={inputLocked && game.gameStatus !== 'paused'}
        modeBadge={modeBadge}
        attemptLabel={attemptLabel}
        tilesRemaining={game.tilesRemaining}
        shieldArmed={game.shieldArmed}
        reducedMotion={reducedMotion}
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
            testID={`lane-${idx + 1}`}
            lane={lane}
            target={TARGET_VALUE}
            disabled={inputLocked && game.swapMode === 'off' && !game.bombSelected}
            selected={false}
            swapSelected={
              game.selectedSwapLane === idx || lane.status === 'selected'
            }
            bombHighlight={game.bombPulseLane === idx}
            reducedMotion={reducedMotion}
            onPress={() => {
              if (inputLocked && game.swapMode === 'off' && !game.bombSelected) {
                return;
              }
              haptics?.selection();
              if (game.swapMode !== 'off') {
                game.selectSwapLane(idx);
                if (game.swapMode === 'selectSecond') {
                  audio?.playSound('swap');
                  haptics?.mediumImpact();
                }
              } else {
                game.placeTile(idx);
              }
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
                outputRange: reducedMotion ? [1, 0] : [1, 0.55],
              }),
              transform: reducedMotion
                ? []
                : [
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
          importantForAccessibility="no"
        >
          <View style={styles.travelInner}>
            <Text style={styles.travelValue}>{travelVisual.value}</Text>
          </View>
        </Animated.View>
      ) : null}

      <View style={styles.tilesRow}>
        <NumberTile
          testID="current-tile"
          tile={game.currentTile}
          variant="current"
          multiplierSelected={game.multiplierSelected}
          freezeSelected={game.freezeSelected}
          wildValue={
            game.wildSelected && game.selectedWildValue != null
              ? game.selectedWildValue
              : null
          }
          showEffective
          measureRef={currentTileTargetRef}
          onCardLayout={scheduleMeasure}
        />
        <NumberTile testID="next-tile" tile={game.nextTile} variant="next" />
      </View>

      <View style={styles.controls}>
        <MultiplierPowerUpButton
          testID="powerup-multiplier"
          quantity={game.multiplierQuantity}
          selected={game.multiplierSelected}
          disabled={inputLocked || !game.powerUpsEnabled}
          lockedReason={powerLocked}
          onPress={() => {
            audio?.playSound('buttonTap');
            haptics?.selection();
            game.toggleMultiplier();
          }}
        />
        <View style={styles.instructions}>
          <Pressable
            testID="powerup-drawer"
            accessibilityRole="button"
            accessibilityLabel={`More power-ups, ${game.bombQuantity + game.freezeQuantity + game.shieldQuantity + game.wildQuantity} owned`}
            disabled={!game.powerUpsEnabled || inputLocked}
            onPress={() => {
              audio?.playSound('buttonTap');
              setTrayOpen(true);
            }}
            style={[
              styles.trayBtn,
              extraSelectedCount > 0 ? neonGlow(colors.cyan, 6) : null,
              (!game.powerUpsEnabled || inputLocked) && { opacity: 0.45 },
            ]}
          >
            <Text style={styles.trayBtnText}>+4</Text>
          </Pressable>
          <Text style={styles.instructionMain}>{game.instructionText}</Text>
          <Text style={styles.instructionSub}>
            Hit exactly {TARGET_VALUE}. Don't go over.
          </Text>
        </View>
        <SwapPowerUpButton
          testID="powerup-swap"
          quantity={game.swapQuantity}
          active={game.swapMode !== 'off'}
          disabled={inputLocked || !game.powerUpsEnabled}
          lockedReason={powerLocked}
          onPress={() => {
            audio?.playSound('buttonTap');
            haptics?.selection();
            game.toggleSwap();
          }}
        />
      </View>

      <PowerUpTray
        visible={trayOpen}
        onClose={() => setTrayOpen(false)}
        disabled={inputLocked}
        lockedReason={powerLocked}
        items={[
          {
            id: 'bomb',
            name: 'BOMB',
            quantity: game.bombQuantity,
            selected: game.bombSelected,
            color: colors.red,
            onPress: () => {
              audio?.playSound('buttonTap');
              haptics?.selection();
              game.toggleBomb();
            },
          },
          {
            id: 'freeze',
            name: 'FREEZE',
            quantity: game.freezeQuantity,
            selected: game.freezeSelected,
            color: colors.cyan,
            onPress: () => {
              audio?.playSound('freeze');
              haptics?.selection();
              game.toggleFreeze();
            },
          },
          {
            id: 'shield',
            name: 'SHIELD',
            quantity: game.shieldQuantity,
            selected: game.shieldArmed,
            color: colors.electricBlue,
            onPress: () => {
              audio?.playSound('buttonTap');
              haptics?.selection();
              game.toggleShield();
            },
          },
          {
            id: 'wild',
            name: 'WILD',
            quantity: game.wildQuantity,
            selected: game.wildSelected,
            color: colors.purple,
            onPress: () => {
              audio?.playSound('wild');
              haptics?.selection();
              game.openWildPicker();
              setWildPickerOpen(true);
            },
          },
        ]}
      />

      <WildValuePicker
        visible={wildPickerOpen}
        selectedValue={game.selectedWildValue}
        onSelect={(n) => {
          haptics?.selection();
          game.confirmWildValue(n);
        }}
        onConfirm={(n) => {
          audio?.playSound('wild');
          haptics?.mediumImpact();
          game.confirmWildValue(n);
          setWildPickerOpen(false);
        }}
        onCancel={() => {
          game.cancelWild();
          setWildPickerOpen(false);
        }}
      />

      <PauseModal
        visible={game.gameStatus === 'paused'}
        mode={game.mode}
        officialAttempt={game.officialAttempt}
        onResume={() => {
          audio?.playSound('buttonTap');
          game.resumeGame();
        }}
        onRestart={game.restartGame}
        onSettings={() => navigation.navigate('Settings')}
        onQuit={quitToMenu}
        onForfeitOfficial={() => {
          void game.forfeitOfficialDaily();
        }}
      />

      <RevivePanel
        visible={showRevive}
        loading={reviveBusy}
        adUnavailable={!ads.adsAvailable || ads.rewardedState === 'unavailable'}
        onWatchAd={watchReviveAd}
        onEndRun={endRunAfterReviveDecline}
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
    gap: 2,
  },
  trayBtn: {
    minWidth: 44,
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: withAlpha(colors.cyan, 0.45),
    backgroundColor: withAlpha(colors.cyan, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  trayBtnText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    color: colors.cyan,
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
