import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import type { AppliedRunReward } from '../progression/progressionTypes';
import { getLevelProgress } from '../progression/xpSystem';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type Props = {
  result: AppliedRunReward | null;
  loading?: boolean;
};

export function RewardSummaryCard({ result, loading }: Props) {
  const xpAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!result) return;
    xpAnim.setValue(0);
    coinAnim.setValue(0);
    Animated.parallel([
      Animated.timing(xpAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(coinAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [result, xpAnim, coinAnim]);

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>CALCULATING REWARDS…</Text>
      </View>
    );
  }

  if (!result) return null;

  const progress = getLevelProgress(result.profile);

  return (
    <View style={[styles.card, neonGlow(colors.yellow, 6)]}>
      <Text style={styles.title}>REWARDS EARNED</Text>
      {result.levelsGained > 0 ? (
        <Text style={[styles.levelUp, neonGlow(colors.yellow, 10)]}>
          LEVEL UP! → {result.newLevel}
        </Text>
      ) : null}
      <View style={styles.row}>
        <Animated.Text
          style={[
            styles.value,
            { color: colors.cyan, opacity: xpAnim },
          ]}
        >
          +{result.reward.xp} XP
        </Animated.Text>
        <Animated.Text
          style={[
            styles.value,
            { color: colors.yellow, opacity: coinAnim },
          ]}
        >
          +{result.reward.coins} ⬡
        </Animated.Text>
        {result.reward.gems > 0 ? (
          <Text style={[styles.value, { color: colors.neonPink }]}>
            +{result.reward.gems} ◆
          </Text>
        ) : null}
      </View>
      <Text style={styles.levelLine}>
        LV {progress.currentLevel} · {progress.currentXp}/{progress.requiredXp} XP
      </Text>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${progress.progressPercentage}%` },
          ]}
        />
      </View>
      {result.newlyUnlockedThemes.length > 0 ? (
        <Text style={styles.unlock}>
          Theme unlocked: {result.newlyUnlockedThemes.join(', ')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.yellow, 0.35),
    padding: 14,
    gap: 8,
  },
  title: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.yellow,
    letterSpacing: 2,
    textAlign: 'center',
  },
  levelUp: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 16,
    color: colors.yellow,
    textAlign: 'center',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  value: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
  },
  levelLine: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  barTrack: {
    height: 5,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.cyan,
    borderRadius: 4,
  },
  unlock: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.purple,
    textAlign: 'center',
  },
});
