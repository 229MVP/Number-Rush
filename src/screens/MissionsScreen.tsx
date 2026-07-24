import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { BottomNavigation } from '../components/BottomNavigation';
import { GridBackground } from '../components/GridBackground';
import { ScreenTopBar } from '../components/ScreenTopBar';
import type { MissionDefinition } from '../missions/missionTypes';
import type { BottomNavRoute, RootStackParamList } from '../navigation/navigationTypes';
import {
  claimMissionReward,
  countClaimableMissions,
  getActiveMissionDefinitions,
  getDailyMissionState,
  getWeeklyMissionState,
} from '../storage/missionStorage';
import type { MissionPeriodState } from '../missions/missionTypes';
import {
  formatCountdown,
  msUntilNextUtcMidnight,
  msUntilNextUtcWeek,
} from '../utils/missionCountdown';
import { useOptionalAudio } from '../audio/AudioProvider';
import { useOptionalHaptics } from '../haptics/HapticsProvider';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Missions'>;
type Tab = 'daily' | 'weekly';

function rewardLabel(def: MissionDefinition): string {
  const parts: string[] = [];
  if (def.reward.coins > 0) parts.push(`${def.reward.coins} ⬡`);
  if (def.reward.gems > 0) parts.push(`${def.reward.gems} ◆`);
  if (def.reward.xp > 0) parts.push(`${def.reward.xp} XP`);
  if (def.reward.inventory) {
    Object.entries(def.reward.inventory).forEach(([k, v]) => {
      if (v && v > 0) parts.push(`+${v} ${k}`);
    });
  }
  return parts.join(' · ') || 'Reward';
}

export function MissionsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const audio = useOptionalAudio();
  const haptics = useOptionalHaptics();
  const [tab, setTab] = useState<Tab>('daily');
  const [daily, setDaily] = useState<MissionPeriodState | null>(null);
  const [weekly, setWeekly] = useState<MissionPeriodState | null>(null);
  const [claimable, setClaimable] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [d, w, c] = await Promise.all([
      getDailyMissionState(),
      getWeeklyMissionState(),
      countClaimableMissions(),
    ]);
    setDaily(d);
    setWeekly(w);
    setClaimable(c);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    const tick = () => {
      const ms =
        tab === 'daily' ? msUntilNextUtcMidnight() : msUntilNextUtcWeek();
      setCountdown(formatCountdown(ms));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [tab]);

  const defs = useMemo(
    () => getActiveMissionDefinitions(tab).definitions,
    [tab],
  );
  const state = tab === 'daily' ? daily : weekly;

  const onClaim = async (missionId: string) => {
    if (claimingId) return;
    setClaimingId(missionId);
    try {
      const result = await claimMissionReward(tab, missionId);
      if (result.ok) {
        audio?.playSound('missionClaim');
        haptics?.success();
      }
      await refresh();
    } finally {
      setClaimingId(null);
    }
  };

  const onBottomNav = (route: BottomNavRoute) => {
    if (route === 'Missions') return;
    navigation.navigate(route);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="screen-missions">
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar
        title="MISSIONS"
        accent={colors.neonPink}
        onBack={() => navigation.navigate('MainMenu')}
      />

      <View style={styles.tabs}>
        {(['daily', 'weekly'] as Tab[]).map((t) => {
          const on = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tab,
                on && styles.tabOn,
                on ? neonGlow(colors.neonPink, 4) : null,
              ]}
            >
              <Text style={[styles.tabText, on && styles.tabTextOn]}>
                {t.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.countdown}>
        Resets in {countdown || '…'}
      </Text>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {defs.map((def) => {
          const prog = state?.missions.find((m) => m.missionId === def.id);
          const progress = prog?.progress ?? 0;
          const completed = prog?.completed ?? false;
          const claimed = prog?.claimed ?? false;
          const accent = claimed
            ? colors.muted
            : completed
              ? colors.green
              : colors.electricBlue;
          return (
            <View
              key={def.id}
              style={[
                styles.card,
                { borderColor: withAlpha(accent, 0.4) },
                completed && !claimed ? neonGlow(colors.cyan, 8) : null,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardText}>
                  <Text style={[styles.title, { color: accent }]}>
                    {def.title}
                  </Text>
                  <Text style={styles.desc}>{def.description}</Text>
                </View>
                {claimed ? (
                  <View style={styles.claimedBadge}>
                    <Check size={12} color={colors.muted} />
                    <Text style={styles.claimedText}>CLAIMED</Text>
                  </View>
                ) : completed ? (
                  <Pressable
                    disabled={claimingId === def.id}
                    onPress={() => void onClaim(def.id)}
                    style={[styles.claimBtn, neonGlow(colors.green, 6)]}
                  >
                    <Text style={styles.claimText}>CLAIM</Text>
                  </Pressable>
                ) : (
                  <View style={styles.rewardChip}>
                    <Text style={[styles.rewardText, { color: accent }]}>
                      {rewardLabel(def)}
                    </Text>
                  </View>
                )}
              </View>
              {!claimed ? (
                <>
                  <Text style={styles.progressLabel}>
                    {progress.toLocaleString()} / {def.target.toLocaleString()}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.min(100, (progress / def.target) * 100)}%`,
                          backgroundColor: accent,
                        },
                      ]}
                    />
                  </View>
                </>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <BottomNavigation
        activeRoute="Missions"
        onNavigate={onBottomNav}
        missionsBadgeCount={claimable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.13),
    alignItems: 'center',
  },
  tabOn: {
    backgroundColor: withAlpha(colors.neonPink, 0.13),
    borderColor: colors.neonPink,
  },
  tabText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.muted,
  },
  tabTextOn: { color: colors.neonPink },
  countdown: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardText: { flex: 1, gap: 2 },
  title: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 13,
  },
  desc: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 11,
    color: colors.muted,
  },
  rewardChip: {
    backgroundColor: withAlpha(colors.electricBlue, 0.12),
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.35),
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  rewardText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
  },
  claimBtn: {
    backgroundColor: withAlpha(colors.green, 0.16),
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  claimText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 9,
    color: colors.green,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.7,
  },
  claimedText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 9,
    color: colors.muted,
  },
  progressLabel: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 10,
    color: colors.muted,
  },
  barTrack: {
    height: 5,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
});
