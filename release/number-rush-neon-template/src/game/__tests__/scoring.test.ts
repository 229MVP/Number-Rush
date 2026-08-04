import { comboMultiplierFromStreak, scorePerfectClear } from '../scoring';

describe('comboMultiplierFromStreak', () => {
  it('maps streak bands to multipliers', () => {
    expect(comboMultiplierFromStreak(0)).toBe(1);
    expect(comboMultiplierFromStreak(1)).toBe(1);
    expect(comboMultiplierFromStreak(2)).toBe(2);
    expect(comboMultiplierFromStreak(3)).toBe(2);
    expect(comboMultiplierFromStreak(4)).toBe(3);
    expect(comboMultiplierFromStreak(5)).toBe(3);
    expect(comboMultiplierFromStreak(6)).toBe(4);
    expect(comboMultiplierFromStreak(10)).toBe(4);
  });
});

describe('scorePerfectClear', () => {
  it('awards base × multiplier for first through fourth perfects', () => {
    expect(scorePerfectClear(1)).toEqual({ points: 100, comboMultiplier: 1 });
    expect(scorePerfectClear(2)).toEqual({ points: 200, comboMultiplier: 2 });
    expect(scorePerfectClear(3)).toEqual({ points: 200, comboMultiplier: 2 });
    expect(scorePerfectClear(4)).toEqual({ points: 300, comboMultiplier: 3 });
    expect(scorePerfectClear(6)).toEqual({ points: 400, comboMultiplier: 4 });
  });
});
