import {
  DAILY_MAX_TILES,
  MAX_STRIKES,
  RANKED_MAX_TILES,
  TARGET_VALUE,
} from './gameConstants';
import type { GameMode, RunConfiguration } from './gameTypes';

export function getUtcDateKey(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDailySeed(date = new Date()): string {
  return `number-rush-daily-${getUtcDateKey(date)}`;
}

export function getRankedSeed(gameNumber: number, now = Date.now()): string {
  return `number-rush-ranked-${gameNumber}-${now}`;
}

export function getClassicConfig(): RunConfiguration {
  return {
    mode: 'classic',
    targetValue: TARGET_VALUE,
    maxStrikes: MAX_STRIKES,
    maxTiles: null,
    seed: null,
    powerUpsEnabled: true,
    officialAttempt: false,
  };
}

export function getDailyConfig(officialAttempt: boolean, date = new Date()): RunConfiguration {
  return {
    mode: 'daily',
    targetValue: TARGET_VALUE,
    maxStrikes: MAX_STRIKES,
    maxTiles: DAILY_MAX_TILES,
    seed: getDailySeed(date),
    powerUpsEnabled: false,
    officialAttempt,
  };
}

export function getRankedConfig(seed: string): RunConfiguration {
  return {
    mode: 'ranked',
    targetValue: TARGET_VALUE,
    maxStrikes: MAX_STRIKES,
    maxTiles: RANKED_MAX_TILES,
    seed,
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
    return getDailyConfig(partial?.officialAttempt ?? true);
  }
  if (mode === 'ranked') {
    const seed = partial?.seed ?? getRankedSeed(0);
    return getRankedConfig(seed);
  }
  return getClassicConfig();
}
