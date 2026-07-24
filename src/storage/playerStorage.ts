import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../logging/logger';
import { applyXp } from '../progression/xpSystem';
import type {
  EconomyTransaction,
  LevelReward,
  LifetimeStats,
  PlayerInventory,
  PlayerProfile,
} from '../progression/progressionTypes';
import {
  DEFAULT_LIFETIME_STATS,
  DEFAULT_PLAYER_INVENTORY,
  DEFAULT_PLAYER_PROFILE,
  DEFAULT_THEME_ID,
  DEFAULT_USERNAME,
  STORAGE_KEYS_PLAYER,
} from '../progression/progressionTypes';

let writeChain: Promise<void> = Promise.resolve();
const appliedTxnIds = new Set<string>();

function enqueueWrite(task: () => Promise<void>): Promise<void> {
  writeChain = writeChain.then(task).catch(() => undefined);
  return writeChain;
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null || raw === '') return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn('playerStorage read failed', {
      key,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  return enqueueWrite(async () => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.warn('playerStorage write failed', {
        key,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function clampNonNeg(value: unknown, fallback = 0): number {
  if (!isFiniteNumber(value)) return fallback;
  return Math.max(0, Math.floor(value));
}

function nowIso(): string {
  return new Date().toISOString();
}

export function normalizePlayerProfile(value: unknown): PlayerProfile {
  const now = nowIso();
  if (value == null || typeof value !== 'object') {
    return { ...DEFAULT_PLAYER_PROFILE, createdAt: now, updatedAt: now };
  }
  const raw = value as Record<string, unknown>;
  const unlocked = Array.isArray(raw.unlockedThemeIds)
    ? raw.unlockedThemeIds.filter((id): id is string => typeof id === 'string')
    : [DEFAULT_THEME_ID];
  if (!unlocked.includes(DEFAULT_THEME_ID)) unlocked.unshift(DEFAULT_THEME_ID);
  const selected =
    typeof raw.selectedThemeId === 'string' && unlocked.includes(raw.selectedThemeId)
      ? raw.selectedThemeId
      : DEFAULT_THEME_ID;
  const username =
    typeof raw.username === 'string' && raw.username.trim().length >= 3
      ? raw.username.trim().slice(0, 16)
      : DEFAULT_USERNAME;

  return {
    username,
    level: Math.max(1, clampNonNeg(raw.level, 1)),
    currentXp: clampNonNeg(raw.currentXp),
    totalXp: clampNonNeg(raw.totalXp),
    coins: clampNonNeg(raw.coins, DEFAULT_PLAYER_PROFILE.coins),
    gems: clampNonNeg(raw.gems, DEFAULT_PLAYER_PROFILE.gems),
    selectedThemeId: selected,
    unlockedThemeIds: unlocked,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
  };
}

export function normalizePlayerInventory(value: unknown): PlayerInventory {
  if (value == null || typeof value !== 'object') {
    return { ...DEFAULT_PLAYER_INVENTORY };
  }
  const raw = value as Record<string, unknown>;
  return {
    multiplier: clampNonNeg(raw.multiplier, DEFAULT_PLAYER_INVENTORY.multiplier),
    swap: clampNonNeg(raw.swap, DEFAULT_PLAYER_INVENTORY.swap),
    bomb: clampNonNeg(raw.bomb),
    freeze: clampNonNeg(raw.freeze),
    shield: clampNonNeg(raw.shield),
    wild: clampNonNeg(raw.wild),
  };
}

export function normalizeLifetimeStats(value: unknown): LifetimeStats {
  if (value == null || typeof value !== 'object') {
    return { ...DEFAULT_LIFETIME_STATS };
  }
  const raw = value as Record<string, unknown>;
  const out = { ...DEFAULT_LIFETIME_STATS };
  (Object.keys(out) as Array<keyof LifetimeStats>).forEach((key) => {
    out[key] = clampNonNeg(raw[key], 0);
  });
  return out;
}

export async function getPlayerProfile(): Promise<PlayerProfile> {
  const raw = await readJson<unknown>(STORAGE_KEYS_PLAYER.profile);
  const profile = normalizePlayerProfile(raw);
  if (raw == null) {
    await savePlayerProfile(profile);
  }
  return profile;
}

export async function savePlayerProfile(profile: PlayerProfile): Promise<void> {
  await writeJson(
    STORAGE_KEYS_PLAYER.profile,
    normalizePlayerProfile({
      ...profile,
      updatedAt: nowIso(),
    }),
  );
}

export async function updatePlayerProfile(
  patch: Partial<PlayerProfile>,
): Promise<PlayerProfile> {
  const current = await getPlayerProfile();
  const next = normalizePlayerProfile({
    ...current,
    ...patch,
    updatedAt: nowIso(),
  });
  await savePlayerProfile(next);
  return next;
}

export async function getPlayerInventory(): Promise<PlayerInventory> {
  const raw = await readJson<unknown>(STORAGE_KEYS_PLAYER.inventory);
  const inventory = normalizePlayerInventory(raw);
  if (raw == null) {
    await savePlayerInventory(inventory);
  }
  return inventory;
}

export async function savePlayerInventory(
  inventory: PlayerInventory,
): Promise<void> {
  await writeJson(
    STORAGE_KEYS_PLAYER.inventory,
    normalizePlayerInventory(inventory),
  );
}

export async function updateInventoryItem(
  key: keyof PlayerInventory,
  delta: number,
): Promise<PlayerInventory> {
  const inv = await getPlayerInventory();
  inv[key] = Math.max(0, inv[key] + Math.floor(delta));
  await savePlayerInventory(inv);
  return inv;
}

export async function getLifetimeStats(): Promise<LifetimeStats> {
  const raw = await readJson<unknown>(STORAGE_KEYS_PLAYER.lifetimeStats);
  const stats = normalizeLifetimeStats(raw);
  if (raw == null) {
    await saveLifetimeStats(stats);
  }
  return stats;
}

export async function saveLifetimeStats(stats: LifetimeStats): Promise<void> {
  await writeJson(
    STORAGE_KEYS_PLAYER.lifetimeStats,
    normalizeLifetimeStats(stats),
  );
}

export async function applyLifetimeStatChanges(
  changes: Partial<LifetimeStats> & {
    maxFields?: Partial<
      Pick<
        LifetimeStats,
        | 'highestClassicScore'
        | 'highestComboMultiplier'
        | 'longestPerfectStreak'
      >
    >;
  },
): Promise<LifetimeStats> {
  const current = await getLifetimeStats();
  const next = { ...current };
  (Object.keys(changes) as Array<keyof typeof changes>).forEach((key) => {
    if (key === 'maxFields') return;
    const value = changes[key];
    if (typeof value === 'number') {
      next[key as keyof LifetimeStats] = Math.max(
        0,
        current[key as keyof LifetimeStats] + Math.floor(value),
      );
    }
  });
  if (changes.maxFields) {
    const m = changes.maxFields;
    if (m.highestClassicScore != null) {
      next.highestClassicScore = Math.max(
        next.highestClassicScore,
        m.highestClassicScore,
      );
    }
    if (m.highestComboMultiplier != null) {
      next.highestComboMultiplier = Math.max(
        next.highestComboMultiplier,
        m.highestComboMultiplier,
      );
    }
    if (m.longestPerfectStreak != null) {
      next.longestPerfectStreak = Math.max(
        next.longestPerfectStreak,
        m.longestPerfectStreak,
      );
    }
  }
  await saveLifetimeStats(next);
  return next;
}

async function getTransactionHistory(): Promise<EconomyTransaction[]> {
  const raw = await readJson<unknown>(STORAGE_KEYS_PLAYER.transactionHistory);
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (t): t is EconomyTransaction =>
      t != null &&
      typeof t === 'object' &&
      typeof (t as EconomyTransaction).id === 'string',
  );
}

async function loadAppliedIds(): Promise<Set<string>> {
  if (appliedTxnIds.size > 0) return appliedTxnIds;
  const raw = await readJson<unknown>(STORAGE_KEYS_PLAYER.appliedRewardIds);
  if (Array.isArray(raw)) {
    raw.forEach((id) => {
      if (typeof id === 'string') appliedTxnIds.add(id);
    });
  }
  const history = await getTransactionHistory();
  history.forEach((t) => appliedTxnIds.add(t.id));
  return appliedTxnIds;
}

async function persistAppliedIds(): Promise<void> {
  const ids = Array.from(appliedTxnIds).slice(-200);
  await writeJson(STORAGE_KEYS_PLAYER.appliedRewardIds, ids);
}

export class InsufficientBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientBalanceError';
  }
}

export class DuplicateTransactionError extends Error {
  constructor(id: string) {
    super(`Transaction already applied: ${id}`);
    this.name = 'DuplicateTransactionError';
  }
}

/**
 * Central economy apply — currency, inventory, optional XP/themes.
 * Duplicate transaction IDs are rejected.
 */
export async function applyEconomyTransaction(
  transaction: EconomyTransaction,
): Promise<{
  profile: PlayerProfile;
  inventory: PlayerInventory;
  levelRewards: LevelReward[];
}> {
  const ids = await loadAppliedIds();
  if (ids.has(transaction.id)) {
    throw new DuplicateTransactionError(transaction.id);
  }

  let profile = await getPlayerProfile();
  let inventory = await getPlayerInventory();
  let levelRewards: LevelReward[] = [];

  const nextCoins = profile.coins + Math.floor(transaction.coinsDelta);
  const nextGems = profile.gems + Math.floor(transaction.gemsDelta);
  if (nextCoins < 0) {
    throw new InsufficientBalanceError('Not enough coins');
  }
  if (nextGems < 0) {
    throw new InsufficientBalanceError('Not enough gems');
  }

  if (transaction.inventoryChanges) {
    for (const [key, delta] of Object.entries(transaction.inventoryChanges)) {
      const k = key as keyof PlayerInventory;
      const next = inventory[k] + Math.floor(delta ?? 0);
      if (next < 0) {
        throw new InsufficientBalanceError(`Not enough ${k}`);
      }
      inventory = { ...inventory, [k]: next };
    }
  }

  profile = {
    ...profile,
    coins: nextCoins,
    gems: nextGems,
    updatedAt: nowIso(),
  };

  if (transaction.themeUnlockIds?.length) {
    const set = new Set(profile.unlockedThemeIds);
    transaction.themeUnlockIds.forEach((id) => set.add(id));
    profile = { ...profile, unlockedThemeIds: Array.from(set) };
  }

  if (transaction.xpDelta && transaction.xpDelta > 0) {
    const xpResult = applyXp(profile, transaction.xpDelta);
    profile = xpResult.updatedProfile;
    levelRewards = xpResult.levelRewards;
    // Apply level-reward coins/gems/inventory from this XP gain
    for (const reward of xpResult.levelRewards) {
      profile = {
        ...profile,
        coins: profile.coins + reward.coins,
        gems: profile.gems + reward.gems,
      };
      if (reward.inventory) {
        for (const [key, amount] of Object.entries(reward.inventory)) {
          const k = key as keyof PlayerInventory;
          inventory = {
            ...inventory,
            [k]: inventory[k] + Math.max(0, Math.floor(amount ?? 0)),
          };
        }
      }
      if (reward.themeUnlockId) {
        const set = new Set(profile.unlockedThemeIds);
        set.add(reward.themeUnlockId);
        profile = { ...profile, unlockedThemeIds: Array.from(set) };
      }
    }
  }

  // Sync level-gated themes that may already be earned
  if (profile.level >= 5) {
    const set = new Set(profile.unlockedThemeIds);
    set.add('cyber-ice');
    profile = { ...profile, unlockedThemeIds: Array.from(set) };
  }

  ids.add(transaction.id);
  appliedTxnIds.add(transaction.id);

  const history = await getTransactionHistory();
  history.push(transaction);
  const trimmed = history.slice(-100);

  await savePlayerProfile(profile);
  await savePlayerInventory(inventory);
  await writeJson(STORAGE_KEYS_PLAYER.transactionHistory, trimmed);
  await persistAppliedIds();

  return { profile, inventory, levelRewards };
}

export async function wasTransactionApplied(id: string): Promise<boolean> {
  const ids = await loadAppliedIds();
  return ids.has(id);
}

export async function resetPlayerProgression(): Promise<void> {
  const now = nowIso();
  appliedTxnIds.clear();
  await writeJson(STORAGE_KEYS_PLAYER.profile, {
    ...DEFAULT_PLAYER_PROFILE,
    createdAt: now,
    updatedAt: now,
  });
  await writeJson(STORAGE_KEYS_PLAYER.inventory, DEFAULT_PLAYER_INVENTORY);
  await writeJson(STORAGE_KEYS_PLAYER.lifetimeStats, DEFAULT_LIFETIME_STATS);
  await writeJson(STORAGE_KEYS_PLAYER.transactionHistory, []);
  await writeJson(STORAGE_KEYS_PLAYER.appliedRewardIds, []);
}

export function createTransactionId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
