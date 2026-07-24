import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUtcDateKey } from '../game/dailyTournament';
import {
  DAILY_MISSION_POOL,
  WEEKLY_MISSION_POOL,
  selectMissionsForKey,
} from '../missions/missionDefinitions';
import type {
  MissionDefinition,
  MissionEvent,
  MissionPeriodState,
  MissionProgress,
} from '../missions/missionTypes';
import {
  applyEconomyTransaction,
  createTransactionId,
  DuplicateTransactionError,
} from './playerStorage';

const KEYS = {
  daily: 'numberRush.missions.daily',
  weekly: 'numberRush.missions.weekly',
} as const;

let writeChain: Promise<void> = Promise.resolve();

function enqueueWrite(task: () => Promise<void>): Promise<void> {
  writeChain = writeChain.then(task).catch(() => undefined);
  return writeChain;
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null || raw === '') return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  return enqueueWrite(async () => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // soft fail
    }
  });
}

/** ISO week key YYYY-Www (UTC). */
export function getUtcWeekKey(date: Date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function createState(
  periodKey: string,
  defs: MissionDefinition[],
): MissionPeriodState {
  return {
    periodKey,
    missions: defs.map(
      (d): MissionProgress => ({
        missionId: d.id,
        progress: 0,
        completed: false,
        claimed: false,
      }),
    ),
  };
}

function normalizeState(
  value: unknown,
  periodKey: string,
  defs: MissionDefinition[],
): MissionPeriodState {
  if (
    value != null &&
    typeof value === 'object' &&
    (value as MissionPeriodState).periodKey === periodKey &&
    Array.isArray((value as MissionPeriodState).missions)
  ) {
    const missions = (value as MissionPeriodState).missions
      .filter((m) => defs.some((d) => d.id === m.missionId))
      .map((m) => ({
        missionId: m.missionId,
        progress: Math.max(0, Math.floor(m.progress || 0)),
        completed: Boolean(m.completed),
        claimed: Boolean(m.claimed),
      }));
    // Ensure all defs present
    for (const d of defs) {
      if (!missions.some((m) => m.missionId === d.id)) {
        missions.push({
          missionId: d.id,
          progress: 0,
          completed: false,
          claimed: false,
        });
      }
    }
    return { periodKey, missions };
  }
  return createState(periodKey, defs);
}

export function getActiveMissionDefinitions(period: 'daily' | 'weekly'): {
  periodKey: string;
  definitions: MissionDefinition[];
} {
  if (period === 'daily') {
    const periodKey = getUtcDateKey();
    return {
      periodKey,
      definitions: selectMissionsForKey(DAILY_MISSION_POOL, periodKey, 3),
    };
  }
  const periodKey = getUtcWeekKey();
  return {
    periodKey,
    definitions: selectMissionsForKey(WEEKLY_MISSION_POOL, periodKey, 4),
  };
}

export async function refreshMissionsIfNeeded(): Promise<{
  daily: MissionPeriodState;
  weekly: MissionPeriodState;
}> {
  const dailyMeta = getActiveMissionDefinitions('daily');
  const weeklyMeta = getActiveMissionDefinitions('weekly');
  const dailyRaw = await readJson<unknown>(KEYS.daily);
  const weeklyRaw = await readJson<unknown>(KEYS.weekly);
  const daily = normalizeState(
    dailyRaw,
    dailyMeta.periodKey,
    dailyMeta.definitions,
  );
  const weekly = normalizeState(
    weeklyRaw,
    weeklyMeta.periodKey,
    weeklyMeta.definitions,
  );
  await writeJson(KEYS.daily, daily);
  await writeJson(KEYS.weekly, weekly);
  return { daily, weekly };
}

export async function getDailyMissionState(): Promise<MissionPeriodState> {
  const { daily } = await refreshMissionsIfNeeded();
  return daily;
}

export async function getWeeklyMissionState(): Promise<MissionPeriodState> {
  const { weekly } = await refreshMissionsIfNeeded();
  return weekly;
}

function applyEventToState(
  state: MissionPeriodState,
  defs: MissionDefinition[],
  event: MissionEvent,
): MissionPeriodState {
  const missions = state.missions.map((m) => {
    const def = defs.find((d) => d.id === m.missionId);
    if (!def || def.metric !== event.metric || m.claimed) return m;
    let progress = m.progress;
    if (
      event.metric === 'single_run_score' ||
      event.metric === 'reach_combo'
    ) {
      const value = event.highestValue ?? event.amount;
      progress = Math.max(progress, value);
    } else {
      progress = progress + Math.max(0, Math.floor(event.amount));
    }
    progress = Math.min(progress, def.target);
    return {
      ...m,
      progress,
      completed: progress >= def.target,
    };
  });
  return { ...state, missions };
}

export async function applyMissionEvent(
  event: MissionEvent,
): Promise<{ daily: MissionPeriodState; weekly: MissionPeriodState }> {
  const { daily, weekly } = await refreshMissionsIfNeeded();
  const dailyDefs = getActiveMissionDefinitions('daily').definitions;
  const weeklyDefs = getActiveMissionDefinitions('weekly').definitions;
  const nextDaily = applyEventToState(daily, dailyDefs, event);
  const nextWeekly = applyEventToState(weekly, weeklyDefs, event);
  await writeJson(KEYS.daily, nextDaily);
  await writeJson(KEYS.weekly, nextWeekly);
  return { daily: nextDaily, weekly: nextWeekly };
}

export async function applyMissionEvents(
  events: MissionEvent[],
): Promise<void> {
  for (const event of events) {
    await applyMissionEvent(event);
  }
}

export async function claimMissionReward(
  period: 'daily' | 'weekly',
  missionId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const { daily, weekly } = await refreshMissionsIfNeeded();
  const state = period === 'daily' ? daily : weekly;
  const defs = getActiveMissionDefinitions(period).definitions;
  const def = defs.find((d) => d.id === missionId);
  const progress = state.missions.find((m) => m.missionId === missionId);
  if (!def || !progress) return { ok: false, reason: 'Mission not found' };
  if (!progress.completed) return { ok: false, reason: 'Not completed' };
  if (progress.claimed) return { ok: false, reason: 'Already claimed' };

  const txnId = `mission-${period}-${state.periodKey}-${missionId}`;
  try {
    await applyEconomyTransaction({
      id: txnId,
      type: 'mission_reward',
      coinsDelta: def.reward.coins,
      gemsDelta: def.reward.gems,
      xpDelta: def.reward.xp,
      inventoryChanges: def.reward.inventory,
      source: `mission:${missionId}`,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof DuplicateTransactionError) {
      // mark claimed anyway
    } else {
      return { ok: false, reason: 'Claim failed' };
    }
  }

  const nextMissions = state.missions.map((m) =>
    m.missionId === missionId ? { ...m, claimed: true, completed: true } : m,
  );
  const nextState = { ...state, missions: nextMissions };
  await writeJson(period === 'daily' ? KEYS.daily : KEYS.weekly, nextState);
  return { ok: true };
}

export async function countClaimableMissions(): Promise<number> {
  const { daily, weekly } = await refreshMissionsIfNeeded();
  const count = (s: MissionPeriodState) =>
    s.missions.filter((m) => m.completed && !m.claimed).length;
  return count(daily) + count(weekly);
}

export async function resetMissions(): Promise<void> {
  const dailyMeta = getActiveMissionDefinitions('daily');
  const weeklyMeta = getActiveMissionDefinitions('weekly');
  await writeJson(
    KEYS.daily,
    createState(dailyMeta.periodKey, dailyMeta.definitions),
  );
  await writeJson(
    KEYS.weekly,
    createState(weeklyMeta.periodKey, weeklyMeta.definitions),
  );
}

/** __DEV__ helper — mark all active missions completed (unclaimed). */
export async function completeAllMissions(): Promise<void> {
  const { daily, weekly } = await refreshMissionsIfNeeded();
  const nextDaily = {
    ...daily,
    missions: daily.missions.map((m) => {
      const def = getActiveMissionDefinitions('daily').definitions.find(
        (d) => d.id === m.missionId,
      );
      return {
        ...m,
        progress: def?.target ?? m.progress,
        completed: true,
      };
    }),
  };
  const nextWeekly = {
    ...weekly,
    missions: weekly.missions.map((m) => {
      const def = getActiveMissionDefinitions('weekly').definitions.find(
        (d) => d.id === m.missionId,
      );
      return {
        ...m,
        progress: def?.target ?? m.progress,
        completed: true,
      };
    }),
  };
  await writeJson(KEYS.daily, nextDaily);
  await writeJson(KEYS.weekly, nextWeekly);
}

export { createTransactionId };
