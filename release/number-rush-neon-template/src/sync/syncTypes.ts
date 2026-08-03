import type {
  LifetimeStats,
  PlayerInventory,
  PlayerProfile,
} from '../progression/progressionTypes';

export type SyncStatus =
  | 'idle'
  | 'pending'
  | 'syncing'
  | 'error'
  | 'offline';

export type SyncDomain =
  | 'profile'
  | 'inventory'
  | 'statistics'
  | 'progress'
  | 'missions';

export type SyncMetadata = {
  deviceId: string;
  localRevision: number;
  serverRevision: number;
  lastSyncedAt: string | null;
  pendingDomains: SyncDomain[];
};

export type CloudProgressBundle = {
  profile: PlayerProfile | null;
  inventory: PlayerInventory | null;
  statistics: LifetimeStats | null;
  raw: Record<string, unknown>;
};

export type SyncConflictField = {
  field: string;
  localValue: unknown;
  cloudValue: unknown;
};

export type SyncConflict = {
  domain: SyncDomain;
  fields: SyncConflictField[];
};

export type LocalVsCloudComparison = {
  hasCloudData: boolean;
  conflicts: SyncConflict[];
};
