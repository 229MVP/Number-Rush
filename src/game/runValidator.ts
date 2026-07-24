import {
  LANE_COUNT,
  MAX_STRIKES,
  MAX_TILE_VALUE,
  MIN_TILE_VALUE,
} from './gameConstants';
import {
  createEmptyLanes,
  createEmptyRunStats,
  resolveLanePlacement,
} from './gameEngine';
import { TileGenerator } from './tileGenerator';
import type { RunEvent, RunMode } from './runEvents';

export type RunValidationResult =
  | { ok: true; replayedScore: number }
  | { ok: false; code: string; message: string };

function isPlacementEvent(
  event: RunEvent,
): event is Extract<RunEvent, { type: 'place' }> {
  return event.type === 'place';
}

export function validateRunEvents(args: {
  mode: RunMode;
  seed: string;
  events: RunEvent[];
  claimedScore: number;
  maximumTiles?: number | null;
}): RunValidationResult {
  const { events, seed, claimedScore } = args;
  const maximumTiles = args.maximumTiles ?? null;

  if (events.length === 0) {
    return { ok: false, code: 'empty_events', message: 'No run events' };
  }

  for (const event of events) {
    if (!isPlacementEvent(event)) {
      return {
        ok: false,
        code: 'powerup_forbidden',
        message: 'Only placement events are allowed',
      };
    }
    if (
      event.tileValue < MIN_TILE_VALUE ||
      event.tileValue > MAX_TILE_VALUE ||
      !Number.isInteger(event.tileValue)
    ) {
      return {
        ok: false,
        code: 'invalid_tile',
        message: 'Tile value must be an integer 1–10',
      };
    }
    if (
      event.laneIndex < 0 ||
      event.laneIndex >= LANE_COUNT ||
      !Number.isInteger(event.laneIndex)
    ) {
      return {
        ok: false,
        code: 'invalid_lane',
        message: 'Lane index must be 0–3',
      };
    }
  }

  const placements = events.filter(isPlacementEvent);
  for (let i = 0; i < placements.length; i += 1) {
    if (placements[i].seq !== i) {
      return {
        ok: false,
        code: 'sequence_gap',
        message: 'Event sequence must be continuous from 0',
      };
    }
  }

  if (placements.length !== events.length) {
    return {
      ok: false,
      code: 'invalid_event_mix',
      message: 'Unexpected event types in run log',
    };
  }

  const tileGenerator = TileGenerator.fromSeed(seed);
  let lanes = createEmptyLanes();
  let score = 0;
  let comboStreak = 0;
  let strikesRemaining = MAX_STRIKES;
  let runStats = createEmptyRunStats();
  let currentTile = tileGenerator.next();
  let nextTile = tileGenerator.next();

  for (const placement of placements) {
    if (currentTile.type !== 'number') {
      return {
        ok: false,
        code: 'generator_mismatch',
        message: 'Expected number tile from seeded generator',
      };
    }
    if (currentTile.value !== placement.tileValue) {
      return {
        ok: false,
        code: 'tile_mismatch',
        message: 'Tile value does not match seeded sequence',
      };
    }

    const result = resolveLanePlacement({
      lanes,
      laneIndex: placement.laneIndex,
      currentTile,
      nextTile,
      score,
      comboStreak,
      strikesRemaining,
      runStats,
      multiplierSelected: false,
      multiplierQuantity: 0,
      tileGenerator,
      maximumTiles,
      wildValue: null,
      freezeActive: false,
      shieldArmed: false,
    });

    lanes = result.lanes;
    score = result.score;
    comboStreak = result.comboStreak;
    strikesRemaining = result.strikesRemaining;
    runStats = result.runStats;
    currentTile = result.currentTile;
    nextTile = result.nextTile;

    if (result.gameOver) break;
  }

  if (runStats.score !== claimedScore) {
    return {
      ok: false,
      code: 'score_mismatch',
      message: `Replay score ${runStats.score} != claimed ${claimedScore}`,
    };
  }

  void args.mode;

  return { ok: true, replayedScore: runStats.score };
}
