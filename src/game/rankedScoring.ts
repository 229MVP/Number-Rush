import {
  DIVISION_COLORS,
  DIVISION_EMOJI,
  DIVISION_RANGES,
} from './gameConstants';
import type {
  RankedDivision,
  RankedDivisionInfo,
  RankedPointBreakdown,
  RankedProfile,
  RankedSubdivision,
  RunStats,
} from './gameTypes';

export type { RankedPointBreakdown };

export function getDivisionForPoints(points: number): RankedDivision {
  const p = Math.max(0, Math.floor(points));
  for (let i = DIVISION_RANGES.length - 1; i >= 0; i -= 1) {
    const range = DIVISION_RANGES[i];
    if (p >= range.min) return range.division;
  }
  return 'bronze';
}

function subdivisionForProgress(t: number): RankedSubdivision {
  if (t < 1 / 3) return 'III';
  if (t < 2 / 3) return 'II';
  return 'I';
}

/**
 * Returns division + III/II/I subdivision and progress within the current segment.
 */
export function getRankedDivisionInfo(points: number): RankedDivisionInfo {
  const p = Math.max(0, Math.floor(points));
  const division = getDivisionForPoints(p);
  const range = DIVISION_RANGES.find((r) => r.division === division)!;
  const rangeMax = range.max;
  const span = rangeMax == null ? 1000 : range.max! - range.min;
  const local = p - range.min;
  const t = rangeMax == null ? Math.min(0.999, local / span) : Math.min(0.999, local / span);
  const subdivision = subdivisionForProgress(t);
  const segmentSize = span / 3;
  const segIndex = subdivision === 'III' ? 0 : subdivision === 'II' ? 1 : 2;
  const segmentMin = Math.floor(range.min + segIndex * segmentSize);
  const segmentMax =
    rangeMax == null && segIndex === 2
      ? null
      : Math.floor(range.min + (segIndex + 1) * segmentSize) - (segIndex === 2 && rangeMax != null ? 0 : 1);
  const segHi =
    segmentMax == null
      ? segmentMin + Math.floor(segmentSize) - 1
      : segIndex === 2 && rangeMax != null
        ? rangeMax - 1
        : segmentMax;
  const progressPct =
    segHi <= segmentMin
      ? 100
      : Math.min(100, Math.max(0, ((p - segmentMin) / (segHi - segmentMin + 1)) * 100));

  return {
    division,
    subdivision,
    label: `${division.toUpperCase()} ${subdivision}`,
    rangeMin: range.min,
    rangeMax: rangeMax,
    segmentMin,
    segmentMax: segHi,
    progressPct,
    color: DIVISION_COLORS[division],
    emoji: DIVISION_EMOJI[division],
  };
}

/**
 * Ranked point formula (local prototype).
 *
 * Base from final score (30-tile run):
 * 0–299 → loss -25
 * 300–599 → loss -15
 * 600–899 → draw +5
 * 900–1199 → win +20
 * 1200–1499 → strong win +30
 * 1500+ → dominant win +40
 *
 * Bonuses:
 * - Finished without using all strikes: +10
 * - Max combo x3: +5 ; x4+: +10
 * - ≥5 perfect clears: +5
 *
 * Caps: total earned ≤ +60 ; total loss ≥ -25
 */
export function calculateRankedPoints(
  stats: RunStats,
  maxStrikes: number,
): RankedPointBreakdown {
  const score = stats.score;
  let basePoints: number;
  let outcome: 'win' | 'loss' | 'draw';

  if (score < 300) {
    basePoints = -25;
    outcome = 'loss';
  } else if (score < 600) {
    basePoints = -15;
    outcome = 'loss';
  } else if (score < 900) {
    basePoints = 5;
    outcome = 'draw';
  } else if (score < 1200) {
    basePoints = 20;
    outcome = 'win';
  } else if (score < 1500) {
    basePoints = 30;
    outcome = 'win';
  } else {
    basePoints = 40;
    outcome = 'win';
  }

  const survivalBonus =
    stats.strikesUsed < maxStrikes ? 10 : 0;

  let comboBonus = 0;
  if (stats.maxComboMultiplier >= 4) comboBonus = 10;
  else if (stats.maxComboMultiplier >= 3) comboBonus = 5;

  const perfectBonus = stats.perfectClears >= 5 ? 5 : 0;

  let total = basePoints + survivalBonus + comboBonus + perfectBonus;
  if (total > 60) total = 60;
  if (total < -25) total = -25;

  return {
    basePoints,
    survivalBonus,
    comboBonus,
    perfectBonus,
    total,
    outcome,
  };
}

export function applyRankedResult(
  profile: RankedProfile,
  breakdown: RankedPointBreakdown,
): RankedProfile {
  const rankedPoints = Math.max(0, profile.rankedPoints + breakdown.total);
  const division = getDivisionForPoints(rankedPoints);
  const won = breakdown.outcome === 'win';
  const lost = breakdown.outcome === 'loss';
  const currentWinStreak = won ? profile.currentWinStreak + 1 : 0;
  return {
    rankedPoints,
    division,
    seasonHighPoints: Math.max(profile.seasonHighPoints, rankedPoints),
    rankedGamesPlayed: profile.rankedGamesPlayed + 1,
    rankedWins: profile.rankedWins + (won ? 1 : 0),
    rankedLosses: profile.rankedLosses + (lost ? 1 : 0),
    currentWinStreak,
    bestWinStreak: Math.max(profile.bestWinStreak, currentWinStreak),
  };
}
