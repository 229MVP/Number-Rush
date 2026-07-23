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
