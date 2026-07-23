import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Target, Trophy, Zap } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import {
  buildLeaderboardWithLocal,
  DAILY_MOCK_LEADERBOARD,
} from '../data/mockLeaderboard';
import { DAILY_MAX_TILES, TARGET_VALUE } from '../game/gameConstants';
import { getDailySeed, getUtcDateKey } from '../game/modeConfig';
import { useUtcCountdown } from '../hooks/useUtcCountdown';
import type { RootStackParamList } from '../navigation/navigationTypes';
import {
  getTodayOfficialRecord,
  hasCompletedOfficialDailyAttempt,
} from '../storage/gameStorage';
import type { DailyOfficialRecord } from '../game/gameTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Tournament'>;

function formatScore(n: number): string {
  return n.toLocaleString();
}

function formatCompletedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }) + ' UTC';
  } catch {
    return iso;
  }
}

export function TournamentScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { label: countdown } = useUtcCountdown();
  const [officialDone, setOfficialDone] = useState(false);
  const [official, setOfficial] = useState<DailyOfficialRecord | null>(null);
  const [starting, setStarting] = useState(false);

  const refresh = useCallback(async () => {
    const done = await hasCompletedOfficialDailyAttempt();
    const record = await getTodayOfficialRecord();
    setOfficialDone(done);
    setOfficial(record);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const enterOfficial = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const stillAvailable = !(await hasCompletedOfficialDailyAttempt());
      if (!stillAvailable) {
        await refresh();
        return;
      }
      navigation.navigate('Gameplay', {
        mode: 'daily',
        seed: getDailySeed(),
        officialAttempt: true,
      });
    } finally {
      setStarting(false);
    }
  };

  const enterPractice = () => {
    navigation.navigate('Gameplay', {
      mode: 'daily',
      seed: getDailySeed(),
      officialAttempt: false,
    });
  };

  const board = buildLeaderboardWithLocal(
    DAILY_MOCK_LEADERBOARD,
    official?.score ?? null,
  ).slice(0, 4);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainMenu');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar
        title="DAILY TOURNAMENT"
        onBack={goBack}
        accent={colors.orange}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, neonGlow(colors.orange, 8)]}>
          <View style={styles.challengeRow}>
            <View style={styles.challengeText}>
              <Text style={styles.eyebrow}>TODAY'S CHALLENGE</Text>
              <Text style={[styles.challengeTitle, neonGlow(colors.orange, 4)]}>
                BEAT THE TARGET
              </Text>
              <Text style={styles.desc}>
                Score as high as you can with 3 strikes.
              </Text>
              <View style={styles.countdownRow}>
                <View style={styles.liveDot} />
                <Text style={styles.countdown}>{countdown}</Text>
                <Text style={styles.remaining}>REMAINING</Text>
              </View>
            </View>
            <Target size={52} color={withAlpha(colors.orange, 0.5)} />
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaChip}>TARGET {TARGET_VALUE}</Text>
            <Text style={styles.metaChip}>{DAILY_MAX_TILES} TILES</Text>
            <Text style={styles.metaChip}>POWER-UPS DISABLED</Text>
          </View>
          <Text style={styles.dateKey}>UTC {getUtcDateKey()}</Text>
        </View>

        {officialDone && official ? (
          <View style={styles.statusCard}>
            <View style={styles.badgeDone}>
              <Text style={styles.badgeDoneText}>OFFICIAL ATTEMPT COMPLETE</Text>
            </View>
            <Text style={styles.officialScore}>
              {formatScore(official.score)}
            </Text>
            <Text style={styles.completedAt}>
              Completed {formatCompletedAt(official.completedAt)}
            </Text>
            <NeonButton
              label="PRACTICE"
              color={colors.neonPink}
              size="large"
              icon={<Zap size={17} color={colors.white} />}
              onPress={enterPractice}
            />
            <Text style={styles.practiceNote}>
              Practice scores do not replace your official score.
            </Text>
          </View>
        ) : (
          <View style={styles.statusCard}>
            <View style={styles.badgeAvail}>
              <Text style={styles.badgeAvailText}>
                OFFICIAL ATTEMPT AVAILABLE
              </Text>
            </View>
            <NeonButton
              label="ENTER CHALLENGE"
              color={colors.neonPink}
              size="large"
              icon={<Zap size={17} color={colors.white} />}
              onPress={() => void enterOfficial()}
              disabled={starting}
            />
          </View>
        )}

        <Text style={styles.sectionLabel}>LEADERBOARD</Text>
        <Text style={styles.localPreview}>LOCAL PREVIEW</Text>
        {board.map((p) => (
          <View
            key={p.id}
            style={[
              styles.row,
              p.isLocalPlayer && styles.rowYou,
              p.isLocalPlayer ? neonGlow(colors.electricBlue, 8) : null,
            ]}
          >
            <View style={styles.rankWrap}>
              {p.rank <= 3 ? (
                <Trophy
                  size={15}
                  color={
                    p.rank === 1
                      ? colors.yellow
                      : p.rank === 2
                        ? '#C0C0C0'
                        : colors.orange
                  }
                />
              ) : (
                <Text style={styles.rankNum}>{p.rank}</Text>
              )}
            </View>
            <View
              style={[
                styles.avatar,
                {
                  borderColor: p.isLocalPlayer
                    ? colors.electricBlue
                    : withAlpha(colors.purple, 0.4),
                },
              ]}
            />
            <Text
              style={[
                styles.username,
                p.isLocalPlayer && { color: colors.electricBlue },
              ]}
            >
              {p.username}
            </Text>
            <Text
              style={[
                styles.score,
                { color: p.isLocalPlayer ? colors.cyan : colors.yellow },
              ]}
            >
              {formatScore(p.score)}
            </Text>
          </View>
        ))}

        <View style={[styles.rewards, neonGlow(colors.yellow, 6)]}>
          <Text style={styles.rewardsTitle}>REWARDS</Text>
          <View style={styles.rewardRow}>
            {[
              { label: '15K COINS', icon: '⬡', color: colors.yellow },
              { label: '200 GEMS', icon: '◆', color: colors.neonPink },
              { label: 'MYSTERY', icon: '?', color: colors.purple },
            ].map((r) => (
              <View
                key={r.label}
                style={[
                  styles.rewardChip,
                  {
                    backgroundColor: withAlpha(r.color, 0.1),
                    borderColor: withAlpha(r.color, 0.27),
                  },
                ]}
              >
                <Text style={[styles.rewardIcon, { color: r.color }]}>
                  {r.icon}
                </Text>
                <Text style={styles.rewardLabel}>{r.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.displayOnly}>Display-only preview</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill, zIndex: 0 },
  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
    zIndex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.27),
    padding: 16,
  },
  challengeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  challengeText: { flex: 1, paddingRight: 8 },
  eyebrow: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.orange,
    letterSpacing: 2,
    marginBottom: 4,
  },
  challengeTitle: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 16,
    color: colors.white,
  },
  desc: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.muted,
    marginTop: 5,
    lineHeight: 18,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  countdown: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 13,
    color: colors.yellow,
  },
  remaining: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.muted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  metaChip: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.cyan,
    backgroundColor: withAlpha(colors.cyan, 0.1),
    borderWidth: 1,
    borderColor: withAlpha(colors.cyan, 0.25),
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  dateKey: {
    marginTop: 8,
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 11,
    color: colors.muted,
  },
  statusCard: { gap: 12 },
  badgeAvail: {
    alignSelf: 'flex-start',
    backgroundColor: withAlpha(colors.green, 0.15),
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeAvailText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1,
  },
  badgeDone: {
    alignSelf: 'flex-start',
    backgroundColor: withAlpha(colors.electricBlue, 0.15),
    borderWidth: 1,
    borderColor: colors.electricBlue,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDoneText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.electricBlue,
    letterSpacing: 1,
  },
  officialScore: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 32,
    color: colors.white,
  },
  completedAt: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
    marginTop: -6,
  },
  practiceNote: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: 4,
  },
  localPreview: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: withAlpha(colors.yellow, 0.8),
    letterSpacing: 1,
    marginTop: -6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.13),
    borderRadius: 12,
  },
  rowYou: {
    backgroundColor: withAlpha(colors.electricBlue, 0.12),
    borderColor: colors.electricBlue,
  },
  rankWrap: { width: 22, alignItems: 'center' },
  rankNum: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    color: colors.muted,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: withAlpha(colors.purple, 0.45),
    borderWidth: 2,
  },
  username: {
    flex: 1,
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 14,
    color: colors.white,
  },
  score: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 13,
  },
  rewards: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.yellow, 0.27),
    padding: 14,
  },
  rewardsTitle: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.yellow,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 10,
  },
  rewardRow: { flexDirection: 'row', gap: 8 },
  rewardChip: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 9,
    alignItems: 'center',
    gap: 3,
  },
  rewardIcon: { fontSize: 18 },
  rewardLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: colors.muted,
  },
  displayOnly: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 10,
    color: colors.muted,
  },
});
