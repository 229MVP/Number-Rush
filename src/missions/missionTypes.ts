import type { PlayerInventory } from '../progression/progressionTypes';

export type MissionPeriod = 'daily' | 'weekly';

export type MissionMetric =
  | 'games_played'
  | 'classic_games'
  | 'daily_attempts'
  | 'ranked_games'
  | 'ranked_wins'
  | 'score_total'
  | 'single_run_score'
  | 'perfect_clears'
  | 'tiles_placed'
  | 'reach_combo'
  | 'use_multiplier'
  | 'use_swap'
  | 'earn_coins';

export type MissionReward = {
  coins: number;
  gems: number;
  xp: number;
  inventory?: Partial<PlayerInventory>;
};

export type MissionDefinition = {
  id: string;
  period: MissionPeriod;
  title: string;
  description: string;
  metric: MissionMetric;
  target: number;
  reward: MissionReward;
};

export type MissionProgress = {
  missionId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
};

export type MissionPeriodState = {
  periodKey: string;
  missions: MissionProgress[];
};

export type MissionEvent = {
  metric: MissionMetric;
  amount: number;
  highestValue?: number;
};
