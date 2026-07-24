import { validateRunEvents } from '../runValidator';
import { TileGenerator } from '../tileGenerator';
import {
  createEmptyLanes,
  createEmptyRunStats,
  resolveLanePlacement,
} from '../gameEngine';
import { MAX_STRIKES } from '../gameConstants';
import type { RunEvent } from '../runEvents';

function playPerfectLane(seed: string, laneIndex: number): RunEvent[] {
  const gen = TileGenerator.fromSeed(seed);
  const events: RunEvent[] = [];
  let lanes = createEmptyLanes();
  let score = 0;
  let comboStreak = 0;
  let strikesRemaining = MAX_STRIKES;
  let runStats = createEmptyRunStats();
  let currentTile = gen.next();
  let nextTile = gen.next();

  for (let seq = 0; seq < 3; seq += 1) {
    if (currentTile.type !== 'number') break;
    const result = resolveLanePlacement({
      lanes,
      laneIndex,
      currentTile,
      nextTile,
      score,
      comboStreak,
      strikesRemaining,
      runStats,
      multiplierSelected: false,
      multiplierQuantity: 0,
      tileGenerator: gen,
      maximumTiles: 30,
      wildValue: null,
      freezeActive: false,
      shieldArmed: false,
    });
    events.push({
      type: 'place',
      seq,
      tileValue: currentTile.value,
      laneIndex,
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

  return events;
}

describe('validateRunEvents', () => {
  const seed = 'ranked-test-seed-42';

  it('accepts a replayed ranked run', () => {
    const events = playPerfectLane(seed, 0);
    const dry = validateRunEvents({
      mode: 'ranked',
      seed,
      events,
      claimedScore: 0,
      maximumTiles: 30,
    });
    expect(dry.ok).toBe(true);
    if (!dry.ok) return;
    const result = validateRunEvents({
      mode: 'ranked',
      seed,
      events,
      claimedScore: dry.replayedScore,
      maximumTiles: 30,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects score mismatch', () => {
    const events = playPerfectLane(seed, 1);
    const result = validateRunEvents({
      mode: 'ranked',
      seed,
      events,
      claimedScore: 999_999,
      maximumTiles: 30,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('score_mismatch');
    }
  });

  it('rejects empty event log', () => {
    const result = validateRunEvents({
      mode: 'ranked',
      seed,
      events: [],
      claimedScore: 0,
    });
    expect(result).toEqual({
      ok: false,
      code: 'empty_events',
      message: 'No run events',
    });
  });
});
