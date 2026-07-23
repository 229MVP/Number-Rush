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
  kind: 'score' | 'perfect' | 'bust';
};

export type SwapMode = 'off' | 'selectFirst' | 'selectSecond';

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
};

export type GameMode = 'classic' | 'daily' | 'ranked';

export type RunConfiguration = {
  mode: GameMode;
  targetValue: number;
  maxStrikes: number;
  maxTiles: number | null;
  seed: string | null;
  powerUpsEnabled: boolean;
  officialAttempt: boolean;
};

export type RunCompletionReason = 'strikes' | 'tileLimit' | 'quit';

export type RankedDivision =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'blaze';

export type CompetitiveRunResult = {
  mode: GameMode;
  score: number;
  perfectClears: number;
  maxComboMultiplier: number;
  longestPerfectStreak: number;
  tilesPlaced: number;
  strikesUsed: number;
  completionReason: RunCompletionReason;
  officialAttempt?: boolean;
  rankedPointsEarned?: number;
  previousRankedPoints?: number;
  newRankedPoints?: number;
  previousDivision?: RankedDivision;
  newDivision?: RankedDivision;
  rankedOutcome?: 'win' | 'loss' | 'draw';
  rankedBreakdown?: {
    basePoints: number;
    survivalBonus: number;
    comboBonus: number;
    perfectBonus: number;
    total: number;
    outcome: 'win' | 'loss' | 'draw';
  };
  bestDailyScore?: number;
  dailyRank?: number;
  isNewDailyBest?: boolean;
  isPractice?: boolean;
};

export type RankedProfile = {
  rankedPoints: number;
  division: RankedDivision;
  seasonHighPoints: number;
  rankedGamesPlayed: number;
  rankedWins: number;
  rankedLosses: number;
  currentWinStreak: number;
  bestWinStreak: number;
};

export type DailyOfficialRecord = {
  dateKey: string;
  score: number;
  perfectClears: number;
  maxComboMultiplier: number;
  longestPerfectStreak: number;
  tilesPlaced: number;
  completedAt: string;
};

export type RankedSubdivision = 'III' | 'II' | 'I';

export type RankedDivisionInfo = {
  division: RankedDivision;
  subdivision: RankedSubdivision;
  label: string;
  rangeMin: number;
  rangeMax: number | null;
  segmentMin: number;
  segmentMax: number;
  progressPct: number;
  color: string;
  emoji: string;
};

export type RankedPointBreakdown = {
  basePoints: number;
  survivalBonus: number;
  comboBonus: number;
  perfectBonus: number;
  total: number;
  outcome: 'win' | 'loss' | 'draw';
};

export type LeaderboardEntry = {
  id: string;
  username: string;
  score: number;
  division: RankedDivision;
  isLocalPlayer: boolean;
};
