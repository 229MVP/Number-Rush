import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../logging/logger';

export const AD_FREQUENCY_STORAGE_KEY = 'numberRush.ads.frequency';

export type AdFrequencyState = {
  completedClassicRunsSinceInterstitial: number;
  lastInterstitialAt: number | null;
  utcDateKey: string;
  interstitialCountToday: number;
  lastRewardedAt: number | null;
  reviveUsedRunId: string | null;
  dailyFreePowerupDateKey: string | null;
  doubleCoinsClaimedKeys: string[];
};

export const DEFAULT_AD_FREQUENCY_STATE: AdFrequencyState = {
  completedClassicRunsSinceInterstitial: 0,
  lastInterstitialAt: null,
  utcDateKey: '',
  interstitialCountToday: 0,
  lastRewardedAt: null,
  reviveUsedRunId: null,
  dailyFreePowerupDateKey: null,
  doubleCoinsClaimedKeys: [],
};

function utcDateKeyFromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function normalizeAdFrequencyState(
  raw: unknown,
): AdFrequencyState {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_AD_FREQUENCY_STATE };
  }
  const o = raw as Record<string, unknown>;
  return {
    completedClassicRunsSinceInterstitial: isFiniteNumber(
      o.completedClassicRunsSinceInterstitial,
    )
      ? Math.max(0, Math.floor(o.completedClassicRunsSinceInterstitial))
      : 0,
    lastInterstitialAt: isFiniteNumber(o.lastInterstitialAt)
      ? o.lastInterstitialAt
      : null,
    utcDateKey:
      typeof o.utcDateKey === 'string' ? o.utcDateKey : '',
    interstitialCountToday: isFiniteNumber(o.interstitialCountToday)
      ? Math.max(0, Math.floor(o.interstitialCountToday))
      : 0,
    lastRewardedAt: isFiniteNumber(o.lastRewardedAt)
      ? o.lastRewardedAt
      : null,
    reviveUsedRunId:
      typeof o.reviveUsedRunId === 'string' ? o.reviveUsedRunId : null,
    dailyFreePowerupDateKey:
      typeof o.dailyFreePowerupDateKey === 'string'
        ? o.dailyFreePowerupDateKey
        : null,
    doubleCoinsClaimedKeys: Array.isArray(o.doubleCoinsClaimedKeys)
      ? o.doubleCoinsClaimedKeys.filter((k): k is string => typeof k === 'string')
      : [],
  };
}

export async function readAdFrequencyState(): Promise<AdFrequencyState> {
  try {
    const raw = await AsyncStorage.getItem(AD_FREQUENCY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AD_FREQUENCY_STATE };
    return normalizeAdFrequencyState(JSON.parse(raw));
  } catch (error) {
    logger.warn('adFrequencyStorage read failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ...DEFAULT_AD_FREQUENCY_STATE };
  }
}

export async function writeAdFrequencyState(
  state: AdFrequencyState,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      AD_FREQUENCY_STORAGE_KEY,
      JSON.stringify(normalizeAdFrequencyState(state)),
    );
  } catch (error) {
    logger.warn('adFrequencyStorage write failed', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export function rollUtcDay(
  state: AdFrequencyState,
  nowMs: number,
): AdFrequencyState {
  const key = utcDateKeyFromMs(nowMs);
  if (state.utcDateKey === key) return state;
  return {
    ...state,
    utcDateKey: key,
    interstitialCountToday: 0,
  };
}

export { utcDateKeyFromMs };

const MAX_DOUBLE_COINS_KEYS = 50;

export async function mutateAdFrequencyState(
  mutator: (state: AdFrequencyState) => AdFrequencyState,
): Promise<AdFrequencyState> {
  const current = await readAdFrequencyState();
  const next = normalizeAdFrequencyState(mutator(current));
  await writeAdFrequencyState(next);
  return next;
}

export async function recordClassicRunComplete(nowMs = Date.now()): Promise<void> {
  await mutateAdFrequencyState((state) => {
    const rolled = rollUtcDay(state, nowMs);
    return {
      ...rolled,
      completedClassicRunsSinceInterstitial:
        rolled.completedClassicRunsSinceInterstitial + 1,
    };
  });
}

export async function recordInterstitialShown(nowMs = Date.now()): Promise<void> {
  await mutateAdFrequencyState((state) => {
    const rolled = rollUtcDay(state, nowMs);
    return {
      ...rolled,
      lastInterstitialAt: nowMs,
      interstitialCountToday: rolled.interstitialCountToday + 1,
    };
  });
}

export function isReviveUsedForRun(
  state: AdFrequencyState,
  runId: string,
): boolean {
  return state.reviveUsedRunId === runId;
}

export async function markReviveUsedForRun(runId: string): Promise<void> {
  await mutateAdFrequencyState((state) => ({
    ...state,
    reviveUsedRunId: runId,
    lastRewardedAt: Date.now(),
  }));
}

export function canClaimDailyFreePowerup(
  state: AdFrequencyState,
  nowMs = Date.now(),
): boolean {
  const key = utcDateKeyFromMs(nowMs);
  return state.dailyFreePowerupDateKey !== key;
}

export async function claimDailyFreePowerup(nowMs = Date.now()): Promise<boolean> {
  const key = utcDateKeyFromMs(nowMs);
  const state = await readAdFrequencyState();
  if (state.dailyFreePowerupDateKey === key) return false;
  await mutateAdFrequencyState((s) => ({
    ...s,
    dailyFreePowerupDateKey: key,
    lastRewardedAt: nowMs,
  }));
  return true;
}

export function hasDoubleCoinsClaimed(
  state: AdFrequencyState,
  rewardKey: string,
): boolean {
  return state.doubleCoinsClaimedKeys.includes(rewardKey);
}

export async function markDoubleCoinsClaimed(rewardKey: string): Promise<void> {
  await mutateAdFrequencyState((state) => {
    if (state.doubleCoinsClaimedKeys.includes(rewardKey)) return state;
    const keys = [...state.doubleCoinsClaimedKeys, rewardKey].slice(
      -MAX_DOUBLE_COINS_KEYS,
    );
    return {
      ...state,
      doubleCoinsClaimedKeys: keys,
      lastRewardedAt: Date.now(),
    };
  });
}
