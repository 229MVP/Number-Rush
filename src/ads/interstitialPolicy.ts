import type { MonetizationEntitlements } from '../monetization/monetizationTypes';
import {
  INTERSTITIAL_COOLDOWN_MS,
  INTERSTITIAL_DAILY_CAP,
  INTERSTITIAL_EVERY_N_CLASSIC_RUNS,
  INTERSTITIAL_FREE_CLASSIC_RUNS,
} from '../monetization/economyBalance';
import type { AdFrequencyState } from '../storage/adFrequencyStorage';
import { rollUtcDay } from '../storage/adFrequencyStorage';

export type InterstitialEligibilityReason =
  | 'eligible'
  | 'remove_ads'
  | 'club'
  | 'frequency'
  | 'cooldown'
  | 'daily_cap'
  | 'recent_rewarded'
  | 'consent'
  | 'not_ready'
  | 'wrong_mode'
  | 'feature_disabled';

export type InterstitialEligibility = {
  eligible: boolean;
  reason: InterstitialEligibilityReason;
  runsUntilEligible?: number;
  cooldownRemainingMs?: number;
};

/** Block interstitial if a rewarded ad completed within this window. */
export const RECENT_REWARDED_BLOCK_MS = 60_000;

export type InterstitialPolicyInput = {
  nowMs: number;
  frequency: AdFrequencyState;
  entitlements: Pick<MonetizationEntitlements, 'removeAds' | 'clubActive'>;
  interstitialAdsEnabled: boolean;
  canRequestAds: boolean;
  /** Classic only — other modes should pass false. */
  modeIsClassic?: boolean;
  adReady?: boolean;
};

/**
 * Classic run-complete interstitial eligibility.
 * - Never during first two completed Classic runs
 * - Eligible on every third completed Classic run (3, 6, 9, …)
 * - 8-minute cooldown and daily cap
 * - Never immediately after a rewarded ad
 * - Never for Remove Ads / Club
 */
export function evaluateInterstitialEligibility(
  input: InterstitialPolicyInput,
): InterstitialEligibility {
  if (input.modeIsClassic === false) {
    return { eligible: false, reason: 'wrong_mode' };
  }
  if (input.entitlements.removeAds) {
    return { eligible: false, reason: 'remove_ads' };
  }
  if (input.entitlements.clubActive) {
    return { eligible: false, reason: 'club' };
  }
  if (!input.interstitialAdsEnabled) {
    return { eligible: false, reason: 'feature_disabled' };
  }
  if (!input.canRequestAds) {
    return { eligible: false, reason: 'consent' };
  }
  if (input.adReady === false) {
    return { eligible: false, reason: 'not_ready' };
  }

  const frequency = rollUtcDay(input.frequency, input.nowMs);
  const runs = frequency.completedClassicRunsSinceInterstitial;

  // First two completed Classic runs never show forced interstitials.
  if (runs <= INTERSTITIAL_FREE_CLASSIC_RUNS) {
    return {
      eligible: false,
      reason: 'frequency',
      runsUntilEligible: INTERSTITIAL_EVERY_N_CLASSIC_RUNS - runs,
    };
  }

  // Eligible after every third completed Classic run.
  if (runs % INTERSTITIAL_EVERY_N_CLASSIC_RUNS !== 0) {
    return {
      eligible: false,
      reason: 'frequency',
      runsUntilEligible:
        INTERSTITIAL_EVERY_N_CLASSIC_RUNS -
        (runs % INTERSTITIAL_EVERY_N_CLASSIC_RUNS),
    };
  }

  if (frequency.interstitialCountToday >= INTERSTITIAL_DAILY_CAP) {
    return { eligible: false, reason: 'daily_cap' };
  }

  if (frequency.lastRewardedAt != null) {
    const sinceRewarded = input.nowMs - frequency.lastRewardedAt;
    if (sinceRewarded >= 0 && sinceRewarded < RECENT_REWARDED_BLOCK_MS) {
      return { eligible: false, reason: 'recent_rewarded' };
    }
  }

  if (frequency.lastInterstitialAt != null) {
    const elapsed = input.nowMs - frequency.lastInterstitialAt;
    if (elapsed >= 0 && elapsed < INTERSTITIAL_COOLDOWN_MS) {
      return {
        eligible: false,
        reason: 'cooldown',
        cooldownRemainingMs: INTERSTITIAL_COOLDOWN_MS - elapsed,
      };
    }
  }

  return { eligible: true, reason: 'eligible' };
}
