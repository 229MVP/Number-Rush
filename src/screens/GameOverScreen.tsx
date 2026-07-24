import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Heart, Home, RotateCcw } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { PerspectiveGrid } from '../components/PerspectiveGrid';
import { RewardSummaryCard } from '../components/RewardSummaryCard';
import { useOptionalAudio } from '../audio/AudioProvider';
import { evaluateInterstitialEligibility } from '../ads/interstitialPolicy';
import { interstitialAdsEnabled, rewardedAdsEnabled } from '../config/featureFlags';
import { useAds } from '../hooks/useAds';
import { usePurchases } from '../hooks/usePurchases';
import { useConsent } from '../hooks/useConsent';
import type { RootStackParamList } from '../navigation/navigationTypes';
import type { AppliedRunReward } from '../progression/progressionTypes';
import { applyRunRewardsOnce } from '../progression/applyRunRewards';
import {
  applyEconomyTransaction,
  createTransactionId,
} from '../storage/playerStorage';
import {
  hasDoubleCoinsClaimed,
  markDoubleCoinsClaimed,
  readAdFrequencyState,
  recordClassicRunComplete,
  recordInterstitialShown,
} from '../storage/adFrequencyStorage';
import { colors, fontFamilies, neonGlow, radii, spacing, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

export function GameOverScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const audio = useOptionalAudio();
  const ads = useAds();
  const { entitlements } = usePurchases();
  const { canRequestAds } = useConsent();

  useEffect(() => {
    void audio?.playMusic('results');
    audio?.playSound('reward');
  }, [audio]);
  const {
    finalScore,
    bestScore,
    maxComboMultiplier,
    longestPerfectStreak,
    perfectClears,
    tilesPlaced,
    isNewBest,
    rewardKey,
    multipliersUsed,
    swapsUsed,
  } = route.params;

  const [reward, setReward] = useState<AppliedRunReward | null>(null);
  const [loadingReward, setLoadingReward] = useState(true);
  const [doubleBusy, setDoubleBusy] = useState(false);
  const [doubleClaimed, setDoubleClaimed] = useState(false);
  const [navBusy, setNavBusy] = useState(false);
  const appliedRef = useRef(false);
  const classicRunRecordedRef = useRef(false);

  useEffect(() => {
    if (classicRunRecordedRef.current) return;
    classicRunRecordedRef.current = true;
    void recordClassicRunComplete();
  }, []);

  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;
    let cancelled = false;
    void (async () => {
      try {
        const result = await applyRunRewardsOnce({
          mode: 'classic',
          score: finalScore,
          perfectClears,
          transactionId: rewardKey,
          maxComboMultiplier,
          longestPerfectStreak,
          tilesPlaced,
          multipliersUsed,
          swapsUsed,
        });
        if (!cancelled) setReward(result);
        const freq = await readAdFrequencyState();
        if (!cancelled) {
          setDoubleClaimed(hasDoubleCoinsClaimed(freq, rewardKey));
        }
      } finally {
        if (!cancelled) setLoadingReward(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    finalScore,
    perfectClears,
    rewardKey,
    maxComboMultiplier,
    longestPerfectStreak,
    tilesPlaced,
    multipliersUsed,
    swapsUsed,
  ]);

  const showDoubleCoins =
    rewardedAdsEnabled &&
    ads.adsAvailable &&
    !doubleClaimed &&
    reward != null &&
    reward.reward.coins > 0;

  const watchDoubleCoins = () => {
    if (doubleBusy || !reward) return;
    setDoubleBusy(true);
    void (async () => {
      try {
        const result = await ads.showRewarded({
          placement: 'double_classic_coins',
          opportunityId: rewardKey,
        });
        if (!result.earned) return;
        const bonusCoins = reward.reward.coins;
        await applyEconomyTransaction({
          id: createTransactionId(`double-coins-${rewardKey}`),
          type: 'rewarded_ad_bonus',
          coinsDelta: bonusCoins,
          gemsDelta: 0,
          source: 'double_coins_ad',
          createdAt: new Date().toISOString(),
        });
        await markDoubleCoinsClaimed(rewardKey);
        setDoubleClaimed(true);
        setReward((prev) =>
          prev
            ? {
                ...prev,
                reward: {
                  ...prev.reward,
                  coins: prev.reward.coins + bonusCoins,
                },
              }
            : prev,
        );
        audio?.playSound('reward');
      } finally {
        setDoubleBusy(false);
      }
    })();
  };

  const navigateAfterInterstitial = useCallback(
    (action: () => void) => {
      if (navBusy) return;
      setNavBusy(true);
      void (async () => {
        try {
          const nowMs = Date.now();
          const frequency = await readAdFrequencyState();
          const eligibility = evaluateInterstitialEligibility({
            nowMs,
            frequency,
            entitlements,
            interstitialAdsEnabled,
            canRequestAds,
            modeIsClassic: true,
          });
          if (eligibility.eligible) {
            const shown = await ads.showInterstitial('classic_run_complete');
            if (shown.shown) {
              await recordInterstitialShown(nowMs);
            }
          }
        } finally {
          setNavBusy(false);
          action();
        }
      })();
    },
    [ads, canRequestAds, entitlements, navBusy],
  );

  const stats = [
    { label: 'MAX COMBO', value: `x${maxComboMultiplier}`, color: colors.cyan },
    { label: 'PERFECT TILES', value: String(perfectClears), color: colors.green },
    { label: 'TILES PLACED', value: String(tilesPlaced), color: colors.orange },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]} testID="game-over-screen">
      <View style={[styles.decorLayer, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <View style={styles.redGlow} />
        <AnimatedNeonBackground intensity="menu" />
        <PerspectiveGrid />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

        <RewardSummaryCard result={reward} loading={loadingReward} />

        {showDoubleCoins ? (
          <NeonButton
            testID="double-coins-ad"
            label={doubleBusy ? 'LOADING AD…' : 'DOUBLE COINS'}
            color={colors.yellow}
            size="large"
            disabled={doubleBusy}
            onPress={watchDoubleCoins}
          />
        ) : null}

        <View style={styles.actions}>
          <NeonButton
            testID="play-again"
            label="PLAY AGAIN"
            color={colors.neonPink}
            size="large"
            icon={<RotateCcw size={17} color={colors.white} />}
            disabled={navBusy}
            onPress={() =>
              navigateAfterInterstitial(() =>
                navigation.replace('Gameplay', { mode: 'classic' }),
              )
            }
          />
          <NeonButton
            testID="return-main-menu"
            label="MAIN MENU"
            color={colors.electricBlue}
            icon={<Home size={15} color={colors.white} />}
            disabled={navBusy}
            onPress={() =>
              navigateAfterInterstitial(() => navigation.navigate('MainMenu'))
            }
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    alignItems: 'center',
    gap: 14,
    zIndex: 5,
    paddingBottom: 28,
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
