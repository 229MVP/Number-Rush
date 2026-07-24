import {
  LANE_COUNT,
  MULTIPLIER_FACTOR,
  MULTIPLIER_STARTING_QUANTITY,
  SWAP_STARTING_QUANTITY,
  TARGET_VALUE,
} from './gameConstants';
import { getClassicConfig } from './gameModes';
import type { RunPowerInventory } from './powerUpInventory';
import { scorePerfectClear, comboMultiplierFromStreak } from './scoring';
import { TileGenerator } from './tileGenerator';
import type {
  LaneState,
  NumberTileData,
  PlacementResult,
  RunConfiguration,
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
  bombQuantity: number;
  freezeQuantity: number;
  shieldQuantity: number;
  wildQuantity: number;
  tileGenerator: TileGenerator;
  config: RunConfiguration;
};

export function createNewRun(
  config: RunConfiguration = getClassicConfig(),
  startingInventory?: Partial<RunPowerInventory>,
): NewRunState {
  const tileGenerator = config.seed
    ? TileGenerator.fromSeed(config.seed)
    : new TileGenerator();
  const currentTile = tileGenerator.next();
  const nextTile = tileGenerator.next();
  const enabled = config.powerUpsEnabled;
  return {
    lanes: createEmptyLanes(),
    score: 0,
    comboStreak: 0,
    comboMultiplier: 1,
    strikesRemaining: config.maximumStrikes,
    currentTile,
    nextTile,
    runStats: createEmptyRunStats(),
    multiplierQuantity: enabled
      ? Math.max(
          0,
          startingInventory?.multiplier ?? MULTIPLIER_STARTING_QUANTITY,
        )
      : 0,
    multiplierSelected: false,
    swapQuantity: enabled
      ? Math.max(0, startingInventory?.swap ?? SWAP_STARTING_QUANTITY)
      : 0,
    bombQuantity: enabled ? Math.max(0, startingInventory?.bomb ?? 0) : 0,
    freezeQuantity: enabled ? Math.max(0, startingInventory?.freeze ?? 0) : 0,
    shieldQuantity: enabled ? Math.max(0, startingInventory?.shield ?? 0) : 0,
    wildQuantity: enabled ? Math.max(0, startingInventory?.wild ?? 0) : 0,
    tileGenerator,
    config,
  };
}

export function effectiveTileValue(
  tile: NumberTileData,
  multiplierSelected: boolean,
  wildValue: number | null = null,
): number {
  if (wildValue != null) {
    return Math.max(1, Math.min(10, Math.floor(wildValue)));
  }
  return multiplierSelected ? tile.value * MULTIPLIER_FACTOR : tile.value;
}

export function clearLaneWithBomb(
  lanes: LaneState[],
  laneIndex: number,
): { ok: true; lanes: LaneState[] } | { ok: false; reason: string } {
  const lane = lanes[laneIndex];
  if (!lane) return { ok: false, reason: 'Invalid lane' };
  if (lane.total <= 0) return { ok: false, reason: 'Lane is empty' };
  const next = lanes.map((l, i) =>
    i === laneIndex
      ? { ...l, total: 0, status: 'default' as const }
      : { ...l, status: 'default' as const },
  );
  return { ok: true, lanes: next };
}

/**
 * Pure placement resolution. Does not mutate inputs.
 * When maximumTiles is reached, holds tiles (no new playable tile) and ends the run.
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
  maximumTiles?: number | null;
  wildValue?: number | null;
  freezeActive?: boolean;
  shieldArmed?: boolean;
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
    maximumTiles = null,
    wildValue = null,
    freezeActive = false,
    shieldArmed = false,
  } = args;

  const previousTotal = lanes[laneIndex].total;
  const usingWild = wildValue != null;
  const value = effectiveTileValue(
    currentTile,
    usingWild ? false : multiplierSelected,
    wildValue,
  );
  const newTotal = previousTotal + value;
  const consumedMultiplier = !usingWild && multiplierSelected;
  const nextMultiplierQuantity = consumedMultiplier
    ? Math.max(0, multiplierQuantity - 1)
    : multiplierQuantity;
  const consumedWild = usingWild;
  const consumedFreeze = freezeActive;

  const nextLanes = lanes.map((lane, i) =>
    i === laneIndex ? { ...lane } : { ...lane, status: 'default' as const },
  );

  const markLimit = (tilesPlaced: number, alreadyOver: boolean) => {
    const hitLimit = maximumTiles != null && tilesPlaced >= maximumTiles;
    return {
      tileLimitReached: hitLimit,
      gameOver: alreadyOver || hitLimit,
      holdTiles: hitLimit || freezeActive,
    };
  };

  const advanceTiles = (holdTiles: boolean) => {
    if (holdTiles) {
      return { currentTile, nextTile };
    }
    return {
      currentTile: nextTile,
      nextTile: tileGenerator.next(),
    };
  };

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
      maxComboMultiplier: Math.max(
        runStats.maxComboMultiplier,
        comboMultiplier,
      ),
    };
    nextLanes[laneIndex] = {
      ...nextLanes[laneIndex],
      total: newTotal,
      status: 'perfect',
    };
    const limit = markLimit(nextStats.tilesPlaced, false);
    const tiles = advanceTiles(limit.holdTiles);
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
      consumedFreeze,
      consumedWild,
      consumedShield: false,
      shieldBlocked: false,
      gameOver: limit.gameOver,
      tileLimitReached: limit.tileLimitReached,
      lanes: nextLanes,
      score: nextScore,
      runStats: nextStats,
      currentTile: tiles.currentTile,
      nextTile: tiles.nextTile,
      multiplierQuantity: nextMultiplierQuantity,
      multiplierSelected: false,
    };
  }

  if (newTotal > TARGET_VALUE) {
    const shieldBlocked = shieldArmed;
    const nextStrikes = shieldBlocked
      ? strikesRemaining
      : Math.max(0, strikesRemaining - 1);
    const nextStats: RunStats = {
      ...runStats,
      tilesPlaced: runStats.tilesPlaced + 1,
      strikesUsed: shieldBlocked
        ? runStats.strikesUsed
        : runStats.strikesUsed + 1,
      score,
    };
    nextLanes[laneIndex] = {
      ...nextLanes[laneIndex],
      total: newTotal,
      status: 'bust',
    };
    const limit = markLimit(nextStats.tilesPlaced, nextStrikes <= 0);
    const tiles = advanceTiles(limit.holdTiles);
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
      consumedFreeze,
      consumedWild,
      consumedShield: shieldBlocked,
      shieldBlocked,
      gameOver: limit.gameOver,
      tileLimitReached: limit.tileLimitReached,
      lanes: nextLanes,
      score,
      runStats: nextStats,
      currentTile: tiles.currentTile,
      nextTile: tiles.nextTile,
      multiplierQuantity: nextMultiplierQuantity,
      multiplierSelected: false,
    };
  }

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
  const limit = markLimit(nextStats.tilesPlaced, false);
  const tiles = advanceTiles(limit.holdTiles);
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
    consumedFreeze,
    consumedWild,
    consumedShield: false,
    shieldBlocked: false,
    gameOver: limit.gameOver,
    tileLimitReached: limit.tileLimitReached,
    lanes: nextLanes,
    score,
    runStats: nextStats,
    currentTile: tiles.currentTile,
    nextTile: tiles.nextTile,
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
