import { Platform } from 'react-native';

import {
  adsEnabled,
  interstitialAdsEnabled,
  rewardedAdsEnabled,
} from '../config/featureFlags';
import { getAppEnvironment } from '../config/environment';
import {
  getAdMobInterstitialUnitIds,
  getAdMobRewardedUnitIds,
} from '../config/monetizationEnvironment';

/** Google official sample ad units (always safe in development). */
const TEST_REWARDED = 'ca-app-pub-3940256099942544/5224354917';
const TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';

function useProductionAdUnits(): boolean {
  if (getAppEnvironment() !== 'production') return false;
  if (!adsEnabled) return false;
  const rewarded = getAdMobRewardedUnitIds();
  const interstitial = getAdMobInterstitialUnitIds();
  const hasRewarded =
    rewarded.android != null || rewarded.ios != null;
  const hasInterstitial =
    interstitial.android != null || interstitial.ios != null;
  if (rewardedAdsEnabled && !hasRewarded) return false;
  if (interstitialAdsEnabled && !hasInterstitial) return false;
  return hasRewarded || hasInterstitial;
}

function pickPlatformId(
  android: string | null,
  ios: string | null,
  testId: string,
): string {
  if (!useProductionAdUnits()) return testId;
  if (Platform.OS === 'android' && android) return android;
  if (Platform.OS === 'ios' && ios) return ios;
  return android ?? ios ?? testId;
}

export function getRewardedAdUnitId(): string {
  const env = getAdMobRewardedUnitIds();
  return pickPlatformId(env.android, env.ios, TEST_REWARDED);
}

export function getInterstitialAdUnitId(): string {
  const env = getAdMobInterstitialUnitIds();
  return pickPlatformId(env.android, env.ios, TEST_INTERSTITIAL);
}
