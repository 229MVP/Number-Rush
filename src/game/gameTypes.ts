/** Core gameplay type models for Rush 21. */

export type LaneStatus =
  | 'default'
  | 'receiving'
  | 'perfect'
  | 'bust'
  | 'frozen'
  | 'selected';

export type LaneState = {
  id: number;
  total: number;
  status: LaneStatus;
};

export type TileType =
  | 'number'
  | 'multiplier'
  | 'bomb'
  | 'freeze'
  | 'wild'
  | 'shield';

export type NumberTileData = {
  id: string;
  type: TileType;
  value: number;
};

export type GameStatus =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'resolving'
  | 'gameOver';

export type RunStats = {
  score: number;
  maxComboMultiplier: number;
  longestPerfectStreak: number;
  perfectClears: number;
  tilesPlaced: number;
  strikesUsed: number;
};

export type PlacementOutcome = 'normal' | 'perfect' | 'bust';

export type FloatingPopup = {
  id: string;
  text: string;
  laneIndex: number;
  kind: 'score' | 'perfect' | 'bust' | 'shielded' | 'bomb';
};

export type SwapMode = 'off' | 'selectFirst' | 'selectSecond';

export type PowerUpId =
  | 'multiplier'
  | 'swap'
  | 'bomb'
  | 'freeze'
  | 'shield'
  | 'wild';

export type ActivePowerUpState = {
  multiplierSelected: boolean;
  swapMode: SwapMode;
  selectedSwapLane: number | null;
  bombSelected: boolean;
  freezeSelected: boolean;
  shieldArmed: boolean;
  wildSelected: boolean;
  selectedWildValue: number | null;
};

export type PlacementResult = {
  outcome: PlacementOutcome;
  laneIndex: number;
  previousTotal: number;
  newTotal: number;
  effectiveValue: number;
  pointsAwarded: number;
  strikesRemaining: number;
  comboStreak: number;
  comboMultiplier: number;
  consumedMultiplier: boolean;
  consumedFreeze: boolean;
  consumedWild: boolean;
  consumedShield: boolean;
  shieldBlocked: boolean;
  gameOver: boolean;
  /** True when the run ends because the tile limit was hit on this placement. */
  tileLimitReached?: boolean;
};

export type GameOverPayload = {
  finalScore: number;
  bestScore: number;
  maxComboMultiplier: number;
  longestPerfectStreak: number;
  perfectClears: number;
  tilesPlaced: number;
  isNewBest: boolean;
  rewardKey: string;
  multipliersUsed: number;
  swapsUsed: number;
};

export type GameMode = 'classic' | 'daily';

export type RunConfiguration = {
  mode: GameMode;
  targetValue: number;
  maximumStrikes: number;
  maximumTiles: number | null;
  seed: string | null;
  powerUpsEnabled: boolean;
  officialAttempt: boolean;
};

export type RunCompletionReason = 'strikes' | 'tileLimit' | 'quit';

export type DailyRunResult = {
  mode: 'daily';
  dateKey: string;
  officialAttempt: boolean;
  score: number;
  perfectClears: number;
  maxComboMultiplier: number;
  longestPerfectStreak: number;
  tilesPlaced: number;
  strikesUsed: number;
  completionReason: RunCompletionReason;
  completedAt: string;
};

export type DailyOfficialRecord = {
  dateKey: string;
  score: number;
  perfectClears: number;
  maxComboMultiplier: number;
  longestPerfectStreak: number;
  tilesPlaced: number;
  strikesUsed: number;
  completedAt: string;
};

export type DailyPracticeRecord = {
  dateKey: string;
  bestScore: number;
  attempts: number;
  lastPlayedAt: string;
};

export type DailyAllTimeBest = {
  score: number;
  dateKey: string;
  completedAt: string;
};

export type DailyResultsParams = {
  dateKey: string;
  officialAttempt: boolean;
  score: number;
  perfectClears: number;
  maxComboMultiplier: number;
  longestPerfectStreak: number;
  tilesPlaced: number;
  strikesUsed: number;
  completionReason: RunCompletionReason;
  officialScore: number | null;
  practiceBest: number | null;
  calculatedRank: number | null;
  isNewDailyBest: boolean;
  allTimeBest: number | null;
  rewardKey: string;
};
