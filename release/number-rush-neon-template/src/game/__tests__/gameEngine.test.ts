import {
  clearLaneWithBomb,
  createNewRun,
  effectiveTileValue,
  resolveLanePlacement,
  swapLaneTotals,
} from '../gameEngine';
import { getClassicConfig, getDailyConfig } from '../gameModes';
import { TileGenerator } from '../tileGenerator';
import { makeLanes, makeRunStats, makeTile } from '../../test/factories';

describe('createNewRun', () => {
  it('starts with four zero lanes and three strikes', () => {
    const run = createNewRun(getClassicConfig());
    expect(run.lanes).toHaveLength(4);
    expect(run.lanes.every((l) => l.total === 0)).toBe(true);
    expect(run.strikesRemaining).toBe(3);
  });

  it('keeps tile values between 1 and 10', () => {
    const run = createNewRun(getClassicConfig());
    expect(run.currentTile.value).toBeGreaterThanOrEqual(1);
    expect(run.currentTile.value).toBeLessThanOrEqual(10);
    expect(run.nextTile.value).toBeGreaterThanOrEqual(1);
    expect(run.nextTile.value).toBeLessThanOrEqual(10);
  });

  it('loads inventory quantities when power-ups enabled', () => {
    const run = createNewRun(getClassicConfig(), {
      multiplier: 4,
      swap: 1,
      bomb: 2,
      freeze: 1,
      shield: 1,
      wild: 3,
    });
    expect(run.multiplierQuantity).toBe(4);
    expect(run.swapQuantity).toBe(1);
    expect(run.bombQuantity).toBe(2);
    expect(run.freezeQuantity).toBe(1);
    expect(run.shieldQuantity).toBe(1);
    expect(run.wildQuantity).toBe(3);
  });

  it('zeros power-ups for Daily', () => {
    const run = createNewRun(
      getDailyConfig(true, new Date('2026-07-24T12:00:00.000Z')),
    );
    expect(run.multiplierQuantity).toBe(0);
    expect(run.bombQuantity).toBe(0);
  });
});

