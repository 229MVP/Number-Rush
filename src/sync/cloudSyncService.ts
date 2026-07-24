import { trackEvent } from '../analytics/analyticsService';
import { cloudSyncEnabled } from '../config/featureFlags';
import { logger } from '../logging/logger';
import {
  type LifetimeStats,
  type PlayerInventory,
  type PlayerProfile,
} from '../progression/progressionTypes';
import { getSupabaseClient } from '../backend/supabaseClient';
import { getSession } from '../auth/authService';
import type { CloudProgressBundle, SyncDomain, SyncStatus } from './syncTypes';

const DEBOUNCE_MS = 1_500;
const MAX_BACKOFF_MS = 60_000;

type DebounceEntry = {
  timer: ReturnType<typeof setTimeout> | null;
  domain: SyncDomain;
};

const debounceByDomain = new Map<SyncDomain, DebounceEntry>();

let syncStatus: SyncStatus = 'idle';
let statusListeners = new Set<(status: SyncStatus) => void>();
let retryAttempt = 0;
let syncInFlight: Promise<void> | null = null;

function setSyncStatus(next: SyncStatus): void {
  syncStatus = next;
  statusListeners.forEach((listener) => listener(next));
}

export function getCloudSyncStatus(): SyncStatus {
  return syncStatus;
}

export function subscribeCloudSyncStatus(
  listener: (status: SyncStatus) => void,
): () => void {
  statusListeners.add(listener);
  listener(syncStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

function mapCloudRowToProfile(row: Record<string, unknown>): PlayerProfile {
  return {
    username: String(row.username ?? 'NeonPlayer'),
    level: Number(row.level ?? 1),
    currentXp: Number(row.current_xp ?? row.currentXp ?? 0),
    totalXp: Number(row.total_xp ?? row.totalXp ?? 0),
    coins: Number(row.coins ?? 0),
    gems: Number(row.gems ?? 0),
    selectedThemeId: String(row.selected_theme_id ?? row.selectedThemeId ?? 'neon-classic'),
    unlockedThemeIds: Array.isArray(row.unlocked_theme_ids)
      ? (row.unlocked_theme_ids as string[])
      : Array.isArray(row.unlockedThemeIds)
        ? (row.unlockedThemeIds as string[])
        : ['neon-classic'],
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? ''),
  };
}

function mapCloudRowToInventory(row: Record<string, unknown>): PlayerInventory {
  return {
    multiplier: Number(row.multiplier ?? 0),
    swap: Number(row.swap ?? 0),
    bomb: Number(row.bomb ?? 0),
    freeze: Number(row.freeze ?? 0),
    shield: Number(row.shield ?? 0),
    wild: Number(row.wild ?? 0),
  };
}

function mapCloudRowToStats(row: Record<string, unknown>): LifetimeStats {
  return {
    highestClassicScore: Number(
      row.highest_classic_score ?? row.highestClassicScore ?? 0,
    ),
    gamesPlayed: Number(row.games_played ?? row.gamesPlayed ?? 0),
    classicGamesPlayed: Number(
      row.classic_games_played ?? row.classicGamesPlayed ?? 0,
    ),
    dailyGamesPlayed: Number(
      row.daily_games_played ?? row.dailyGamesPlayed ?? 0,
    ),
    rankedGamesPlayed: Number(
      row.ranked_games_played ?? row.rankedGamesPlayed ?? 0,
    ),
    totalPerfectClears: Number(
      row.total_perfect_clears ?? row.totalPerfectClears ?? 0,
    ),
    totalTilesPlaced: Number(
      row.total_tiles_placed ?? row.totalTilesPlaced ?? 0,
    ),
    totalCoinsEarned: Number(
      row.total_coins_earned ?? row.totalCoinsEarned ?? 0,
    ),
    totalGemsEarned: Number(
      row.total_gems_earned ?? row.totalGemsEarned ?? 0,
    ),
    highestComboMultiplier: Number(
      row.highest_combo_multiplier ?? row.highestComboMultiplier ?? 0,
    ),
    longestPerfectStreak: Number(
      row.longest_perfect_streak ?? row.longestPerfectStreak ?? 0,
    ),
    dailyWins: Number(row.daily_wins ?? row.dailyWins ?? 0),
    rankedWins: Number(row.ranked_wins ?? row.rankedWins ?? 0),
  };
}

function parseCloudProgress(raw: Record<string, unknown>): CloudProgressBundle {
  const profileRow = raw.profile as Record<string, unknown> | null | undefined;
  const inventoryRow = raw.inventory as Record<string, unknown> | null | undefined;
  const statsRow = raw.statistics as Record<string, unknown> | null | undefined;

  return {
    profile: profileRow ? mapCloudRowToProfile(profileRow) : null,
    inventory: inventoryRow ? mapCloudRowToInventory(inventoryRow) : null,
    statistics: statsRow ? mapCloudRowToStats(statsRow) : null,
    raw,
  };
}

async function fetchCloudProgress(): Promise<CloudProgressBundle | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await supabase.rpc('get_my_cloud_progress');
  if (error) {
    logger.warn('get_my_cloud_progress failed', { message: error.message });
    throw error;
  }

  const record =
    data && typeof data === 'object'
      ? (data as Record<string, unknown>)
      : {};
  return parseCloudProgress(record);
}

function scheduleSync(domain: SyncDomain): void {
  const existing = debounceByDomain.get(domain);
  if (existing?.timer) clearTimeout(existing.timer);
  const timer = setTimeout(() => {
    void syncNow('debounced', domain);
  }, DEBOUNCE_MS);
  debounceByDomain.set(domain, { domain, timer });
}

export function queueDomainChange(domain: SyncDomain): void {
  if (!cloudSyncEnabled) return;
  setSyncStatus('pending');
  scheduleSync(domain);
  trackEvent('sync_domain_queued', { domain });
}

export async function syncNow(
  reason: 'manual' | 'debounced' | 'retry' = 'manual',
  domain?: SyncDomain,
): Promise<CloudProgressBundle | null> {
  if (!cloudSyncEnabled) {
    setSyncStatus('idle');
    return null;
  }

  if (syncInFlight) {
    await syncInFlight;
    return null;
  }

  let result: CloudProgressBundle | null = null;

  syncInFlight = (async () => {
    const session = await getSession();
    if (!session) {
      setSyncStatus('idle');
      retryAttempt = 0;
      return;
    }

    setSyncStatus('syncing');
    try {
      result = await fetchCloudProgress();
      retryAttempt = 0;
      setSyncStatus('idle');
      trackEvent('sync_completed', {
        reason,
        domain: domain ?? 'all',
      });
    } catch {
      retryAttempt += 1;
      const delay = Math.min(
        MAX_BACKOFF_MS,
        DEBOUNCE_MS * 2 ** retryAttempt,
      );
      setSyncStatus('error');
      trackEvent('sync_failed', { attempt: retryAttempt, reason });
      setTimeout(() => {
        void syncNow('retry', domain);
      }, delay);
    }
  })();

  try {
    await syncInFlight;
  } finally {
    syncInFlight = null;
  }

  return result;
}

export function resetCloudSyncState(): void {
  debounceByDomain.forEach((entry) => {
    if (entry.timer) clearTimeout(entry.timer);
  });
  debounceByDomain.clear();
  retryAttempt = 0;
  setSyncStatus('idle');
}
