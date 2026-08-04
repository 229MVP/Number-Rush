import {
  DEFAULT_LIFETIME_STATS,
  DEFAULT_PLAYER_INVENTORY,
  DEFAULT_PLAYER_PROFILE,
  type LifetimeStats,
  type PlayerInventory,
  type PlayerProfile,
} from '../progression/progressionTypes';
import type {
  CloudProgressBundle,
  LocalVsCloudComparison,
  SyncConflict,
  SyncDomain,
} from './syncTypes';

export type LocalProgressSnapshot = {
  profile: PlayerProfile;
  inventory: PlayerInventory;
  statistics: LifetimeStats;
};

function compareScalars(
  domain: SyncDomain,
  field: string,
  localValue: unknown,
  cloudValue: unknown,
  conflicts: SyncConflict[],
): void {
  if (localValue === cloudValue) return;
  const bucket = conflicts.find((c) => c.domain === domain);
  const entry = { field, localValue, cloudValue };
  if (bucket) bucket.fields.push(entry);
  else conflicts.push({ domain, fields: [entry] });
}

function inventoryDiffer(
  local: PlayerInventory,
  cloud: PlayerInventory,
): SyncConflictField[] {
  const fields: SyncConflictField[] = [];
  (Object.keys(local) as (keyof PlayerInventory)[]).forEach((key) => {
    if (local[key] !== cloud[key]) {
      fields.push({
        field: key,
        localValue: local[key],
        cloudValue: cloud[key],
      });
    }
  });
  return fields;
}

function statsDiffer(
  local: LifetimeStats,
  cloud: LifetimeStats,
): SyncConflictField[] {
  const fields: SyncConflictField[] = [];
  (Object.keys(local) as (keyof LifetimeStats)[]).forEach((key) => {
    if (local[key] !== cloud[key]) {
      fields.push({
        field: key,
        localValue: local[key],
        cloudValue: cloud[key],
      });
    }
  });
  return fields;
}

type SyncConflictField = SyncConflict['fields'][number];

export function compareLocalVsCloud(
  local: LocalProgressSnapshot,
  cloud: CloudProgressBundle,
): LocalVsCloudComparison {
  const conflicts: SyncConflict[] = [];
  const hasCloudData =
    cloud.profile != null ||
    cloud.inventory != null ||
    cloud.statistics != null;

  if (cloud.profile) {
    compareScalars(
      'profile',
      'username',
      local.profile.username,
      cloud.profile.username,
      conflicts,
    );
    compareScalars(
      'profile',
      'level',
      local.profile.level,
      cloud.profile.level,
      conflicts,
    );
    compareScalars(
      'profile',
      'totalXp',
      local.profile.totalXp,
      cloud.profile.totalXp,
      conflicts,
    );
    compareScalars(
      'profile',
      'coins',
      local.profile.coins,
      cloud.profile.coins,
      conflicts,
    );
    compareScalars(
      'profile',
      'gems',
      local.profile.gems,
      cloud.profile.gems,
      conflicts,
    );
  }

  if (cloud.inventory) {
    const invFields = inventoryDiffer(local.inventory, cloud.inventory);
    if (invFields.length > 0) {
      conflicts.push({ domain: 'inventory', fields: invFields });
    }
  }

  if (cloud.statistics) {
    const statFields = statsDiffer(local.statistics, cloud.statistics);
    if (statFields.length > 0) {
      conflicts.push({ domain: 'statistics', fields: statFields });
    }
  }

  return { hasCloudData, conflicts };
}

export function applyKeepLocal(local: LocalProgressSnapshot): LocalProgressSnapshot {
  return {
    profile: { ...local.profile },
    inventory: { ...local.inventory },
    statistics: { ...local.statistics },
  };
}

export function applyUseCloud(
  local: LocalProgressSnapshot,
  cloud: CloudProgressBundle,
): LocalProgressSnapshot {
  return {
    profile: cloud.profile
      ? { ...cloud.profile }
      : { ...local.profile },
    inventory: cloud.inventory
      ? { ...cloud.inventory }
      : { ...local.inventory },
    statistics: cloud.statistics
      ? { ...cloud.statistics }
      : { ...local.statistics },
  };
}

function pickNewerProfile(
  local: PlayerProfile,
  cloud: PlayerProfile,
): PlayerProfile {
  const localTime = Date.parse(local.updatedAt) || 0;
  const cloudTime = Date.parse(cloud.updatedAt) || 0;
  const newer = cloudTime >= localTime ? cloud : local;
  const older = newer === cloud ? local : cloud;
  const themeSet = new Set([
    ...local.unlockedThemeIds,
    ...cloud.unlockedThemeIds,
  ]);
  const useCloudXp = cloud.totalXp >= local.totalXp;
  const base = useCloudXp ? cloud : local;
  return {
    ...base,
    username: newer.username || base.username,
    level: Math.max(local.level, cloud.level),
    currentXp: base.currentXp,
    totalXp: Math.max(local.totalXp, cloud.totalXp),
    coins: Math.max(local.coins, cloud.coins),
    gems: Math.max(local.gems, cloud.gems),
    unlockedThemeIds: Array.from(themeSet),
    selectedThemeId: themeSet.has(newer.selectedThemeId)
      ? newer.selectedThemeId
      : base.selectedThemeId,
    createdAt: older.createdAt || base.createdAt,
    updatedAt:
      cloudTime >= localTime ? cloud.updatedAt : local.updatedAt,
  };
}

function mergeInventory(
  local: PlayerInventory,
  cloud: PlayerInventory,
): PlayerInventory {
  const keys = Object.keys(local) as (keyof PlayerInventory)[];
  const out = { ...local };
  keys.forEach((key) => {
    out[key] = Math.max(local[key], cloud[key]);
  });
  return out;
}

function mergeStats(
  local: LifetimeStats,
  cloud: LifetimeStats,
): LifetimeStats {
  const keys = Object.keys(local) as (keyof LifetimeStats)[];
  const out = { ...local };
  keys.forEach((key) => {
    out[key] = Math.max(local[key], cloud[key]);
  });
  return out;
}

/** Lossless merge: keep best progress without duplicating currency beyond max. */
export function applyMergeSafe(
  local: LocalProgressSnapshot,
  cloud: CloudProgressBundle,
): LocalProgressSnapshot {
  const profile =
    cloud.profile != null
      ? pickNewerProfile(local.profile, cloud.profile)
      : { ...local.profile };
  const inventory =
    cloud.inventory != null
      ? mergeInventory(local.inventory, cloud.inventory)
      : { ...local.inventory };
  const statistics =
    cloud.statistics != null
      ? mergeStats(local.statistics, cloud.statistics)
      : { ...local.statistics };

  return { profile, inventory, statistics };
}

export function emptyCloudBundle(): CloudProgressBundle {
  return {
    profile: null,
    inventory: null,
    statistics: null,
    raw: {},
  };
}

export function defaultsLocalSnapshot(): LocalProgressSnapshot {
  return {
    profile: { ...DEFAULT_PLAYER_PROFILE },
    inventory: { ...DEFAULT_PLAYER_INVENTORY },
    statistics: { ...DEFAULT_LIFETIME_STATS },
  };
}
