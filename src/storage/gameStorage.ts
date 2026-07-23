import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../game/gameConstants';
import {
  applyRankedResult as applyRankedResultPure,
  getDivisionForPoints,
} from '../game/rankedScoring';
import type {
  CompetitiveRunResult,
  DailyOfficialRecord,
  RankedPointBreakdown,
  RankedProfile,
} from '../game/gameTypes';
import { getUtcDateKey } from '../game/modeConfig';

const DEFAULT_RANKED_PROFILE: RankedProfile = {
  rankedPoints: 0,
  division: 'bronze',
  seasonHighPoints: 0,
  rankedGamesPlayed: 0,
  rankedWins: 0,
  rankedLosses: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
};

let writeChain: Promise<void> = Promise.resolve();

function enqueueWrite(task: () => Promise<void>): Promise<void> {
  writeChain = writeChain.then(task).catch(() => undefined);
  return writeChain;
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null || raw === '') {
      return null;
    }
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
      // Storage unavailable (e.g. some web contexts) — fail soft.
    }
  });
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeBestScore(value: unknown): number {
  if (!isFiniteNumber(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

export async function getBestScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.bestScore);
    if (raw == null) {
      return 0;
    }
    return sanitizeBestScore(JSON.parse(raw));
  } catch {
    return 0;
  }
}

export async function saveBestScore(score: number): Promise<number> {
  const next = sanitizeBestScore(score);
  const current = await getBestScore();
  const best = Math.max(current, next);
  await writeJson(STORAGE_KEYS.bestScore, best);
  return best;
}

export async function updateBestScoreIfNeeded(
  score: number,
): Promise<{ bestScore: number; isNewBest: boolean }> {
  const previous = await getBestScore();
  const bestScore = await saveBestScore(score);
  return {
    bestScore,
    isNewBest: sanitizeBestScore(score) > previous,
  };
}

export async function getTutorialCompleted(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.tutorialCompleted);
    if (raw == null) {
      return false;
    }
    return Boolean(JSON.parse(raw));
  } catch {
    return false;
  }
}

export async function setTutorialCompleted(completed: boolean): Promise<void> {
  await writeJson(STORAGE_KEYS.tutorialCompleted, completed);
}

function isDailyOfficialRecord(value: unknown): value is DailyOfficialRecord {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.dateKey === 'string' &&
    isFiniteNumber(record.score) &&
    isFiniteNumber(record.perfectClears) &&
    isFiniteNumber(record.maxComboMultiplier) &&
    isFiniteNumber(record.longestPerfectStreak) &&
    isFiniteNumber(record.tilesPlaced) &&
    typeof record.completedAt === 'string'
  );
}

export async function getOfficialScoresMap(): Promise<Record<string, DailyOfficialRecord>> {
  const raw = await readJson<unknown>(STORAGE_KEYS.dailyOfficialScores);
  if (raw == null || typeof raw !== 'object') {
    return {};
  }
  const result: Record<string, DailyOfficialRecord> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isDailyOfficialRecord(value)) {
      result[key] = value;
    }
  }
  return result;
}

export async function getTodayOfficialRecord(
  dateKey: string = getUtcDateKey(),
): Promise<DailyOfficialRecord | null> {
  const map = await getOfficialScoresMap();
  return map[dateKey] ?? null;
}

export async function hasCompletedOfficialDailyAttempt(
  dateKey: string = getUtcDateKey(),
): Promise<boolean> {
  const record = await getTodayOfficialRecord(dateKey);
  return record != null;
}

export async function saveOfficialDailyResult(
  result: CompetitiveRunResult,
  dateKey: string = getUtcDateKey(),
): Promise<DailyOfficialRecord> {
  const existing = await getTodayOfficialRecord(dateKey);
  if (existing != null) {
    return existing;
  }

  const record: DailyOfficialRecord = {
    dateKey,
    score: result.score,
    perfectClears: result.perfectClears,
    maxComboMultiplier: result.maxComboMultiplier,
    longestPerfectStreak: result.longestPerfectStreak,
    tilesPlaced: result.tilesPlaced,
    completedAt: new Date().toISOString(),
  };

  const map = await getOfficialScoresMap();
  map[dateKey] = record;
  await writeJson(STORAGE_KEYS.dailyOfficialScores, map);
  await writeJson(STORAGE_KEYS.dailyLastOfficialDate, dateKey);

  const completed = await readJson<string[]>(STORAGE_KEYS.dailyCompletedAttempts);
  const list = Array.isArray(completed) ? completed : [];
  if (!list.includes(dateKey)) {
    list.push(dateKey);
    await writeJson(STORAGE_KEYS.dailyCompletedAttempts, list);
  }

  return record;
}

