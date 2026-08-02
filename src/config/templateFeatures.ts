/**
 * Number Rush — Sellable Template Feature Switches
 * ─────────────────────────────────────────────────
 * This file is the single source of truth for what ships in the commercial
 * "Number Rush — Neon Number Puzzle Game Template" build.
 *
 * `true`  = included, tested, and supported in this template.
 * `false` = present in source for reference only, intentionally disabled.
 *
 * Flipping a flag back to `true` re-enables the underlying code path (it was
 * not deleted — see docs/KNOWN_LIMITATIONS.md and CUSTOMIZATION_GUIDE.md),
 * but re-enabling backend-dependent features requires your own Supabase
 * project, ad network keys, and store billing setup. None of that is
 * included or supported by this template license.
 */
export const TEMPLATE_FEATURES = {
  classic: true,
  tutorial: true,
  localBestScore: true,
  multiplier: true,
  swap: true,
  dailyTournament: false,
  ranked: false,
  missions: false,
  shop: false,
  accounts: false,
  cloudSync: false,
  liveLeaderboards: false,
  monetization: false,
} as const;

/**
 * Extended (non-buyer-facing) switches derived from the flags above.
 * Kept separate so the object literal above stays exactly as documented.
 */

/** Bomb / Freeze / Shield / Wild — disabled for template stability & QA scope. */
export const ADVANCED_POWER_UPS_ENABLED = TEMPLATE_FEATURES.shop;

/** Local, on-device statistics screen (Best Score, Games Played, etc.). */
export const LOCAL_STATS_ENABLED = TEMPLATE_FEATURES.localBestScore;

export type TemplateFeatureKey = keyof typeof TEMPLATE_FEATURES;
