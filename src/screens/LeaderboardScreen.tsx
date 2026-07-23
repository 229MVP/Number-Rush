import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Trophy, Users } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { BottomNavigation } from '../components/BottomNavigation';
import { GridBackground } from '../components/GridBackground';
import { ScreenTopBar } from '../components/ScreenTopBar';
import {
  buildLeaderboardWithLocal,
  DAILY_MOCK_LEADERBOARD,
  GLOBAL_MOCK_LEADERBOARD,
  WEEKLY_MOCK_LEADERBOARD,
  type RankedLeaderboardRow,
} from '../data/mockLeaderboard';
import { DIVISION_EMOJI } from '../game/gameConstants';
import type { BottomNavRoute, RootStackParamList } from '../navigation/navigationTypes';
import { getRankedProfile, getTodayOfficialRecord } from '../storage/gameStorage';
import { colors, fontFamilies, neonGlow, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

type TabId = 'daily' | 'weekly' | 'global' | 'friends';

const TABS: { id: TabId; label: string }[] = [
  { id: 'daily', label: 'DAILY' },
  { id: 'weekly', label: 'WEEKLY' },
  { id: 'global', label: 'GLOBAL' },
  { id: 'friends', label: 'FRIENDS' },
];

export function LeaderboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabId>('daily');
  const [rows, setRows] = useState<RankedLeaderboardRow[]>([]);

  const refresh = useCallback(async () => {
    const official = await getTodayOfficialRecord();
    const profile = await getRankedProfile();
    if (tab === 'daily') {
      setRows(
        buildLeaderboardWithLocal(
          DAILY_MOCK_LEADERBOARD,
          official?.score ?? null,
          profile.division,
        ),
      );
      return;
    }
    if (tab === 'weekly') {
      setRows(buildLeaderboardWithLocal(WEEKLY_MOCK_LEADERBOARD, null));
      return;
    }
    if (tab === 'global') {
      setRows(buildLeaderboardWithLocal(GLOBAL_MOCK_LEADERBOARD, null));
      return;
    }
    setRows([]);
  }, [tab]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const onBottomNav = (route: BottomNavRoute) => {
    if (route === 'Leaderboard') return;
    navigation.navigate(route);
  };

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

      <ScreenTopBar title="RANKS" onBack={goBack} accent={colors.yellow} />

      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.localPreview}>LOCAL PREVIEW</Text>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'friends' ? (
          <View style={styles.empty}>
            <Users size={36} color={colors.muted} />
            <Text style={styles.emptyTitle}>FRIENDS</Text>
            <Text style={styles.emptyDesc}>
              Add friends to compare scores.
            </Text>
          </View>
        ) : (
          rows.map((p) => (
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
              <View style={styles.avatar} />
              <View style={styles.nameCol}>
                <Text
                  style={[
                    styles.username,
                    p.isLocalPlayer && { color: colors.electricBlue },
                  ]}
                >
                  {p.username}
                </Text>
                <Text style={styles.division}>
                  {DIVISION_EMOJI[p.division]} {p.division.toUpperCase()}
                </Text>
              </View>
              <Text
                style={[
                  styles.score,
                  { color: p.isLocalPlayer ? colors.cyan : colors.yellow },
                ]}
              >
                {p.score.toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNavigation activeRoute="Leaderboard" onNavigate={onBottomNav} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill, zIndex: 0 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
    zIndex: 2,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.2),
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  tabActive: {
    borderColor: colors.yellow,
    backgroundColor: withAlpha(colors.yellow, 0.12),
  },
  tabText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: colors.yellow,
  },
  localPreview: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: withAlpha(colors.yellow, 0.85),
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 8,
    zIndex: 2,
  },
  scroll: {
    padding: 16,
    gap: 8,
    paddingBottom: 24,
    zIndex: 1,
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
    backgroundColor: withAlpha(colors.purple, 0.4),
    borderWidth: 2,
    borderColor: withAlpha(colors.purple, 0.35),
  },
  nameCol: { flex: 1 },
  username: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 14,
    color: colors.white,
  },
  division: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  score: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 2,
  },
  emptyDesc: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
});
