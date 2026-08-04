import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../logging/logger';
import { STORAGE_KEYS } from '../game/gameConstants';
import { getUtcDateKey } from '../game/dailyTournament';
import type {
  DailyAllTimeBest,
  DailyOfficialRecord,
  DailyPracticeRecord,
  DailyRunResult,
} from '../game/gameTypes';

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
  } catch (error) {
    logger.warn('dailyStorage read failed', {
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
      logger.warn('dailyStorage write failed', {
        key,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeScore(value: unknown): number {
  if (!isFiniteNumber(value) || value < 0) return 0;
  return Math.floor(value);
}

function isOfficialRecord(value: unknown): value is DailyOfficialRecord {
  if (value == null || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.dateKey === 'string' &&
    isFiniteNumber(r.score) &&
    isFiniteNumber(r.perfectClears) &&
    isFiniteNumber(r.maxComboMultiplier) &&
    isFiniteNumber(r.longestPerfectStreak) &&
    isFiniteNumber(r.tilesPlaced) &&
    isFiniteNumber(r.strikesUsed) &&
    typeof r.completedAt === 'string'
  );
}

function isPracticeRecord(value: unknown): value is DailyPracticeRecord {
  if (value == null || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.dateKey === 'string' &&
    isFiniteNumber(r.bestScore) &&
    isFiniteNumber(r.attempts) &&
    typeof r.lastPlayedAt === 'string'
  );
}

async function getOfficialMap(): Promise<Record<string, DailyOfficialRecord>> {
  const raw = await readJson<unknown>(STORAGE_KEYS.dailyOfficialRecords);
  if (raw == null || typeof raw !== 'object') return {};
  const result: Record<string, DailyOfficialRecord> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isOfficialRecord(value)) result[key] = value;
  }
  return result;
}

async function getPracticeMap(): Promise<Record<string, DailyPracticeRecord>> {
  const raw = await readJson<unknown>(STORAGE_KEYS.dailyPracticeRecords);
  if (raw == null || typeof raw !== 'object') return {};
  const result: Record<string, DailyPracticeRecord> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isPracticeRecord(value)) result[key] = value;
  }
  return result;
}

export async function getOfficialDailyRecord(
  dateKey: string,
): Promise<DailyOfficialRecord | null> {
  const map = await getOfficialMap();
  return map[dateKey] ?? null;
}

export async function hasCompletedOfficialDailyAttempt(
  dateKey: string = getUtcDateKey(),
): Promise<boolean> {
  return (await getOfficialDailyRecord(dateKey)) != null;
}

export async function saveOfficialDailyRecord(
  record: DailyOfficialRecord,
): Promise<DailyOfficialRecord> {
  const existing = await getOfficialDailyRecord(record.dateKey);
  if (existing != null) return existing;
  const map = await getOfficialMap();
  map[record.dateKey] = record;
  await writeJson(STORAGE_KEYS.dailyOfficialRecords, map);
  return record;
}

export async function getDailyPracticeRecord(
  dateKey: string,
): Promise<DailyPracticeRecord | null> {
  const map = await getPracticeMap();
  return map[dateKey] ?? null;
}

export async function saveDailyPracticeResult(
  result: DailyRunResult,
): Promise<DailyPracticeRecord> {
  const map = await getPracticeMap();
  const existing = map[result.dateKey];
  const next: DailyPracticeRecord = {
    dateKey: result.dateKey,
    bestScore: Math.max(existing?.bestScore ?? 0, sanitizeScore(result.score)),
    attempts: (existing?.attempts ?? 0) + 1,
    lastPlayedAt: result.completedAt,
  };
  map[result.dateKey] = next;
  await writeJson(STORAGE_KEYS.dailyPracticeRecords, map);
  return next;
}

export async function getDailyAllTimeBest(): Promise<DailyAllTimeBest | null> {
  const raw = await readJson<unknown>(STORAGE_KEYS.dailyAllTimeBest);
  if (raw == null || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (
    !isFiniteNumber(r.score) ||
    typeof r.dateKey !== 'string' ||
    typeof r.completedAt !== 'string'
  ) {
    return null;
  }
  return {
    score: sanitizeScore(r.score),
    dateKey: r.dateKey,
    completedAt: r.completedAt,
  };
}

export async function updateDailyAllTimeBest(
  score: number,
  dateKey: string,
  completedAt: string,
): Promise<{ best: DailyAllTimeBest; isNew: boolean }> {
  const previous = await getDailyAllTimeBest();
  const nextScore = sanitizeScore(score);
  if (previous == null || nextScore > previous.score) {
    const best: DailyAllTimeBest = { score: nextScore, dateKey, completedAt };
    await writeJson(STORAGE_KEYS.dailyAllTimeBest, best);
    return { best, isNew: true };
  }
  return { best: previous, isNew: false };
}

export async function saveOfficialFromRun(
  result: DailyRunResult,
): Promise<{
  record: DailyOfficialRecord;
  isNewDailyBest: boolean;
  allTimeBest: DailyAllTimeBest;
}> {
  const record = await saveOfficialDailyRecord({
    dateKey: result.dateKey,
    score: result.score,
    perfectClears: result.perfectClears,
    maxComboMultiplier: result.maxComboMultiplier,
    longestPerfectStreak: result.longestPerfectStreak,
    tilesPlaced: result.tilesPlaced,
    strikesUsed: result.strikesUsed,
    completedAt: result.completedAt,
  });
  const { best, isNew } = await updateDailyAllTimeBest(
    result.score,
    result.dateKey,
    result.completedAt,
  );
  return { record, isNewDailyBest: isNew, allTimeBest: best };
}

/** __DEV__ helpers */
export async function resetTodayOfficialAttempt(
  dateKey: string = getUtcDateKey(),
): Promise<void> {
  const map = await getOfficialMap();
  delete map[dateKey];
  await writeJson(STORAGE_KEYS.dailyOfficialRecords, map);
}

export async function resetAllDailyData(): Promise<void> {
  await writeJson(STORAGE_KEYS.dailyOfficialRecords, {});
  await writeJson(STORAGE_KEYS.dailyPracticeRecords, {});
  return enqueueWrite(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.dailyAllTimeBest);
    } catch {
      // ignore
    }
  });
}
