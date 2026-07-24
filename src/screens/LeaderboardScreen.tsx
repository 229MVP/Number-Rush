import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { BottomNavigation } from '../components/BottomNavigation';
import { GridBackground } from '../components/GridBackground';
import {
  fetchRankedLeaderboard,
  type RankedLeaderboardResult,
} from '../backend/rankedLeaderboardService';
import { liveRankedEnabled } from '../config/featureFlags';
import { useAuth } from '../hooks/useAuth';
import type { BottomNavRoute, RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

const ACCENT = colors.yellow;

export function LeaderboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState<RankedLeaderboardResult | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setBoard(await fetchRankedLeaderboard({ limit: 25 }));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const onBottomNav = (route: BottomNavRoute) => {
    if (route === 'Leaderboard') return;
    navigation.navigate(route);
  };

  const live =
    liveRankedEnabled && isAuthenticated && board?.mode === 'live';
  const label = live ? 'LIVE RANKED' : 'LOCAL PREVIEW';

  return (
    <View
      style={[styles.root, { paddingTop: insets.top }]}
      testID="screen-leaderboard"
    >
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <View style={styles.header}>
        <Text style={[styles.heading, neonGlow(ACCENT, 4)]}>RANKS</Text>
        <Text style={styles.sub}>{label}</Text>
      </View>

      {!isAuthenticated && liveRankedEnabled ? (
        <Text style={styles.prompt} onPress={() => navigation.navigate('SignIn')}>
          Sign in for live leaderboards →
        </Text>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={ACCENT} />
        ) : (
          board?.entries.map((row) => (
            <View
              key={row.id}
              style={[
                styles.row,
                row.isLocalPlayer && styles.rowYou,
                row.isLocalPlayer ? neonGlow(ACCENT, 5) : null,
              ]}
            >
              <View style={styles.rankWrap}>
                {row.rank <= 3 ? (
                  <Trophy
                    size={15}
                    color={
                      row.rank === 1
                        ? colors.yellow
                        : row.rank === 2
                          ? '#C0C0C0'
                          : colors.orange
                    }
                  />
                ) : (
                  <Text style={styles.rankNum}>{row.rank}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.username,
                  row.isLocalPlayer && { color: ACCENT },
                ]}
              >
                {row.username}
              </Text>
              <Text style={styles.score}>
                {row.rankedPoints.toLocaleString()} RP
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
  decor: { ...StyleSheet.absoluteFill },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  heading: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    color: colors.white,
    letterSpacing: 2,
  },
  sub: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    letterSpacing: 2,
    color: withAlpha(ACCENT, 0.85),
  },
  prompt: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.cyan,
    textAlign: 'center',
    marginBottom: 4,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: withAlpha(ACCENT, 0.13),
    borderRadius: 12,
  },
  rowYou: {
    backgroundColor: withAlpha(ACCENT, 0.1),
    borderColor: ACCENT,
  },
  rankWrap: { width: 22, alignItems: 'center' },
  rankNum: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    color: colors.muted,
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
    color: colors.yellow,
  },
});
