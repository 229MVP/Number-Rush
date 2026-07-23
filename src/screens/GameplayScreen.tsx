import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Heart,
  Home,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Zap,
} from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { PerspectiveGrid } from '../components/PerspectiveGrid';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, spacing, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Gameplay'>;

const TARGET = 21;

function randomTile(): number {
  return Math.floor(Math.random() * 10) + 1;
}

function createInitialRun() {
  return {
    score: 0,
    combo: 1,
    strikes: 3,
    laneTotals: [0, 0, 0, 0] as number[],
    currentTile: randomTile(),
    nextTile: randomTile(),
    multiSelected: false,
  };
}

export function GameplayScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [run, setRun] = useState(createInitialRun);
  const [paused, setPaused] = useState(false);
  const [selectedLane, setSelectedLane] = useState<number | null>(null);

  const quitToMenu = useCallback(() => {
    setPaused(false);
    navigation.navigate('MainMenu');
  }, [navigation]);

  const restartRun = useCallback(() => {
    setRun(createInitialRun());
    setSelectedLane(null);
    setPaused(false);
  }, []);

  const lanes = useMemo(
    () =>
      run.laneTotals.map((total, idx) => ({
        id: idx + 1,
        total,
        need: Math.max(0, TARGET - total),
        pct: Math.min((total / TARGET) * 100, 100),
      })),
    [run.laneTotals],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decorLayer, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground intensity="menu" />
        <PerspectiveGrid />
      </View>

      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pause"
            hitSlop={8}
            onPress={() => setPaused(true)}
            style={[styles.pauseBtn, neonGlow(colors.neonPink, 8)]}
          >
            <Pause size={18} color={colors.neonPink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Home"
            hitSlop={8}
            onPress={quitToMenu}
            style={[styles.homeBtn, neonGlow(colors.electricBlue, 6)]}
          >
            <Home size={16} color={colors.electricBlue} />
          </Pressable>
        </View>

        <View style={styles.hudStat}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={[styles.hudScore, neonGlow(colors.electricBlue, 5)]}>
            {run.score.toLocaleString()}
          </Text>
        </View>

        <View style={styles.hudStat}>
          <Text style={styles.hudLabel}>COMBO</Text>
          <View style={styles.comboRow}>
            {run.combo >= 3 ? <Zap size={13} color={colors.orange} /> : null}
            <Text style={[styles.hudCombo, neonGlow(colors.orange, 5)]}>
              x{run.combo}
            </Text>
          </View>
        </View>

        <View style={styles.hudStat}>
          <Text style={[styles.hudLabel, { marginBottom: 2 }]}>STRIKES</Text>
          <View style={styles.hearts}>
            {[0, 1, 2].map((i) => {
              const filled = i < run.strikes;
              return (
                <Heart
                  key={i}
                  size={17}
                  fill={filled ? colors.neonPink : 'none'}
                  color={filled ? colors.neonPink : withAlpha(colors.muted, 0.4)}
                  strokeWidth={2}
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* Target */}
      <View style={styles.targetWrap}>
        <View style={[styles.targetPanel, neonGlow(colors.electricBlue, 10)]}>
          <Text style={styles.targetLabel}>TARGET</Text>
          <Text style={[styles.targetValue, neonGlow(colors.electricBlue, 8)]}>
            {TARGET}
          </Text>
        </View>
      </View>

      {/* Lanes */}
      <View style={styles.lanes}>
        {lanes.map((lane, idx) => {
          const selected = selectedLane === idx;
          const border = selected ? colors.neonPink : withAlpha(colors.purple, 0.4);
          return (
            <Pressable
              key={lane.id}
              accessibilityRole="button"
              accessibilityLabel={`Lane ${lane.id}`}
              onPress={() => setSelectedLane(selected ? null : idx)}
              style={[
                styles.lane,
                {
                  borderColor: border,
                  transform: [{ scale: selected ? 1.04 : 1 }],
                },
                neonGlow(selected ? colors.neonPink : colors.purple, selected ? 12 : 6),
              ]}
            >
              <View style={[styles.laneBadge, { backgroundColor: withAlpha(border, 0.2), borderColor: withAlpha(border, 0.35) }]}>
                <Text style={[styles.laneBadgeText, { color: border }]}>LANE {lane.id}</Text>
              </View>
              <Text style={styles.laneTotal}>{lane.total}</Text>
              <Text style={styles.laneNeed}>need {lane.need}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${lane.pct}%`,
                      backgroundColor: colors.neonPink,
                    },
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Current + Next */}
      <View style={styles.tilesRow}>
        <View style={styles.tileCol}>
          <Text style={styles.tileLabel}>CURRENT TILE</Text>
          <View style={[styles.currentTile, neonGlow(colors.purple, 16)]}>
            <View style={[styles.cornerTL, { borderColor: colors.neonPink }]} />
            <View style={[styles.cornerBR, { borderColor: colors.neonPink }]} />
            <Text style={[styles.currentValue, neonGlow(colors.purple, 10)]}>
              {run.currentTile}
            </Text>
          </View>
        </View>
        <View style={styles.tileCol}>
          <Text style={styles.tileLabel}>NEXT</Text>
          <View style={[styles.nextTile, neonGlow(colors.electricBlue, 8)]}>
            <Text style={[styles.nextValue, neonGlow(colors.electricBlue, 5)]}>
              {run.nextTile}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Multiplier"
          onPress={() =>
            setRun((prev) => ({ ...prev, multiSelected: !prev.multiSelected }))
          }
          style={[
            styles.powerBtn,
            {
              backgroundColor: withAlpha(colors.orange, run.multiSelected ? 0.2 : 0.1),
              borderColor: run.multiSelected ? colors.orange : withAlpha(colors.orange, 0.35),
            },
            run.multiSelected ? neonGlow(colors.orange, 8) : null,
          ]}
        >
          <Text
            style={[
              styles.powerX,
              { color: run.multiSelected ? colors.yellow : colors.orange },
            ]}
          >
            x2
          </Text>
          <View>
            <Text style={[styles.powerTitle, { color: colors.orange }]}>MULTI</Text>
            <Text style={styles.powerSub}>×2 left</Text>
          </View>
          <Zap size={13} color={run.multiSelected ? colors.yellow : colors.orange} />
        </Pressable>

        <View style={styles.instructions}>
          <Text style={styles.instructionMain}>TAP A LANE TO PLACE THE TILE</Text>
          <Text style={styles.instructionSub}>Hit exactly 21. Don't go over.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Swap"
          onPress={() =>
            setRun((prev) => ({
              ...prev,
              currentTile: prev.nextTile,
              nextTile: randomTile(),
            }))
          }
          style={[
            styles.powerBtn,
            {
              backgroundColor: withAlpha(colors.electricBlue, 0.1),
              borderColor: withAlpha(colors.electricBlue, 0.35),
            },
          ]}
        >
          <Shuffle size={15} color={colors.electricBlue} />
          <View>
            <Text style={[styles.powerTitle, { color: colors.electricBlue }]}>SWAP</Text>
            <Text style={styles.powerSub}>×3 left</Text>
          </View>
        </Pressable>
      </View>

      {/* Pause modal */}
      <Modal
        visible={paused}
        transparent
        animationType="fade"
        onRequestClose={() => setPaused(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, neonGlow(colors.neonPink, 18)]}>
            <Text style={[styles.modalTitle, neonGlow(colors.neonPink, 10)]}>PAUSED</Text>
            <NeonButton
              label="RESUME"
              color={colors.neonPink}
              size="large"
              icon={<Play size={17} color={colors.white} />}
              onPress={() => setPaused(false)}
            />
            <NeonButton
              label="RESTART RUN"
              color={colors.orange}
              icon={<RotateCcw size={15} color={colors.white} />}
              onPress={restartRun}
            />
            <NeonButton
              label="QUIT TO MENU"
              color={colors.electricBlue}
              icon={<Home size={15} color={colors.white} />}
              onPress={quitToMenu}
            />
          </View>
        </View>
      </Modal>
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
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: withAlpha(colors.backgroundSecondary, 0.8),
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(colors.electricBlue, 0.09),
    zIndex: 10,
    gap: 8,
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pauseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: withAlpha(colors.neonPink, 0.53),
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.35),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudStat: {
    alignItems: 'center',
    minWidth: 56,
  },
  hudLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.5,
  },
  hudScore: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 19,
    color: colors.white,
  },
  comboRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  hudCombo: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 17,
    color: colors.orange,
  },
  hearts: {
    flexDirection: 'row',
    gap: 3,
  },
  targetWrap: {
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 5,
  },
  targetPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderRadius: radii.compact,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: withAlpha(colors.electricBlue, 0.53),
  },
  targetLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 2,
  },
  targetValue: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 26,
    color: colors.electricBlue,
    lineHeight: 28,
  },
  lanes: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    height: 248,
    zIndex: 5,
  },
  lane: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: radii.card,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 7,
    paddingHorizontal: 3,
    gap: 4,
    overflow: 'hidden',
  },
  laneBadge: {
    borderWidth: 1,
    borderRadius: radii.small,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  laneBadgeText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
  },
  laneTotal: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 30,
    color: colors.white,
    lineHeight: 32,
  },
  laneNeed: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 9,
    color: colors.muted,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    marginTop: 'auto',
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 4,
    zIndex: 5,
  },
  tileCol: {
    alignItems: 'center',
    gap: 4,
  },
  tileLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.5,
  },
  currentTile: {
    width: 72,
    height: 72,
    borderRadius: radii.tile,
    backgroundColor: withAlpha(colors.purple, 0.33),
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  currentValue: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 38,
    color: colors.white,
  },
  nextTile: {
    width: 46,
    height: 46,
    borderRadius: radii.compact,
    backgroundColor: withAlpha(colors.electricBlue, 0.16),
    borderWidth: 1.5,
    borderColor: withAlpha(colors.electricBlue, 0.33),
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },
  nextValue: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 22,
    color: colors.electricBlue,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
    zIndex: 5,
    gap: 6,
  },
  powerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: radii.compact,
    borderWidth: 1.5,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  powerX: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 14,
  },
  powerTitle: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
  },
  powerSub: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 9,
    color: colors.muted,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: withAlpha(colors.background, 0.88),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: withAlpha(colors.neonPink, 0.4),
    borderRadius: radii.modal,
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 12,
  },
  modalTitle: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 28,
    color: colors.neonPink,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 4,
  },
});
