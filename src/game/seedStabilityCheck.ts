/**
 * Development seed-stability checks for competitive tile generation.
 * Run: npx tsx src/game/seedStabilityCheck.ts
 * (or import assertSeedStability in __DEV__ tooling)
 */
import {
  assertSeedStability,
  TileGenerator,
} from './tileGenerator';
import { MAX_TILE_VALUE, MIN_TILE_VALUE } from './gameConstants';

function firstN(seed: string, n: number): number[] {
  const gen = TileGenerator.fromSeed(seed);
  return Array.from({ length: n }, () => gen.next().value);
}

function run(): void {
  const seedA = 'number-rush-daily-2026-07-23';
  const seedB = 'number-rush-daily-2026-07-24';

  if (!assertSeedStability(seedA, 40)) {
    throw new Error('Same seed produced different sequences');
  }

  const a = firstN(seedA, 40);
  const b = firstN(seedA, 40);
  const c = firstN(seedB, 40);

  if (a.join(',') !== b.join(',')) {
    throw new Error('Repeated same-seed run mismatch');
  }
  if (a.join(',') === c.join(',')) {
    throw new Error('Different seeds produced identical sequences');
  }

  for (const value of [...a, ...c]) {
    if (value < MIN_TILE_VALUE || value > MAX_TILE_VALUE) {
      throw new Error(`Tile out of range: ${value}`);
    }
  }

  // eslint-disable-next-line no-console
  console.log('seedStabilityCheck: OK');
  // eslint-disable-next-line no-console
  console.log('sample daily seed first 10:', a.slice(0, 10).join(', '));
}

run();
