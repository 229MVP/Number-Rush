import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Play } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import {
  DIVISION_COLORS,
  DIVISION_EMOJI,
  DIVISION_RANGES,
  RANKED_MAX_TILES,
} from '../game/gameConstants';
import { getRankedSeed } from '../game/modeConfig';
import {
  getRankedDivisionInfo,
} from '../game/rankedScoring';
import type { RankedDivision, RankedProfile } from '../game/gameTypes';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { getRankedProfile } from '../storage/gameStorage';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranked'>;

function formatPts(n: number): string {
  return n.toLocaleString();
}

function rangeLabel(division: RankedDivision): string {
  const range = DIVISION_RANGES.find((r) => r.division === division)!;
  if (range.max == null) return `${formatPts(range.min)}+`;
  return `${formatPts(range.min)} – ${formatPts(range.max - 1)}`;
}

export function RankedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<RankedProfile | null>(null);

  const refresh = useCallback(async () => {
    setProfile(await getRankedProfile());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainMenu');
  };

  const playRanked = () => {
    const games = profile?.rankedGamesPlayed ?? 0;
    const seed = getRankedSeed(games + 1);
    navigation.navigate('Gameplay', {
      mode: 'ranked',
      seed,
      officialAttempt: true,
    });
  };

  const info = getRankedDivisionInfo(profile?.rankedPoints ?? 0);
  const nextDivision = DIVISION_RANGES.find((r) => r.min > (profile?.rankedPoints ?? 0));
  const progressTowardNext =
    info.rangeMax == null
      ? info.progressPct
      : Math.min(
          100,
          (((profile?.rankedPoints ?? 0) - info.rangeMin) /
            (info.rangeMax - info.rangeMin)) *
            100,
        );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar title="RANKED" onBack={goBack} accent={colors.electricBlue} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.rankCard,
            { borderColor: withAlpha(info.color, 0.4) },
            neonGlow(info.color, 10),
          ]}
        >
          <Text style={[styles.emblem, { textShadowColor: withAlpha(info.color, 0.7) }]}>
            {info.emoji}
          </Text>
          <Text style={[styles.divisionLabel, { color: info.color }, neonGlow(info.color, 8)]}>
            {info.label}
          </Text>
          <Text style={styles.pointsLine}>
            RANKED POINTS: {formatPts(profile?.rankedPoints ?? 0)}
            {info.rangeMax != null
              ? ` / ${formatPts(info.rangeMax)}`
              : ''}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${progressTowardNext}%`,
                  backgroundColor: info.color,
                },
              ]}
            />
          </View>
          <Text style={styles.metaLine}>
            Season high: {formatPts(profile?.seasonHighPoints ?? 0)}
            {nextDivision
              ? `  ·  Next: ${nextDivision.division.toUpperCase()}`
              : '  ·  Max division'}
          </Text>
          <Text style={styles.metaLine}>
            Win streak: {profile?.currentWinStreak ?? 0}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>DIVISIONS</Text>
        {DIVISION_RANGES.map((d) => {
          const current = d.division === info.division;
          const color = DIVISION_COLORS[d.division];
          return (
            <View
              key={d.division}
              style={[
                styles.divRow,
                {
                  backgroundColor: current
                    ? withAlpha(color, 0.1)
                    : colors.card,
                  borderColor: current ? color : withAlpha(color, 0.2),
                },
                current ? neonGlow(color, 8) : null,
              ]}
            >
              <Text style={styles.divEmoji}>{DIVISION_EMOJI[d.division]}</Text>
              <View style={styles.divText}>
                <Text style={[styles.divName, { color }]}>
                  {d.division.toUpperCase()}
                </Text>
                <Text style={styles.divRange}>{rangeLabel(d.division)} pts</Text>
              </View>
              {current ? (
                <View
                  style={[
                    styles.currentBadge,
                    {
                      backgroundColor: withAlpha(color, 0.2),
                      borderColor: color,
                    },
                  ]}
                >
                  <Text style={[styles.currentBadgeText, { color }]}>
                    CURRENT
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <Text style={styles.sectionLabel}>STATS</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'GAMES', value: profile?.rankedGamesPlayed ?? 0 },
            { label: 'WINS', value: profile?.rankedWins ?? 0 },
            { label: 'LOSSES', value: profile?.rankedLosses ?? 0 },
            { label: 'BEST STREAK', value: profile?.bestWinStreak ?? 0 },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <NeonButton
          label="PLAY RANKED"
          color={colors.electricBlue}
          size="large"
          icon={<Play size={17} color={colors.white} />}
          onPress={playRanked}
        />
        <Text style={styles.explain}>
          Complete a {RANKED_MAX_TILES}-tile run to earn Ranked Points.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill, zIndex: 0 },
  scroll: { padding: 16, gap: 10, paddingBottom: 36, zIndex: 1 },
  rankCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  emblem: {
    fontSize: 50,
    marginBottom: 8,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  divisionLabel: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 28,
    letterSpacing: 3,
  },
  pointsLine: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
    marginBottom: 12,
  },
  barTrack: {
    width: '100%',
    height: 5,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  metaLine: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: 6,
  },
  divRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  divEmoji: { fontSize: 26, width: 36, textAlign: 'center' },
  divText: { flex: 1 },
  divName: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  divRange: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  currentBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currentBadgeText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.18),
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 22,
    color: colors.cyan,
  },
  statLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
    letterSpacing: 1,
  },
  explain: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
});
