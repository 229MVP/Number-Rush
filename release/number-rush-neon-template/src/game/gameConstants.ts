/** Centralized Rush 21 gameplay constants. Do not scatter these values. */

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
export const BOMB_RESOLVE_DURATION = 550;

/**
 * Optional fixed sequence for manual QA in __DEV__ only.
 * Enable by setting USE_DEV_TILE_SEQUENCE = true below.
 * Sequence: [7, 7, 7, 10, 10, 5, 6, 9, 8, 4] then falls back to random.
 */
export const USE_DEV_TILE_SEQUENCE = false;
export const DEV_TILE_SEQUENCE = [7, 7, 7, 10, 10, 5, 6, 9, 8, 4] as const;

export const STORAGE_KEYS = {
  bestScore: 'numberRush.bestScore',
  tutorialCompleted: 'numberRush.tutorialCompleted',
  dailyOfficialRecords: 'numberRush.daily.officialRecords',
  dailyPracticeRecords: 'numberRush.daily.practiceRecords',
  dailyAllTimeBest: 'numberRush.daily.allTimeBest',
} as const;
