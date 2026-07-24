import { getAppEnvironment } from './environment';
import {
  isAdsConfigReady,
  isPurchasesConfigReady,
} from './monetizationEnvironment';
import { isSupabaseConfigured } from './supabaseEnvironment';

function parseFeatureOverride(
  envName: string,
): boolean | null {
  const raw = process.env[envName]?.trim().toLowerCase();
  if (raw === 'true' || raw === '1' || raw === 'yes') return true;
  if (raw === 'false' || raw === '0' || raw === 'no') return false;
  return null;
}

function resolveFeature(envName: string): boolean {
  const override = parseFeatureOverride(envName);
  if (override != null) return override;
  return isSupabaseConfigured();
}

function isDevLikeEnvironment(): boolean {
  if (__DEV__) return true;
  const env = getAppEnvironment();
  return env === 'development' || env === 'preview';
}

function resolveMonetizationToggle(
  envName: string,
  devDefault: boolean,
  productionRequiresReady: () => boolean,
): boolean {
  const override = parseFeatureOverride(envName);
  if (isDevLikeEnvironment()) {
    if (override != null) return override;
    return devDefault;
  }
  if (override === true && productionRequiresReady()) return true;
  return false;
}

function childAdsFlag(devDefault: boolean): boolean {
  if (!adsEnabled) return false;
  if (isDevLikeEnvironment()) return devDefault;
  return adsEnabled;
}

/** Master ads switch (test ads in dev-like builds when true). */
export const adsEnabled = resolveMonetizationToggle(
  'EXPO_PUBLIC_ADS_ENABLED',
  true,
  isAdsConfigReady,
);

export const rewardedAdsEnabled = childAdsFlag(true);

export const interstitialAdsEnabled = childAdsFlag(true);

export const purchasesEnabled = resolveMonetizationToggle(
  'EXPO_PUBLIC_PURCHASES_ENABLED',
  true,
  isPurchasesConfigReady,
);

export const subscriptionsEnabled =
  purchasesEnabled &&
  resolveMonetizationToggle(
    'EXPO_PUBLIC_SUBSCRIPTIONS_ENABLED',
    false,
    isPurchasesConfigReady,
  );

export const rewardedAdSsvEnabled =
  !isDevLikeEnvironment() &&
  parseFeatureOverride('EXPO_PUBLIC_REWARDED_AD_SSV_ENABLED') === true;

export const personalizedAdsEnabled = isDevLikeEnvironment()
  ? parseFeatureOverride('EXPO_PUBLIC_PERSONALIZED_ADS_ENABLED') !== false
  : parseFeatureOverride('EXPO_PUBLIC_PERSONALIZED_ADS_ENABLED') === true;

export const removeAdsProductEnabled = purchasesEnabled;

export const starterBundleEnabled = purchasesEnabled;

/** Cloud save / sync when Supabase is configured unless forced off. */
export const cloudSyncEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_CLOUD_SYNC',
);

export const liveDailyLeaderboardEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_LIVE_DAILY_LEADERBOARD',
);

export const liveRankedEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_LIVE_RANKED',
);

export const connectedEconomyEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_CONNECTED_ECONOMY',
);

export const accountDeletionEnabled = resolveFeature(
  'EXPO_PUBLIC_FEATURE_ACCOUNT_DELETION',
);
