import type {
  MissionDefinition,
  MissionMetric,
  MissionPeriod,
  MissionReward,
} from './missionTypes';

export type {
  MissionDefinition,
  MissionMetric,
  MissionPeriod,
  MissionReward,
};

export const DAILY_MISSION_POOL: MissionDefinition[] = [
  {
    id: 'daily-play-3',
    period: 'daily',
    title: 'PLAY THREE RUNS',
    description: 'Complete 3 games in any mode.',
    metric: 'games_played',
    target: 3,
    reward: { coins: 150, gems: 0, xp: 25 },
  },
  {
    id: 'daily-perfect-10',
    period: 'daily',
    title: 'PERFECT TEN',
    description: 'Land 10 perfect clears.',
    metric: 'perfect_clears',
    target: 10,
    reward: { coins: 200, gems: 0, xp: 35 },
  },
  {
    id: 'daily-score-1500',
    period: 'daily',
    title: 'SCORE 1,500',
    description: 'Reach 1,500 score in a single run.',
    metric: 'single_run_score',
    target: 1500,
    reward: { coins: 0, gems: 5, xp: 50 },
  },
  {
    id: 'daily-ranked-2',
    period: 'daily',
    title: 'RANKED WARRIOR',
    description: 'Play 2 Ranked matches.',
    metric: 'ranked_games',
    target: 2,
    reward: { coins: 250, gems: 0, xp: 50 },
  },
  {
    id: 'daily-combo-3',
    period: 'daily',
    title: 'COMBO MASTER',
    description: 'Reach a x3 combo multiplier.',
    metric: 'reach_combo',
    target: 3,
    reward: { coins: 150, gems: 0, xp: 30, inventory: { multiplier: 1 } },
  },
  {
    id: 'daily-tiles-75',
    period: 'daily',
    title: 'TILE STACKER',
    description: 'Place 75 tiles.',
    metric: 'tiles_placed',
    target: 75,
    reward: { coins: 200, gems: 0, xp: 30 },
  },
  {
    id: 'daily-contender',
    period: 'daily',
    title: 'DAILY CONTENDER',
    description: 'Play today’s Daily Tournament once.',
    metric: 'daily_attempts',
    target: 1,
    reward: { coins: 100, gems: 2, xp: 30 },
  },
  {
    id: 'daily-power-2',
    period: 'daily',
    title: 'POWER PLAYER',
    description: 'Use Multiplier twice in Classic.',
    metric: 'use_multiplier',
    target: 2,
    reward: { coins: 100, gems: 0, xp: 0, inventory: { multiplier: 1 } },
  },
];

export const WEEKLY_MISSION_POOL: MissionDefinition[] = [
  {
    id: 'weekly-play-15',
    period: 'weekly',
    title: 'PLAY FIFTEEN RUNS',
    description: 'Complete 15 games this week.',
    metric: 'games_played',
    target: 15,
    reward: { coins: 1000, gems: 0, xp: 200 },
  },
  {
    id: 'weekly-perfect-50',
    period: 'weekly',
    title: 'PERFECT FIFTY',
    description: 'Land 50 perfect clears.',
    metric: 'perfect_clears',
    target: 50,
    reward: { coins: 1500, gems: 10, xp: 0 },
  },
  {
    id: 'weekly-ranked-wins-5',
    period: 'weekly',
    title: 'WIN FIVE RANKED',
    description: 'Win 5 Ranked matches.',
    metric: 'ranked_wins',
    target: 5,
    reward: { coins: 0, gems: 20, xp: 300 },
  },
  {
    id: 'weekly-score-15000',
    period: 'weekly',
    title: 'SCORE 15,000 TOTAL',
    description: 'Accumulate 15,000 score.',
    metric: 'score_total',
    target: 15000,
    reward: { coins: 1000, gems: 0, xp: 200 },
  },
  {
    id: 'weekly-tiles-500',
    period: 'weekly',
    title: 'PLACE 500 TILES',
    description: 'Place 500 tiles this week.',
    metric: 'tiles_placed',
    target: 500,
    reward: { coins: 1250, gems: 0, xp: 250 },
  },
  {
    id: 'weekly-combo-4',
    period: 'weekly',
    title: 'REACH x4 COMBO',
    description: 'Hit a x4 combo multiplier.',
    metric: 'reach_combo',
    target: 4,
    reward: { coins: 0, gems: 10, xp: 0, inventory: { wild: 2 } },
  },
];

/** Deterministic pick of `count` items from pool using date/week key. */
export function selectMissionsForKey(
  pool: MissionDefinition[],
  periodKey: string,
  count: number,
): MissionDefinition[] {
  let h = 2166136261;
  for (let i = 0; i < periodKey.length; i += 1) {
    h ^= periodKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const indices = pool.map((_, i) => i);
  // Fisher-Yates with seeded LCG
  let state = h >>> 0;
  for (let i = indices.length - 1; i > 0; i -= 1) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  return indices.slice(0, count).map((i) => pool[i]);
}
