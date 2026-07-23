import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Heart, Home, RotateCcw } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { PerspectiveGrid } from '../components/PerspectiveGrid';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, spacing, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

export function GameOverScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const {
    finalScore,
    bestScore,
    maxComboMultiplier,
    perfectClears,
    tilesPlaced,
    isNewBest,
  } = route.params;

  const stats = [
    { label: 'MAX COMBO', value: `x${maxComboMultiplier}`, color: colors.cyan },
    { label: 'PERFECT TILES', value: String(perfectClears), color: colors.green },
    { label: 'TILES PLACED', value: String(tilesPlaced), color: colors.orange },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.decorLayer, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <View style={styles.redGlow} />
        <AnimatedNeonBackground intensity="menu" />
        <PerspectiveGrid />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, neonGlow(colors.red, 16)]}>RUN OVER</Text>
        <View style={styles.hearts}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ opacity: 0.4 }}>
              <Heart size={20} fill="none" color={colors.red} strokeWidth={2} />
            </View>
          ))}
        </View>

        {isNewBest ? (
          <Text style={[styles.newBest, neonGlow(colors.yellow, 6)]}>★ NEW BEST! ★</Text>
        ) : null}

        <View style={styles.scoreRow}>
          <View style={[styles.scoreCard, neonGlow(colors.muted, 6)]}>
            <Text style={styles.scoreLabel}>FINAL SCORE</Text>
            <Text style={styles.scoreValue}>{finalScore.toLocaleString()}</Text>
          </View>
          <View style={[styles.scoreCard, neonGlow(colors.yellow, 8)]}>
            <Text style={styles.scoreLabel}>BEST SCORE</Text>
            <Text style={[styles.scoreValue, { color: colors.yellow }]}>
              {bestScore.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, { borderColor: withAlpha(s.color, 0.35) }, neonGlow(s.color, 6)]}
            >
              <Text style={[styles.statValue, { color: s.color }, neonGlow(s.color, 5)]}>
                {s.value}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <NeonButton
            label="PLAY AGAIN"
            color={colors.neonPink}
            size="large"
            icon={<RotateCcw size={17} color={colors.white} />}
            onPress={() =>
              navigation.replace('Gameplay', { mode: 'classic' })
            }
          />
          <NeonButton
            label="MAIN MENU"
            color={colors.electricBlue}
            icon={<Home size={15} color={colors.white} />}
            onPress={() => navigation.navigate('MainMenu')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  decorLayer: {
    ...StyleSheet.absoluteFill,
  },
  redGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: withAlpha(colors.red, 0.1),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    alignItems: 'center',
    gap: 14,
    zIndex: 5,
  },
  title: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 40,
    color: colors.red,
    letterSpacing: 3,
  },
  hearts: {
    flexDirection: 'row',
    gap: 5,
  },
  newBest: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 14,
    color: colors.yellow,
    letterSpacing: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  scoreCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.2),
    padding: 14,
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.muted,
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 20,
    color: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 22,
  },
  statLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
});
