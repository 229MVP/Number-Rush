import type { PlayerInventory } from '../progression/progressionTypes';
import type { PurchaseProductId } from './monetizationTypes';

export const MAX_INVENTORY_COUNT = 9999;

/** One rewarded revive per classic run. */
export const REVIVE_PER_RUN_LIMIT = 1;

/** Rewarded double-coins grants exactly the run's base coins (not XP/gems). */
export const DOUBLE_COINS_USES_BASE_COINS_ONLY = true;

/** One rewarded daily free power-up per UTC calendar day. */
export const DAILY_FREE_POWERUP_PER_DAY = 1;

/** Classic runs without interstitial after install / reset counter. */
export const INTERSTITIAL_FREE_CLASSIC_RUNS = 2;

/** Show interstitial every N completed classic runs once past free runs. */
export const INTERSTITIAL_EVERY_N_CLASSIC_RUNS = 3;

export const INTERSTITIAL_COOLDOWN_MS = 8 * 60 * 1000;

export const INTERSTITIAL_DAILY_CAP = 5;

/** Soft cap on rewarded-ad claims per UTC day (client UX; server enforces uniqueness). */
export const MAX_REWARDED_CLAIMS_PER_UTC_DAY = 12;

export type GemPackProductId = Extract<
  PurchaseProductId,
  | 'numberrush.gems_80'
  | 'numberrush.gems_450'
  | 'numberrush.gems_1000'
  | 'numberrush.gems_2500'
>;

export const GEM_PACK_AMOUNTS: Record<GemPackProductId, number> = {
  'numberrush.gems_80': 80,
  'numberrush.gems_450': 450,
  'numberrush.gems_1000': 1000,
  'numberrush.gems_2500': 2500,
};

export type StarterBundleContents = {
  gems: number;
  inventory: Partial<PlayerInventory>;
  includesRemoveAds: boolean;
  themeOrFrame?: string;
};

/** Display mirror of server starter_bundle map — server is authoritative. */
export const STARTER_BUNDLE_CONTENTS: StarterBundleContents = {
  gems: 500,
  inventory: {
    multiplier: 5,
    swap: 5,
    bomb: 3,
    freeze: 3,
    shield: 2,
  },
  includesRemoveAds: true,
  themeOrFrame: 'solar_starter',
};

export const CLUB_MONTHLY_GEM_GRANT = 150;
