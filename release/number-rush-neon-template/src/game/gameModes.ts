import {
  DAILY_MAX_TILES,
  MAX_STRIKES,
  RANKED_MAX_TILES,
  TARGET_VALUE,
} from './gameConstants';
import { getDailySeed, getUtcDateKey } from './dailyTournament';
import type { GameMode, RunConfiguration } from './gameTypes';

export const CLASSIC_CONFIG: RunConfiguration = {
  mode: 'classic',
  targetValue: TARGET_VALUE,
  maximumStrikes: MAX_STRIKES,
  maximumTiles: null,
  seed: null,
  powerUpsEnabled: true,
  officialAttempt: false,
};

export function getClassicConfig(): RunConfiguration {
  return { ...CLASSIC_CONFIG };
}

export function getDailyConfig(
  officialAttempt: boolean,
  date: Date = new Date(),
): RunConfiguration {
  const dateKey = getUtcDateKey(date);
  return {
    mode: 'daily',
    targetValue: TARGET_VALUE,
    maximumStrikes: MAX_STRIKES,
    maximumTiles: DAILY_MAX_TILES,
    seed: getDailySeed(dateKey),
    powerUpsEnabled: false,
    officialAttempt,
  };
}

export function getRankedConfig(seed: string): RunConfiguration {
  if (!seed.trim()) {
    throw new Error('Ranked mode requires a server-issued seed');
  }
  return {
    mode: 'ranked',
    targetValue: TARGET_VALUE,
    maximumStrikes: MAX_STRIKES,
    maximumTiles: RANKED_MAX_TILES,
    seed: seed.trim(),
    powerUpsEnabled: false,
    officialAttempt: true,
  };
}

export function resolveRunConfig(partial?: {
  mode?: GameMode;
  seed?: string;
  officialAttempt?: boolean;
}): RunConfiguration {
  const mode = partial?.mode ?? 'classic';
  if (mode === 'daily') {
    const config = getDailyConfig(partial?.officialAttempt ?? true);
    if (partial?.seed) {
      return { ...config, seed: partial.seed };
    }
    return config;
  }
  if (mode === 'ranked') {
    if (!partial?.seed) {
      throw new Error('Ranked mode requires a seed');
    }
    return getRankedConfig(partial.seed);
  }
  return getClassicConfig();
}
