import { DAILY_MAX_TILES, MAX_STRIKES, TARGET_VALUE } from './gameConstants';
import { getDailySeed, getUtcDateKey } from './dailyTournament';
import type { RunConfiguration } from './gameTypes';

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

export function resolveRunConfig(partial?: {
  mode?: 'classic' | 'daily';
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
  return getClassicConfig();
}
