/** Centralized Rush 21 gameplay + mode constants. */

export const TARGET_VALUE = 21;
export const LANE_COUNT = 4;
export const MAX_STRIKES = 3;
export const MIN_TILE_VALUE = 1;
export const MAX_TILE_VALUE = 10;
export const PERFECT_BASE_SCORE = 100;

export const MULTIPLIER_STARTING_QUANTITY = 2;
export const SWAP_STARTING_QUANTITY = 3;
export const MULTIPLIER_FACTOR = 2;

export const DAILY_MAX_TILES = 40;
export const RANKED_MAX_TILES = 30;

export const TILE_MOVE_DURATION = 250;
export const NORMAL_FEEDBACK_DURATION = 300;
export const PERFECT_FEEDBACK_DURATION = 900;
export const BUST_FEEDBACK_DURATION = 900;
export const SCORE_POPUP_DURATION = 1100;

/**
 * Optional fixed sequence for manual QA in __DEV__ only.
 * Enable by setting USE_DEV_TILE_SEQUENCE = true below.
 */
export const USE_DEV_TILE_SEQUENCE = false;
export const DEV_TILE_SEQUENCE = [7, 7, 7, 10, 10, 5, 6, 9, 8, 4] as const;

export const STORAGE_KEYS = {
  bestScore: 'numberRush.bestScore',
  tutorialCompleted: 'numberRush.tutorialCompleted',
  dailyLastOfficialDate: 'numberRush.daily.lastOfficialDate',
  dailyOfficialScores: 'numberRush.daily.officialScores',
  dailyPracticeBest: 'numberRush.daily.practiceBest',
  dailyCompletedAttempts: 'numberRush.daily.completedAttempts',
  rankedProfile: 'numberRush.ranked.profile',
} as const;

export const DIVISION_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD339',
  platinum: '#4DEBFF',
  diamond: '#16C8FF',
  blaze: '#FF9D1C',
} as const;

export const DIVISION_EMOJI = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '🔷',
  blaze: '🔥',
} as const;

/** Inclusive min, exclusive max (except blaze which is open-ended). */
export const DIVISION_RANGES = [
  { division: 'bronze' as const, min: 0, max: 300 },
  { division: 'silver' as const, min: 300, max: 700 },
  { division: 'gold' as const, min: 700, max: 1300 },
  { division: 'platinum' as const, min: 1300, max: 2000 },
  { division: 'diamond' as const, min: 2000, max: 3000 },
  { division: 'blaze' as const, min: 3000, max: null },
] as const;
