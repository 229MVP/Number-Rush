import {
  LANE_COUNT,
  MAX_STRIKES,
  MULTIPLIER_FACTOR,
  MULTIPLIER_STARTING_QUANTITY,
  SWAP_STARTING_QUANTITY,
  TARGET_VALUE,
} from './gameConstants';
import { scorePerfectClear, comboMultiplierFromStreak } from './scoring';
import { TileGenerator } from './tileGenerator';
import type {
  LaneState,
  NumberTileData,
  PlacementResult,
  RunStats,
} from './gameTypes';

export function createEmptyLanes(): LaneState[] {
  return Array.from({ length: LANE_COUNT }, (_, i) => ({
    id: i + 1,
    total: 0,
    status: 'default' as const,
  }));
}

export function createEmptyRunStats(): RunStats {
  return {
    score: 0,
    maxComboMultiplier: 1,
    longestPerfectStreak: 0,
    perfectClears: 0,
    tilesPlaced: 0,
    strikesUsed: 0,
  };
}

export type NewRunState = {
  lanes: LaneState[];
  score: number;
  comboStreak: number;
  comboMultiplier: number;
  strikesRemaining: number;
  currentTile: NumberTileData;
  nextTile: NumberTileData;
  runStats: RunStats;
  multiplierQuantity: number;
  multiplierSelected: boolean;
  swapQuantity: number;
  tileGenerator: TileGenerator;
};

export function createNewRun(generator?: TileGenerator): NewRunState {
  const tileGenerator = generator ?? new TileGenerator();
  const currentTile = tileGenerator.next();
  const nextTile = tileGenerator.next();
  return {
    lanes: createEmptyLanes(),
    score: 0,
    comboStreak: 0,
    comboMultiplier: 1,
    strikesRemaining: MAX_STRIKES,
    currentTile,
    nextTile,
    runStats: createEmptyRunStats(),
    multiplierQuantity: MULTIPLIER_STARTING_QUANTITY,
    multiplierSelected: false,
    swapQuantity: SWAP_STARTING_QUANTITY,
    tileGenerator,
  };
}

export function effectiveTileValue(
  tile: NumberTileData,
  multiplierSelected: boolean,
): number {
  return multiplierSelected ? tile.value * MULTIPLIER_FACTOR : tile.value;
}

/**
 * Pure placement resolution. Does not mutate inputs.
 * Advances tile bag externally via returned nextCurrent / nextNext.
 */
export function resolveLanePlacement(args: {
  lanes: LaneState[];
  laneIndex: number;
  currentTile: NumberTileData;
  nextTile: NumberTileData;
  score: number;
  comboStreak: number;
  strikesRemaining: number;
  runStats: RunStats;
  multiplierSelected: boolean;
  multiplierQuantity: number;
  tileGenerator: TileGenerator;
}): PlacementResult & {
  lanes: LaneState[];
  score: number;
  comboStreak: number;
  comboMultiplier: number;
  strikesRemaining: number;
  currentTile: NumberTileData;
  nextTile: NumberTileData;
  runStats: RunStats;
  multiplierQuantity: number;
  multiplierSelected: boolean;
} {
  const {
    lanes,
    laneIndex,
    currentTile,
    nextTile,
    score,
    comboStreak,
    strikesRemaining,
    runStats,
    multiplierSelected,
    multiplierQuantity,
    tileGenerator,
  } = args;

  const previousTotal = lanes[laneIndex].total;
  const value = effectiveTileValue(currentTile, multiplierSelected);
  const newTotal = previousTotal + value;
  const consumedMultiplier = multiplierSelected;
  const nextMultiplierQuantity = consumedMultiplier
    ? Math.max(0, multiplierQuantity - 1)
    : multiplierQuantity;

  const advancedCurrent = nextTile;
  const advancedNext = tileGenerator.next();

  const nextLanes = lanes.map((lane, i) =>
    i === laneIndex ? { ...lane } : { ...lane, status: 'default' as const },
  );

  if (newTotal === TARGET_VALUE) {
    const newStreak = comboStreak + 1;
    const { points, comboMultiplier } = scorePerfectClear(newStreak);
    const nextScore = score + points;
    const nextStats: RunStats = {
      ...runStats,
      score: nextScore,
      perfectClears: runStats.perfectClears + 1,
      tilesPlaced: runStats.tilesPlaced + 1,
      longestPerfectStreak: Math.max(runStats.longestPerfectStreak, newStreak),
      maxComboMultiplier: Math.max(runStats.maxComboMultiplier, comboMultiplier),
    };
    nextLanes[laneIndex] = {
      ...nextLanes[laneIndex],
      total: newTotal,
      status: 'perfect',
    };
    return {
      outcome: 'perfect',
      laneIndex,
      previousTotal,
      newTotal,
      effectiveValue: value,
      pointsAwarded: points,
      strikesRemaining,
      comboStreak: newStreak,
      comboMultiplier,
      consumedMultiplier,
      gameOver: false,
      lanes: nextLanes,
      score: nextScore,
      runStats: nextStats,
      currentTile: advancedCurrent,
      nextTile: advancedNext,
      multiplierQuantity: nextMultiplierQuantity,
      multiplierSelected: false,
    };
  }

  if (newTotal > TARGET_VALUE) {
    const nextStrikes = Math.max(0, strikesRemaining - 1);
    const nextStats: RunStats = {
      ...runStats,
      tilesPlaced: runStats.tilesPlaced + 1,
      strikesUsed: runStats.strikesUsed + 1,
      score,
    };
    nextLanes[laneIndex] = {
      ...nextLanes[laneIndex],
      total: newTotal,
      status: 'bust',
    };
    return {
      outcome: 'bust',
      laneIndex,
      previousTotal,
      newTotal,
      effectiveValue: value,
      pointsAwarded: 0,
      strikesRemaining: nextStrikes,
      comboStreak: 0,
      comboMultiplier: 1,
      consumedMultiplier,
      gameOver: nextStrikes <= 0,
      lanes: nextLanes,
      score,
      runStats: nextStats,
      currentTile: advancedCurrent,
      nextTile: advancedNext,
      multiplierQuantity: nextMultiplierQuantity,
      multiplierSelected: false,
    };
  }

  // Normal placement — below target, no perfect points.
  const nextStats: RunStats = {
    ...runStats,
    tilesPlaced: runStats.tilesPlaced + 1,
    score,
  };
  nextLanes[laneIndex] = {
    ...nextLanes[laneIndex],
    total: newTotal,
    status: 'receiving',
  };
  return {
    outcome: 'normal',
    laneIndex,
    previousTotal,
    newTotal,
    effectiveValue: value,
    pointsAwarded: 0,
    strikesRemaining,
    comboStreak,
    comboMultiplier: comboMultiplierFromStreak(comboStreak),
    consumedMultiplier,
    gameOver: false,
    lanes: nextLanes,
    score,
    runStats: nextStats,
    currentTile: advancedCurrent,
    nextTile: advancedNext,
    multiplierQuantity: nextMultiplierQuantity,
    multiplierSelected: false,
  };
}

export function swapLaneTotals(
  lanes: LaneState[],
  a: number,
  b: number,
): LaneState[] {
  if (a === b || a < 0 || b < 0 || a >= lanes.length || b >= lanes.length) {
    return lanes;
  }
  const next: LaneState[] = lanes.map((lane) => ({
    ...lane,
    status: 'default',
  }));
  const totalA = next[a].total;
  next[a] = { ...next[a], total: next[b].total, status: 'selected' };
  next[b] = { ...next[b], total: totalA, status: 'selected' };
  return next;
}
