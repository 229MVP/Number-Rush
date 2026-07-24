import { getDailySeed, getUtcDateKey } from '../dailyTournament';
import { getDailyConfig } from '../gameModes';
import { TileGenerator } from '../tileGenerator';

function take(gen: TileGenerator, n: number): number[] {
  return Array.from({ length: n }, () => gen.next().value);
}

describe('TileGenerator seeding', () => {
  it('same seed returns the same first 40 tiles', () => {
    const a = take(TileGenerator.fromSeed('daily-2026-07-24'), 40);
    const b = take(TileGenerator.fromSeed('daily-2026-07-24'), 40);
    expect(a).toEqual(b);
  });

  it('different seeds return different sequences', () => {
    const a = take(TileGenerator.fromSeed('seed-a'), 20);
    const b = take(TileGenerator.fromSeed('seed-b'), 20);
    expect(a).not.toEqual(b);
  });

  it('every value remains between 1 and 10', () => {
    const values = take(TileGenerator.fromSeed('bounds'), 200);
    expect(values.every((v) => v >= 1 && v <= 10)).toBe(true);
  });

  it('Daily date seed is stable for a UTC date', () => {
    const key = '2026-07-24';
    expect(getDailySeed(key)).toBe(getDailySeed(key));
    expect(getUtcDateKey(new Date('2026-07-24T12:00:00.000Z'))).toBe(key);
  });

  it('Daily official and practice configs share the same seed', () => {
    const day = new Date('2026-07-24T12:00:00.000Z');
    const official = getDailyConfig(true, day);
    const practice = getDailyConfig(false, day);
    expect(official.seed).toBe(practice.seed);
    expect(official.maximumTiles).toBe(40);
    expect(practice.maximumTiles).toBe(40);
  });
});
