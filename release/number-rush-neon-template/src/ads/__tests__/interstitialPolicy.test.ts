import {
  evaluateInterstitialEligibility,
  RECENT_REWARDED_BLOCK_MS,
} from '../interstitialPolicy';
import { DEFAULT_AD_FREQUENCY_STATE } from '../../storage/adFrequencyStorage';
import {
  INTERSTITIAL_COOLDOWN_MS,
  INTERSTITIAL_DAILY_CAP,
  INTERSTITIAL_EVERY_N_CLASSIC_RUNS,
  INTERSTITIAL_FREE_CLASSIC_RUNS,
} from '../../monetization/economyBalance';

const baseInput = {
  nowMs: Date.parse('2026-07-24T12:00:00.000Z'),
  frequency: {
    ...DEFAULT_AD_FREQUENCY_STATE,
    utcDateKey: '2026-07-24',
    completedClassicRunsSinceInterstitial: INTERSTITIAL_EVERY_N_CLASSIC_RUNS,
  },
  entitlements: { removeAds: false, clubActive: false },
  interstitialAdsEnabled: true,
  canRequestAds: true,
  modeIsClassic: true as const,
};

describe('interstitialPolicy', () => {
  it('blocks when remove ads entitlement is active', () => {
    const result = evaluateInterstitialEligibility({
      ...baseInput,
      entitlements: { removeAds: true, clubActive: false },
    });
    expect(result).toEqual({ eligible: false, reason: 'remove_ads' });
  });

  it('blocks when club entitlement is active', () => {
    const result = evaluateInterstitialEligibility({
      ...baseInput,
      entitlements: { removeAds: false, clubActive: true },
    });
    expect(result).toEqual({ eligible: false, reason: 'club' });
  });

  it('blocks during first two classic runs', () => {
    const result = evaluateInterstitialEligibility({
      ...baseInput,
      frequency: {
        ...baseInput.frequency,
        completedClassicRunsSinceInterstitial: INTERSTITIAL_FREE_CLASSIC_RUNS,
      },
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('frequency');
  });

  it('eligible on every third completed classic run', () => {
    const result = evaluateInterstitialEligibility({
      ...baseInput,
      frequency: {
        ...baseInput.frequency,
        completedClassicRunsSinceInterstitial: INTERSTITIAL_EVERY_N_CLASSIC_RUNS,
      },
    });
    expect(result).toEqual({ eligible: true, reason: 'eligible' });
  });

  it('blocks between interval runs', () => {
    const result = evaluateInterstitialEligibility({
      ...baseInput,
      frequency: {
        ...baseInput.frequency,
        completedClassicRunsSinceInterstitial: 4,
      },
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('frequency');
  });

  it('enforces daily cap', () => {
    const result = evaluateInterstitialEligibility({
      ...baseInput,
      frequency: {
        ...baseInput.frequency,
        interstitialCountToday: INTERSTITIAL_DAILY_CAP,
      },
    });
    expect(result).toEqual({ eligible: false, reason: 'daily_cap' });
  });

  it('enforces cooldown', () => {
    const nowMs = baseInput.nowMs;
    const result = evaluateInterstitialEligibility({
      ...baseInput,
      nowMs,
      frequency: {
        ...baseInput.frequency,
        lastInterstitialAt: nowMs - INTERSTITIAL_COOLDOWN_MS + 1000,
      },
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('cooldown');
    expect(result.cooldownRemainingMs).toBeGreaterThan(0);
  });

  it('blocks immediately after a rewarded ad', () => {
    const nowMs = baseInput.nowMs;
    const result = evaluateInterstitialEligibility({
      ...baseInput,
      nowMs,
      frequency: {
        ...baseInput.frequency,
        lastRewardedAt: nowMs - RECENT_REWARDED_BLOCK_MS + 1000,
      },
    });
    expect(result).toEqual({ eligible: false, reason: 'recent_rewarded' });
  });

  it('blocks non-classic modes', () => {
    const result = evaluateInterstitialEligibility({
      ...baseInput,
      modeIsClassic: false,
    });
    expect(result).toEqual({ eligible: false, reason: 'wrong_mode' });
  });
});
