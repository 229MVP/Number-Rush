import { Platform } from 'react-native';

function trimEnv(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isPlausibleAdMobAppId(value: string): boolean {
  return /^ca-app-pub-\d+~[\w]+$/.test(value);
}

function isPlausibleAdUnitId(value: string): boolean {
  return /^ca-app-pub-\d+\/[\w]+$/.test(value);
}

export function getAdMobAndroidAppId(): string | null {
  const id = trimEnv(process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID);
  if (!id || !isPlausibleAdMobAppId(id)) return null;
  return id;
}

export function getAdMobIosAppId(): string | null {
  const id = trimEnv(process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID);
  if (!id || !isPlausibleAdMobAppId(id)) return null;
  return id;
}

export function getAdMobAppIds(): {
  android: string | null;
  ios: string | null;
} {
  return {
    android: getAdMobAndroidAppId(),
    ios: getAdMobIosAppId(),
  };
}

export function getAdMobRewardedUnitIds(): {
  android: string | null;
  ios: string | null;
} {
  const android = trimEnv(process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID);
  const ios = trimEnv(process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID);
  return {
    android: android && isPlausibleAdUnitId(android) ? android : null,
    ios: ios && isPlausibleAdUnitId(ios) ? ios : null,
  };
}

export function getAdMobInterstitialUnitIds(): {
  android: string | null;
  ios: string | null;
} {
  const android = trimEnv(
    process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_UNIT_ID,
  );
  const ios = trimEnv(process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_UNIT_ID);
  return {
    android: android && isPlausibleAdUnitId(android) ? android : null,
    ios: ios && isPlausibleAdUnitId(ios) ? ios : null,
  };
}

export function isAdsConfigReady(): boolean {
  const { android, ios } = getAdMobAppIds();
  if (Platform.OS === 'android') return android != null;
  if (Platform.OS === 'ios') return ios != null;
  return android != null || ios != null;
}

export function getRevenueCatApiKey(): string | null {
  if (Platform.OS === 'ios') {
    return trimEnv(process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY);
  }
  if (Platform.OS === 'android') {
    return trimEnv(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY);
  }
  return (
    trimEnv(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY) ??
    trimEnv(process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY)
  );
}

export function isPurchasesConfigReady(): boolean {
  return getRevenueCatApiKey() != null;
}
