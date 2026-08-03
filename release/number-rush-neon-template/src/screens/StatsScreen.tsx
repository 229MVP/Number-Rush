import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { getBestScore } from '../storage/gameStorage';
import { getTemplateStats, type TemplateStats } from '../storage/templateStatsStorage';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Stats'>;

const ACCENT = colors.green;

export function StatsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [bestScore, setBestScore] = useState(0);
  const [stats, setStats] = useState<TemplateStats | null>(null);

  const refresh = useCallback(async () => {
    const [best, s] = await Promise.all([getBestScore(), getTemplateStats()]);
    setBestScore(best);
    setStats(s);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const cards = [
    { label: 'BEST SCORE', value: bestScore.toLocaleString(), color: colors.yellow },
    { label: 'GAMES PLAYED', value: String(stats?.gamesPlayed ?? 0), color: colors.cyan },
    {
      label: 'PERFECT CLEARS',
      value: String(stats?.totalPerfectClears ?? 0),
      color: colors.green,
    },
    {
      label: 'TILES PLACED',
      value: String(stats?.totalTilesPlaced ?? 0),
      color: colors.orange,
    },
    {
      label: 'HIGHEST COMBO',
      value: `x${stats?.highestCombo ?? 1}`,
      color: colors.electricBlue,
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="stats-screen">
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>
      <ScreenTopBar
        title="STATS"
        accent={ACCENT}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainMenu');
        }}
      />
      <View style={styles.grid}>
        {cards.map((c) => (
          <View
            key={c.label}
            style={[styles.card, { borderColor: withAlpha(c.color, 0.35) }, neonGlow(c.color, 5)]}
          >
            <Text style={[styles.value, { color: c.color }, neonGlow(c.color, 4)]}>
              {c.value}
            </Text>
            <Text style={styles.label}>{c.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.note}>Local statistics stored on this device only.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
    zIndex: 5,
  },
  card: {
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 22,
  },
  label: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
  },
  note: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
