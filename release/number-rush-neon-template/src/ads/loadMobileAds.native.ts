import type { MobileAdsModule } from './mobileAdsModuleTypes';

export function loadMobileAdsModule(): MobileAdsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-google-mobile-ads') as MobileAdsModule;
  } catch {
    return null;
  }
}
