import type { AdsConsentModule } from './adsConsentModuleTypes';

/**
 * Default fallback for TypeScript resolution.
 * Metro prefers `.web.ts` / `.native.ts` — never re-export native here.
 */
export function loadAdsConsentModule(): AdsConsentModule | null {
  return null;
}
