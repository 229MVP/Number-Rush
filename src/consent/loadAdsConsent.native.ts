import type { AdsConsentModule } from './adsConsentModuleTypes';

export function loadAdsConsentModule(): AdsConsentModule | null {
  try {
    // Native-only entry — web uses loadAdsConsent.web.ts
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-google-mobile-ads') as AdsConsentModule;
  } catch {
    return null;
  }
}
