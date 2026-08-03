import {
  adsEnabled,
  interstitialAdsEnabled,
  personalizedAdsEnabled,
  rewardedAdsEnabled,
} from '../config/featureFlags';

export function isAdsFeatureEnabled(): boolean {
  return adsEnabled;
}

export function isRewardedAdsFeatureEnabled(): boolean {
  return adsEnabled && rewardedAdsEnabled;
}

export function isInterstitialAdsFeatureEnabled(): boolean {
  return adsEnabled && interstitialAdsEnabled;
}

export function shouldRequestNonPersonalizedAds(): boolean {
  return !personalizedAdsEnabled;
}

export const AD_INIT_TIMEOUT_MS = 4_000;
