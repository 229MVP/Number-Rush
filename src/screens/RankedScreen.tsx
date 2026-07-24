import React, { useCallback, useEffect, useState } from 'react';
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
import { Swords, Trophy } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import {
  fetchRankedLeaderboard,
  type RankedLeaderboardRow,
  type RankedLeaderboardResult,
} from '../backend/rankedLeaderboardService';
import { issueRankedRunTicket } from '../backend/rankedTicketService';
import { liveRankedEnabled } from '../config/featureFlags';
import { useAuth } from '../hooks/useAuth';
import { useCurrentSeason } from '../hooks/useCurrentSeason';
import type { GameMode } from '../game/gameTypes';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { trackEvent } from '../analytics/analyticsService';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranked'>;

const ACCENT = colors.electricBlue;

function modeBanner(mode: RankedLeaderboardResult['mode']): string {
  switch (mode) {
    case 'live':
      return 'LIVE LEADERBOARD';
    case 'guest':
      return 'SIGN IN FOR LIVE RANKED';
    case 'offline':
      return 'OFFLINE PREVIEW';
    default:
      return 'LOCAL PREVIEW';
  }
}

export function RankedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { season } = useCurrentSeason();
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState<RankedLeaderboardResult | null>(null);
  const [playBusy, setPlayBusy] = useState(false);
  const [playNote, setPlayNote] = useState<string | null>(null);

  useEffect(() => {
    if (season) trackEvent('season_viewed', { seasonKey: season.seasonKey });
  }, [season]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchRankedLeaderboard({ limit: 50 });
      setBoard(result);
    } finally {
      setLoading(false);
    }
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

  const rankedModeSupported = (['ranked'] as GameMode[]).includes('ranked');

  const handlePlayRanked = async () => {
    if (playBusy) return;
    if (!liveRankedEnabled || !isAuthenticated) {
      navigation.navigate('SignIn');
      return;
    }
    setPlayBusy(true);
    setPlayNote(null);
    try {
      const ticketResult = await issueRankedRunTicket();
      if (!ticketResult.ok) {
        if (ticketResult.mode === 'guest') {
          navigation.navigate('SignIn');
          return;
        }
        setPlayNote('Ranked matchmaking unavailable. Try again later.');
        return;
      }
      if (!rankedModeSupported) {
        setPlayNote('Ranked play enabled after mode wiring.');
        return;
      }
      navigation.navigate('Gameplay', {
        mode: 'ranked',
        seed: ticketResult.ticket.seed,
      });
    } finally {
      setPlayBusy(false);
    }
  };

  const showLive =
    liveRankedEnabled && isAuthenticated && board?.mode === 'live';
  const entries: RankedLeaderboardRow[] = board?.entries ?? [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="screen-ranked">
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar title="RANKED" accent={ACCENT} onBack={goBack} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, neonGlow(ACCENT, 6)]}>
          <Swords size={40} color={ACCENT} />
          <Text style={styles.heroTitle}>SEASON RANKED</Text>
          {season ? (
            <Text style={styles.heroDesc}>
              {season.name} · ends {season.endsAt.slice(0, 10)} · {season.status}
            </Text>
          ) : (
            <Text style={styles.heroDesc}>
              Climb divisions with verified ranked runs.
            </Text>
          )}
        </View>

        {showLive ? (
          <NeonButton
            testID="ranked-play"
            label={playBusy ? 'STARTING…' : 'PLAY RANKED'}
            color={colors.neonPink}
            size="large"
            icon={<Swords size={17} color={colors.white} />}
            disabled={playBusy}
            onPress={() => void handlePlayRanked()}
          />
        ) : liveRankedEnabled && !isAuthenticated ? (
          <NeonButton
            label="SIGN IN TO PLAY RANKED"
            color={ACCENT}
            size="large"
            onPress={() => navigation.navigate('SignIn')}
          />
        ) : (
          <View style={styles.comingWrap}>
            <Text style={styles.comingLabel}>COMING SOON</Text>
            {liveRankedEnabled && isAuthenticated && rankedModeSupported ? (
              <NeonButton
                label={playBusy ? '…' : 'PLAY RANKED'}
                color={ACCENT}
                size="normal"
                disabled={playBusy}
                onPress={() => void handlePlayRanked()}
              />
            ) : null}
          </View>
        )}

        {playNote ? <Text style={styles.note}>{playNote}</Text> : null}

        <Text style={styles.sectionLabel}>
          {board ? modeBanner(board.mode) : 'LEADERBOARD'}
        </Text>

        {loading ? (
          <ActivityIndicator color={ACCENT} />
        ) : (
          entries.map((row) => (
            <View
              key={row.id}
              style={[
                styles.row,
                row.isLocalPlayer && styles.rowYou,
                row.isLocalPlayer ? neonGlow(ACCENT, 6) : null,
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
              <View style={styles.rowMeta}>
                <Text
                  style={[
                    styles.username,
                    row.isLocalPlayer && { color: ACCENT },
                  ]}
                >
                  {row.username}
                </Text>
                <Text style={styles.subMeta}>
                  {row.division} {row.subdivision} · {row.wins}W / {row.losses}L
                </Text>
              </View>
              <Text style={[styles.rp, neonGlow(colors.yellow, 3)]}>
                {row.rankedPoints.toLocaleString()} RP
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  scroll: { padding: 16, gap: 12, paddingBottom: 36 },
  hero: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(ACCENT, 0.3),
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 18,
    letterSpacing: 2,
    color: colors.white,
  },
  heroDesc: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  comingWrap: { alignItems: 'center', gap: 8 },
  comingLabel: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    letterSpacing: 2,
    color: withAlpha(ACCENT, 0.75),
  },
  note: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.orange,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: 8,
  },
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
    backgroundColor: withAlpha(ACCENT, 0.12),
    borderColor: ACCENT,
  },
  rankWrap: { width: 22, alignItems: 'center' },
  rankNum: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    color: colors.muted,
  },
  rowMeta: { flex: 1, gap: 2 },
  username: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 14,
    color: colors.white,
  },
  subMeta: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 10,
    color: colors.muted,
  },
  rp: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    color: colors.yellow,
  },
});
