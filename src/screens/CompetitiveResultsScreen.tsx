import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Home, RotateCcw, Star, Trophy } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { DIVISION_EMOJI } from '../game/gameConstants';
import { getDailySeed, getRankedSeed } from '../game/modeConfig';
import { getRankedDivisionInfo } from '../game/rankedScoring';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { getRankedProfile } from '../storage/gameStorage';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitiveResults'>;

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function formatScore(n: number): string {
  return n.toLocaleString();
}

export function CompetitiveResultsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const result = route.params;
  const isDaily = result.mode === 'daily';
  const isPractice = Boolean(result.isPractice);
  const promoted =
    result.previousDivision != null &&
    result.newDivision != null &&
    result.previousDivision !== result.newDivision &&
    (result.newRankedPoints ?? 0) > (result.previousRankedPoints ?? 0);
  const demoted =
    result.previousDivision != null &&
    result.newDivision != null &&
    result.previousDivision !== result.newDivision &&
    (result.newRankedPoints ?? 0) < (result.previousRankedPoints ?? 0);

  const burst = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!promoted && !demoted) return;
    burst.setValue(0);
    Animated.sequence([
      Animated.timing(burst, {
        toValue: 1,
        duration: 450,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(burst, {
        toValue: 0.35,
        duration: 600,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [promoted, demoted, burst]);

  const headline = (() => {
    if (isDaily) {
      return isPractice ? 'PRACTICE COMPLETE' : 'DAILY COMPLETE';
    }
    if (result.rankedOutcome === 'win') return 'RANKED WIN';
    if (result.rankedOutcome === 'draw') return 'RANKED DRAW';
    return 'RANKED LOSS';
  })();

  const headlineColor = (() => {
    if (isDaily) return isPractice ? colors.cyan : colors.orange;
    if (result.rankedOutcome === 'win') return colors.green;
    if (result.rankedOutcome === 'draw') return colors.yellow;
    return colors.red;
  })();

  const playDailyPractice = () => {
    navigation.replace('Gameplay', {
      mode: 'daily',
      seed: getDailySeed(),
      officialAttempt: false,
    });
  };

  const playRankedAgain = async () => {
    const profile = await getRankedProfile();
    const seed = getRankedSeed(profile.rankedGamesPlayed + 1);
    navigation.replace('Gameplay', {
      mode: 'ranked',
      seed,
      officialAttempt: true,
    });
  };

  const prevInfo =
    result.previousDivision != null
      ? getRankedDivisionInfo(result.previousRankedPoints ?? 0)
      : null;
  const nextInfo =
    result.newDivision != null
      ? getRankedDivisionInfo(result.newRankedPoints ?? 0)
      : null;

  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: 8 + ((i * 7) % 84),
    top: 8 + ((i * 11) % 40),
    color: [colors.yellow, colors.orange, colors.cyan, colors.green][i % 4],
  }));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground intensity="menu" />
        <View
          style={[
            styles.radial,
            {
              backgroundColor: withAlpha(headlineColor, 0.12),
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {(promoted || demoted) && (
          <View style={styles.promoWrap}>
            {particles.map((p) => (
              <Animated.View
                key={p.id}
                style={[
                  styles.particle,
                  {
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    backgroundColor: p.color,
                    opacity: burst,
                    transform: [
                      {
                        scale: burst.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.4, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
            <Text
              style={[
                styles.promoTitle,
                {
                  color: promoted ? colors.yellow : colors.red,
                },
                neonGlow(promoted ? colors.yellow : colors.red, 12),
              ]}
            >
              {promoted ? 'PROMOTED!' : 'DIVISION DOWN'}
            </Text>
            <View style={styles.promoRow}>
              <Text style={styles.promoDiv}>
                {prevInfo
                  ? `${DIVISION_EMOJI[prevInfo.division]} ${prevInfo.label}`
                  : result.previousDivision}
              </Text>
              <Text style={styles.promoArrow}>→</Text>
              <Text
                style={[
                  styles.promoDiv,
                  { color: promoted ? colors.yellow : colors.muted },
                ]}
              >
                {nextInfo
                  ? `${DIVISION_EMOJI[nextInfo.division]} ${nextInfo.label}`
                  : result.newDivision}
              </Text>
            </View>
          </View>
        )}

        <Text style={[styles.headline, { color: headlineColor }, neonGlow(headlineColor, 14)]}>
          {headline}
        </Text>

        {result.isNewDailyBest ? (
          <Text style={[styles.newBest, neonGlow(colors.yellow, 6)]}>
            ★ NEW DAILY BEST ★
          </Text>
        ) : null}

        <Text style={[styles.score, neonGlow(colors.white, 4)]}>
          {formatScore(result.score)}
        </Text>

        <View style={styles.statsRow}>
          {[
            {
              label: 'PERFECTS',
              value: String(result.perfectClears),
              color: colors.green,
            },
            {
              label: 'MAX COMBO',
              value: `x${result.maxComboMultiplier}`,
              color: colors.cyan,
            },
            {
              label: 'TILES',
              value: String(result.tilesPlaced),
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

        {isDaily ? (
          <View style={styles.infoCard}>
            {result.dailyRank != null ? (
              <Text style={styles.infoLine}>
                Official rank: #{result.dailyRank} (local preview)
              </Text>
            ) : null}
            {result.bestDailyScore != null ? (
              <Text style={styles.infoLine}>
                Best Daily score: {formatScore(result.bestDailyScore)}
              </Text>
            ) : null}
            {isPractice ? (
              <Text style={styles.infoLine}>
                Practice — official score unchanged
              </Text>
            ) : null}
          </View>
        ) : null}

        {!isDaily && result.rankedBreakdown ? (
          <View style={[styles.breakdown, neonGlow(colors.electricBlue, 6)]}>
            <Text style={styles.breakdownTitle}>POINT BREAKDOWN</Text>
            <BreakdownRow
              label="Base result"
              value={result.rankedBreakdown.basePoints}
            />
            <BreakdownRow
              label="Survival bonus"
              value={result.rankedBreakdown.survivalBonus}
            />
            <BreakdownRow
              label="Combo bonus"
              value={result.rankedBreakdown.comboBonus}
            />
            <BreakdownRow
              label="Perfect bonus"
              value={result.rankedBreakdown.perfectBonus}
            />
            <View style={styles.breakdownDivider} />
            <BreakdownRow
              label="Total Ranked Points"
              value={result.rankedBreakdown.total}
              strong
            />
            <Text style={styles.rpLine}>
              {formatScore(result.previousRankedPoints ?? 0)} →{' '}
              {formatScore(result.newRankedPoints ?? 0)} RP
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {isDaily ? (
            <>
              <NeonButton
                label="PRACTICE AGAIN"
                color={colors.neonPink}
                size="large"
                icon={<RotateCcw size={17} color={colors.white} />}
                onPress={playDailyPractice}
              />
              <NeonButton
                label="DAILY TOURNAMENT"
                color={colors.orange}
                icon={<Star size={15} color={colors.white} />}
                onPress={() => navigation.navigate('Tournament')}
              />
            </>
          ) : (
            <>
              <NeonButton
                label="PLAY RANKED AGAIN"
                color={colors.electricBlue}
                size="large"
                icon={<RotateCcw size={17} color={colors.white} />}
                onPress={() => void playRankedAgain()}
              />
              <NeonButton
                label="RANKED LOBBY"
                color={colors.purple}
                icon={<Trophy size={15} color={colors.white} />}
                onPress={() => navigation.navigate('Ranked')}
              />
            </>
          )}
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

function BreakdownRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  const sign = value > 0 ? '+' : '';
  return (
    <View style={styles.bdRow}>
      <Text style={[styles.bdLabel, strong && styles.bdStrong]}>{label}</Text>
      <Text
        style={[
          styles.bdValue,
          strong && styles.bdStrong,
          {
            color:
              value > 0 ? colors.green : value < 0 ? colors.red : colors.muted,
          },
        ]}
      >
        {sign}
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill, zIndex: 0 },
  radial: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  scroll: {
    padding: 16,
    alignItems: 'center',
    gap: 14,
    paddingBottom: 40,
    zIndex: 1,
  },
  promoWrap: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  particle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  promoTitle: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 28,
    letterSpacing: 2,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  promoDiv: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    color: colors.white,
  },
  promoArrow: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 18,
    color: colors.yellow,
  },
  headline: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 28,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
  },
  newBest: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 13,
    color: colors.yellow,
    letterSpacing: 2,
  },
  score: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 40,
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
    letterSpacing: 0.5,
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.3),
    padding: 14,
    gap: 6,
  },
  infoLine: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  breakdown: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.3),
    padding: 14,
    gap: 6,
  },
  breakdownTitle: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.electricBlue,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 6,
  },
  bdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bdLabel: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.muted,
  },
  bdValue: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 13,
  },
  bdStrong: {
    color: colors.white,
    fontSize: 14,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: withAlpha(colors.electricBlue, 0.2),
    marginVertical: 4,
  },
  rpLine: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.cyan,
    textAlign: 'center',
    marginTop: 6,
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
});
