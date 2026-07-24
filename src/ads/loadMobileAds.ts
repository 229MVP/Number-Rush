import type { MobileAdsModule } from './mobileAdsModuleTypes';

/**
 * Default fallback for TypeScript resolution.
 * Metro prefers `.web.ts` / `.native.ts` at bundle time — do not re-export native here
 * or web bundling will statically pull react-native-google-mobile-ads.
 */
export function loadMobileAdsModule(): MobileAdsModule | null {
  return null;
}
