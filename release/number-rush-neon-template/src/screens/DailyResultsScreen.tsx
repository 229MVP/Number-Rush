import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Home, RotateCcw, Star, Zap } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { RewardSummaryCard } from '../components/RewardSummaryCard';
import { useOptionalAudio } from '../audio/AudioProvider';
import { getDailySeed } from '../game/dailyTournament';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { AppliedRunReward } from '../progression/progressionTypes';
import { applyRunRewardsOnce } from '../progression/applyRunRewards';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyResults'>;

function formatScore(n: number): string {
  return n.toLocaleString();
}

function reasonLabel(reason: Props['route']['params']['completionReason']): string {
  if (reason === 'tileLimit') return 'Tile limit';
  if (reason === 'quit') return 'Forfeit';
  return 'Strikes';
}

export function DailyResultsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const audio = useOptionalAudio();
  const p = route.params;

  useEffect(() => {
    void audio?.playMusic('results');
    audio?.playSound('reward');
  }, [audio]);
  const isOfficial = p.officialAttempt;
  const headline = isOfficial ? 'DAILY COMPLETE' : 'PRACTICE COMPLETE';
  const headlineColor = isOfficial ? colors.orange : colors.cyan;
  const [reward, setReward] = useState<AppliedRunReward | null>(null);
  const [loadingReward, setLoadingReward] = useState(true);
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;
    let cancelled = false;
    void (async () => {
      try {
        const result = await applyRunRewardsOnce({
          mode: 'daily',
          score: p.score,
          perfectClears: p.perfectClears,
          officialAttempt: p.officialAttempt,
          calculatedRank: p.calculatedRank,
          transactionId: p.rewardKey,
          maxComboMultiplier: p.maxComboMultiplier,
          longestPerfectStreak: p.longestPerfectStreak,
          tilesPlaced: p.tilesPlaced,
        });
        if (!cancelled) setReward(result);
      } finally {
        if (!cancelled) setLoadingReward(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [p]);

  const startPractice = () => {
    navigation.replace('Gameplay', {
      mode: 'daily',
      seed: getDailySeed(p.dateKey),
      officialAttempt: false,
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground intensity="menu" />
        <View
          style={[styles.radial, { backgroundColor: withAlpha(headlineColor, 0.12) }]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.headline,
            { color: headlineColor },
            neonGlow(headlineColor, 14),
          ]}
        >
          {headline}
        </Text>

        {p.isNewDailyBest ? (
          <Text style={[styles.newBest, neonGlow(colors.yellow, 8)]}>
            NEW DAILY BEST!
          </Text>
        ) : null}

        <Text style={styles.submitBadge}>
          {isOfficial
            ? 'OFFICIAL SCORE SUBMITTED'
            : 'PRACTICE SCORE — NOT SUBMITTED'}
        </Text>

        <Text style={[styles.score, neonGlow(colors.white, 4)]}>
          {formatScore(p.score)}
        </Text>

        {p.calculatedRank != null ? (
          <Text style={styles.rankLine}>
            Local rank #{p.calculatedRank}
          </Text>
        ) : null}

        <View style={styles.statsRow}>
          {[
            { label: 'PERFECTS', value: String(p.perfectClears), color: colors.green },
            {
              label: 'MAX COMBO',
              value: `x${p.maxComboMultiplier}`,
              color: colors.cyan,
            },
            {
              label: 'STREAK',
              value: String(p.longestPerfectStreak),
              color: colors.orange,
            },
          ].map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, { borderColor: withAlpha(s.color, 0.35) }]}
            >
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <InfoLine label="Tiles placed" value={String(p.tilesPlaced)} />
          <InfoLine label="Strikes used" value={String(p.strikesUsed)} />
          <InfoLine label="Completed by" value={reasonLabel(p.completionReason)} />
          <InfoLine
            label="Official score"
            value={
              p.officialScore != null ? formatScore(p.officialScore) : '—'
            }
          />
          <InfoLine
            label="Practice best"
            value={
              p.practiceBest != null ? formatScore(p.practiceBest) : '—'
            }
          />
          <InfoLine
            label="All-time Daily best"
            value={p.allTimeBest != null ? formatScore(p.allTimeBest) : '—'}
          />
        </View>

        <RewardSummaryCard result={reward} loading={loadingReward} />

        <View style={styles.actions}>
          <NeonButton
            label={isOfficial ? 'PRACTICE' : 'PRACTICE AGAIN'}
            color={colors.neonPink}
            size="large"
            icon={
              isOfficial ? (
                <Zap size={17} color={colors.white} />
              ) : (
                <RotateCcw size={17} color={colors.white} />
              )
            }
            onPress={startPractice}
          />
          <NeonButton
            label="DAILY TOURNAMENT"
            color={colors.orange}
            icon={<Star size={15} color={colors.white} />}
            onPress={() => navigation.navigate('Tournament')}
          />
          <NeonButton
            label="MAIN MENU"
            color={colors.muted}
            icon={<Home size={15} color={colors.white} />}
            onPress={() => navigation.navigate('MainMenu')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill, zIndex: 0 },
  radial: { ...StyleSheet.absoluteFill, opacity: 0.9 },
  scroll: {
    padding: 16,
    alignItems: 'center',
    gap: 12,
    paddingBottom: 40,
    zIndex: 1,
  },
  headline: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 28,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 12,
  },
  newBest: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 14,
    color: colors.yellow,
    letterSpacing: 2,
  },
  submitBadge: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1.5,
  },
  score: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 42,
    color: colors.white,
  },
  rankLine: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    color: colors.cyan,
  },
  statsRow: { flexDirection: 'row', gap: 10, width: '100%' },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 20,
  },
  statLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: colors.muted,
    marginTop: 4,
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.25),
    padding: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.muted,
  },
  infoValue: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 13,
    color: colors.white,
  },
  actions: { width: '100%', gap: 10, marginTop: 4 },
});