export async function getDailyPracticeBest(
  dateKey: string = getUtcDateKey(),
): Promise<number> {
  const map = await readJson<Record<string, number>>(STORAGE_KEYS.dailyPracticeBest);
  if (map == null || typeof map !== 'object') {
    return 0;
  }
  const value = map[dateKey];
  return sanitizeBestScore(value);
}

export async function saveDailyPracticeResult(
  score: number,
  dateKey: string = getUtcDateKey(),
): Promise<number> {
  const current = await getDailyPracticeBest(dateKey);
  const next = Math.max(current, sanitizeBestScore(score));
  const map =
    (await readJson<Record<string, number>>(STORAGE_KEYS.dailyPracticeBest)) ?? {};
  const safeMap = typeof map === 'object' && map != null ? { ...map } : {};
  safeMap[dateKey] = next;
  await writeJson(STORAGE_KEYS.dailyPracticeBest, safeMap);
  return next;
}

function sanitizeRankedProfile(value: unknown): RankedProfile {
  if (value == null || typeof value !== 'object') {
    return { ...DEFAULT_RANKED_PROFILE };
  }
  const raw = value as Record<string, unknown>;
  const points = Math.max(0, sanitizeBestScore(raw.rankedPoints));
  return {
    rankedPoints: points,
    division: getDivisionForPoints(points),
    seasonHighPoints: Math.max(points, sanitizeBestScore(raw.seasonHighPoints)),
    rankedGamesPlayed: Math.max(0, sanitizeBestScore(raw.rankedGamesPlayed)),
    rankedWins: Math.max(0, sanitizeBestScore(raw.rankedWins)),
    rankedLosses: Math.max(0, sanitizeBestScore(raw.rankedLosses)),
    currentWinStreak: Math.max(0, sanitizeBestScore(raw.currentWinStreak)),
    bestWinStreak: Math.max(0, sanitizeBestScore(raw.bestWinStreak)),
  };
}

export async function getRankedProfile(): Promise<RankedProfile> {
  const raw = await readJson<unknown>(STORAGE_KEYS.rankedProfile);
  return sanitizeRankedProfile(raw);
}

export async function saveRankedProfile(profile: RankedProfile): Promise<void> {
  await writeJson(STORAGE_KEYS.rankedProfile, sanitizeRankedProfile(profile));
}

export async function applyRankedResult(
  breakdown: RankedPointBreakdown,
): Promise<{ previous: RankedProfile; next: RankedProfile }> {
  const previous = await getRankedProfile();
  const next = applyRankedResultPure(previous, breakdown);
  await saveRankedProfile(next);
  return { previous, next };
}

export async function applyRankedForfeit(): Promise<{
  previous: RankedProfile;
  next: RankedProfile;
  breakdown: RankedPointBreakdown;
}> {
  const breakdown: RankedPointBreakdown = {
    basePoints: -25,
    survivalBonus: 0,
    comboBonus: 0,
    perfectBonus: 0,
    total: -25,
    outcome: 'loss',
  };
  const { previous, next } = await applyRankedResult(breakdown);
  return { previous, next, breakdown };
}

/** __DEV__ helpers — not shown in production UI. */
export async function resetDailyAttempt(dateKey: string = getUtcDateKey()): Promise<void> {
  const map = await getOfficialScoresMap();
  delete map[dateKey];
  await writeJson(STORAGE_KEYS.dailyOfficialScores, map);
  const practice =
    (await readJson<Record<string, number>>(STORAGE_KEYS.dailyPracticeBest)) ?? {};
  if (typeof practice === 'object' && practice != null) {
    const next = { ...practice };
    delete next[dateKey];
    await writeJson(STORAGE_KEYS.dailyPracticeBest, next);
  }
  const last = await readJson<string>(STORAGE_KEYS.dailyLastOfficialDate);
  if (last === dateKey) {
    await writeJson(STORAGE_KEYS.dailyLastOfficialDate, '');
  }
}

export async function addRankedPointsDev(delta: number): Promise<RankedProfile> {
  const profile = await getRankedProfile();
  const nextPoints = Math.max(0, profile.rankedPoints + delta);
  const next: RankedProfile = {
    ...profile,
    rankedPoints: nextPoints,
    division: getDivisionForPoints(nextPoints),
    seasonHighPoints: Math.max(profile.seasonHighPoints, nextPoints),
  };
  await saveRankedProfile(next);
  return next;
}

export async function resetRankedProfile(): Promise<void> {
  await saveRankedProfile({ ...DEFAULT_RANKED_PROFILE });
}