describe('resolveLanePlacement', () => {
  const gen = TileGenerator.fromSeed('test-seed');

  function baseArgs(overrides: Record<string, unknown> = {}) {
    return {
      lanes: makeLanes([10, 0, 0, 0]),
      laneIndex: 0,
      currentTile: makeTile(5),
      nextTile: makeTile(7),
      score: 0,
      comboStreak: 0,
      strikesRemaining: 3,
      runStats: makeRunStats(),
      multiplierSelected: false,
      multiplierQuantity: 2,
      tileGenerator: gen,
      ...overrides,
    };
  }

  it('updates the correct lane on normal placement without Perfect points', () => {
    const result = resolveLanePlacement(baseArgs());
    expect(result.outcome).toBe('normal');
    expect(result.lanes[0].total).toBe(15);
    expect(result.pointsAwarded).toBe(0);
    expect(result.currentTile.value).toBe(7);
  });

  it('triggers Perfect at exactly 21 and resets lane after feedback status', () => {
    const result = resolveLanePlacement(
      baseArgs({ lanes: makeLanes([16, 0, 0, 0]), currentTile: makeTile(5) }),
    );
    expect(result.outcome).toBe('perfect');
    expect(result.newTotal).toBe(21);
    expect(result.pointsAwarded).toBe(100);
    expect(result.lanes[0].status).toBe('perfect');
  });

  it('triggers Bust over 21 and removes a strike', () => {
    const result = resolveLanePlacement(
      baseArgs({ lanes: makeLanes([18, 0, 0, 0]), currentTile: makeTile(5) }),
    );
    expect(result.outcome).toBe('bust');
    expect(result.strikesRemaining).toBe(2);
    expect(result.comboStreak).toBe(0);
  });

  it('Shield prevents one strike loss on Bust', () => {
    const result = resolveLanePlacement(
      baseArgs({
        lanes: makeLanes([18, 0, 0, 0]),
        currentTile: makeTile(5),
        shieldArmed: true,
      }),
    );
    expect(result.outcome).toBe('bust');
    expect(result.shieldBlocked).toBe(true);
    expect(result.consumedShield).toBe(true);
    expect(result.strikesRemaining).toBe(3);
    expect(result.comboStreak).toBe(0);
  });

  it('ends the run after three unshielded Busts', () => {
    const result = resolveLanePlacement(
      baseArgs({
        lanes: makeLanes([18, 0, 0, 0]),
        currentTile: makeTile(5),
        strikesRemaining: 1,
      }),
    );
    expect(result.gameOver).toBe(true);
    expect(result.strikesRemaining).toBe(0);
  });

  it('Multiplier doubles tile value and marks consumption', () => {
    const result = resolveLanePlacement(
      baseArgs({
        lanes: makeLanes([0, 0, 0, 0]),
        currentTile: makeTile(4),
        multiplierSelected: true,
        multiplierQuantity: 2,
      }),
    );
    expect(result.effectiveValue).toBe(8);
    expect(result.consumedMultiplier).toBe(true);
    expect(result.multiplierQuantity).toBe(1);
  });

  it('Wild uses selected value and does not consume multiplier', () => {
    const result = resolveLanePlacement(
      baseArgs({
        lanes: makeLanes([11, 0, 0, 0]),
        currentTile: makeTile(9),
        multiplierSelected: true,
        wildValue: 10,
      }),
    );
    expect(result.effectiveValue).toBe(10);
    expect(result.newTotal).toBe(21);
    expect(result.consumedWild).toBe(true);
    expect(result.consumedMultiplier).toBe(false);
  });

  it('Freeze keeps current and next tiles', () => {
    const current = makeTile(6, 'cur');
    const next = makeTile(4, 'nxt');
    const result = resolveLanePlacement(
      baseArgs({
        lanes: makeLanes([0, 0, 0, 0]),
        currentTile: current,
        nextTile: next,
        freezeActive: true,
      }),
    );
    expect(result.consumedFreeze).toBe(true);
    expect(result.currentTile.id).toBe('cur');
    expect(result.nextTile.id).toBe('nxt');
  });

  it('applies combo progression across consecutive Perfects', () => {
    const first = resolveLanePlacement(
      baseArgs({
        lanes: makeLanes([16, 0, 0, 0]),
        currentTile: makeTile(5),
        comboStreak: 0,
      }),
    );
    expect(first.comboMultiplier).toBe(1);
    const second = resolveLanePlacement(
      baseArgs({
        lanes: makeLanes([16, 0, 0, 0]),
        currentTile: makeTile(5),
        comboStreak: 1,
      }),
    );
    expect(second.comboMultiplier).toBe(2);
    const fourth = resolveLanePlacement(
      baseArgs({
        lanes: makeLanes([16, 0, 0, 0]),
        currentTile: makeTile(5),
        comboStreak: 3,
      }),
    );
    expect(fourth.comboMultiplier).toBe(3);
  });
});

describe('clearLaneWithBomb / swap', () => {
  it('clears a nonempty lane and rejects empty', () => {
    const ok = clearLaneWithBomb(makeLanes([12, 0, 0, 0]), 0);
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.lanes[0].total).toBe(0);
    const empty = clearLaneWithBomb(makeLanes([0, 0, 0, 0]), 0);
    expect(empty.ok).toBe(false);
  });

  it('swaps two lane totals without changing others', () => {
    const swapped = swapLaneTotals(makeLanes([3, 8, 1, 0]), 0, 1);
    expect(swapped[0].total).toBe(8);
    expect(swapped[1].total).toBe(3);
    expect(swapped[2].total).toBe(1);
  });
});

describe('effectiveTileValue', () => {
  it('prefers wild over multiplier', () => {
    expect(effectiveTileValue(makeTile(5), true, 9)).toBe(9);
    expect(effectiveTileValue(makeTile(5), true, null)).toBe(10);
  });
});
