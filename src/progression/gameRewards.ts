import type { GameMode } from '../game/gameTypes';
import type { GameReward } from './progressionTypes';

export type ClassicRewardInput = {
  mode: 'classic';
  score: number;
  perfectClears: number;
};

export type DailyRewardInput = {
  mode: 'daily';
  score: number;
  perfectClears: number;
  officialAttempt: boolean;
  calculatedRank: number | null;
};

export type RankedRewardInput = {
  mode: 'ranked';
  score: number;
  perfectClears: number;
  outcome: 'win' | 'loss' | 'draw';
  divisionPromoted: boolean;
  promotedToBlaze: boolean;
};

export type RewardInput =
  | ClassicRewardInput
  | DailyRewardInput
  | RankedRewardInput;

const MAX_XP = 500;
const MAX_COINS = 1000;
const MAX_GEMS = 15;

function clampReward(xp: number, coins: number, gems: number): {
  xp: number;
  coins: number;
  gems: number;
} {
  return {
    xp: Math.min(MAX_XP, Math.max(0, Math.floor(xp))),
    coins: Math.min(MAX_COINS, Math.max(0, Math.floor(coins))),
    gems: Math.min(MAX_GEMS, Math.max(0, Math.floor(gems))),
  };
}

export function calculateClassicReward(input: ClassicRewardInput): GameReward {
  const baseXp = 20;
  const scoreXp = Math.floor(input.score / 100);
  const perfectXp = input.perfectClears * 5;
  const baseCoins = 25;
  const scoreCoins = Math.floor(input.score / 50);
  const perfectCoins = input.perfectClears * 3;
  const gemsAwarded = input.score >= 1000 ? 1 : 0;
  const capped = clampReward(
    baseXp + scoreXp + perfectXp,
    baseCoins + scoreCoins + perfectCoins,
    gemsAwarded,
  );
  return {
    ...capped,
    reasonBreakdown: {
      baseXp,
      scoreXp,
      perfectXp,
      modeBonusXp: 0,
      baseCoins,
      scoreCoins,
      perfectCoins,
      gemsAwarded,
    },
  };
}

export function calculateDailyReward(input: DailyRewardInput): GameReward {
  const baseXp = 50;
  const scoreXp = Math.floor(input.score / 75);
  const perfectXp = input.perfectClears * 7;
  const baseCoins = 75;
  const scoreCoins = Math.floor(input.score / 40);
  let gemsAwarded = 0;
  if (input.officialAttempt) {
    gemsAwarded = 1;
    if (input.calculatedRank != null && input.calculatedRank <= 3) {
      gemsAwarded += 2;
    }
  }

  let xp = baseXp + scoreXp + perfectXp;
  let coins = baseCoins + scoreCoins;

  if (!input.officialAttempt) {
    xp = Math.max(5, Math.floor(xp * 0.25));
    coins = Math.max(5, Math.floor(coins * 0.25));
    gemsAwarded = 0;
  }

  const capped = clampReward(xp, coins, gemsAwarded);
  return {
    ...capped,
    reasonBreakdown: {
      baseXp: input.officialAttempt ? baseXp : Math.floor(baseXp * 0.25),
      scoreXp: input.officialAttempt ? scoreXp : Math.floor(scoreXp * 0.25),
      perfectXp: input.officialAttempt ? perfectXp : Math.floor(perfectXp * 0.25),
      modeBonusXp: 0,
      baseCoins: input.officialAttempt ? baseCoins : Math.floor(baseCoins * 0.25),
      scoreCoins: input.officialAttempt ? scoreCoins : Math.floor(scoreCoins * 0.25),
      perfectCoins: 0,
      gemsAwarded,
    },
  };
}

export function calculateRankedReward(input: RankedRewardInput): GameReward {
  let baseXp = 20;
  let baseCoins = 20;
  if (input.outcome === 'draw') {
    baseXp = 35;
    baseCoins = 40;
  } else if (input.outcome === 'win') {
    baseXp = 60;
    baseCoins = 75;
  }
  const scoreXp = Math.floor(input.score / 75);
  const perfectXp = input.perfectClears * 6;
  let gemsAwarded = 0;
  if (input.outcome === 'win') gemsAwarded += 1;
  if (input.divisionPromoted) gemsAwarded += 3;
  if (input.promotedToBlaze) gemsAwarded += 10;

  const capped = clampReward(
    baseXp + scoreXp + perfectXp,
    baseCoins,
    gemsAwarded,
  );
  return {
    ...capped,
    reasonBreakdown: {
      baseXp,
      scoreXp,
      perfectXp,
      modeBonusXp: 0,
      baseCoins,
      scoreCoins: 0,
      perfectCoins: 0,
      gemsAwarded,
    },
  };
}

export function calculateGameReward(input: RewardInput): GameReward {
  if (input.mode === 'classic') return calculateClassicReward(input);
  if (input.mode === 'daily') return calculateDailyReward(input);
  return calculateRankedReward(input);
}

export type { GameMode };
