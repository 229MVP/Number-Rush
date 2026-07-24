import {
  DEFAULT_LIFETIME_STATS,
  DEFAULT_PLAYER_INVENTORY,
  DEFAULT_PLAYER_PROFILE,
  type LifetimeStats,
  type PlayerInventory,
  type PlayerProfile,
} from '../progression/progressionTypes';
import { DEFAULT_APP_SETTINGS, type AppSettings } from '../settings/settingsTypes';
import type { LaneState, NumberTileData, RunStats } from '../game/gameTypes';
import type { MissionPeriodState } from '../missions/missionTypes';

export function makeProfile(
  overrides: Partial<PlayerProfile> = {},
): PlayerProfile {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_PLAYER_PROFILE,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function makeInventory(
  overrides: Partial<PlayerInventory> = {},
): PlayerInventory {
  return { ...DEFAULT_PLAYER_INVENTORY, ...overrides };
}

export function makeLifetimeStats(
  overrides: Partial<LifetimeStats> = {},
): LifetimeStats {
  return { ...DEFAULT_LIFETIME_STATS, ...overrides };
}

export function makeSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return { ...DEFAULT_APP_SETTINGS, ...overrides };
}

export function makeLane(
  id: number,
  total = 0,
  status: LaneState['status'] = 'default',
): LaneState {
  return { id, total, status };
}

export function makeLanes(totals: number[] = [0, 0, 0, 0]): LaneState[] {
  return totals.map((total, i) => makeLane(i + 1, total));
}

export function makeTile(value: number, id = `t-${value}`): NumberTileData {
  return { id, type: 'number', value };
}

export function makeRunStats(overrides: Partial<RunStats> = {}): RunStats {
  return {
    score: 0,
    maxComboMultiplier: 1,
    longestPerfectStreak: 0,
    perfectClears: 0,
    tilesPlaced: 0,
    strikesUsed: 0,
    ...overrides,
  };
}

export function makeMissionState(
  periodKey: string,
  missionIds: string[],
): MissionPeriodState {
  return {
    periodKey,
    missions: missionIds.map((missionId) => ({
      missionId,
      progress: 0,
      completed: false,
      claimed: false,
    })),
  };
}

/** Ranked profile factory — Ranked match engine is not implemented yet. */
export function makeRankedProfileStub() {
  return {
    rankedPoints: 0,
    division: 'bronze' as const,
    subdivision: 1,
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
  };
}
