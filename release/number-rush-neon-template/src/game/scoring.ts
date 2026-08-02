import { PERFECT_BASE_SCORE } from './gameConstants';

/**
 * Combo multiplier from consecutive perfect streak length.
 *
 * Perfect streak 0–1 → x1
 * Perfect streak 2–3 → x2
 * Perfect streak 4–5 → x3
 * Perfect streak 6+  → x4
 */
export function comboMultiplierFromStreak(perfectStreak: number): number {
  if (perfectStreak >= 6) return 4;
  if (perfectStreak >= 4) return 3;
  if (perfectStreak >= 2) return 2;
  return 1;
}

/**
 * Perfect-clear scoring order (documented):
 * 1. Increment the perfect streak for this clear.
 * 2. Derive the combo multiplier from the *new* streak.
 * 3. Award PERFECT_BASE_SCORE × that multiplier.
 *
 * Examples with base 100:
 * - 1st consecutive perfect → streak 1 → x1 → 100
 * - 2nd consecutive perfect → streak 2 → x2 → 200
 * - 3rd consecutive perfect → streak 3 → x2 → 200
 * - 4th consecutive perfect → streak 4 → x3 → 300
 */
export function scorePerfectClear(newPerfectStreak: number): {
  points: number;
  comboMultiplier: number;
} {
  const comboMultiplier = comboMultiplierFromStreak(newPerfectStreak);
  return {
    points: PERFECT_BASE_SCORE * comboMultiplier,
    comboMultiplier,
  };
}
