/**
 * Development seed-stability checks for Daily Tournament.
 * Run: npx tsx src/game/seedStabilityCheck.ts
 */
import { assertSeedStability, TileGenerator } from './tileGenerator';
import { MAX_TILE_VALUE, MIN_TILE_VALUE } from './gameConstants';
import { getDailySeed } from './dailyTournament';

function run(): void {
  const seedA = getDailySeed('2026-07-23');
  const seedB = getDailySeed('2026-07-24');

  if (!assertSeedStability(seedA, 40)) {
    throw new Error('Same seed produced different sequences');
  }

  const a = TileGenerator.previewSeed(seedA, 40);
  const b = TileGenerator.previewSeed(seedA, 40);
  const c = TileGenerator.previewSeed(seedB, 40);

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
  console.log('sample first 10:', a.slice(0, 10).join(', '));
}

run();
