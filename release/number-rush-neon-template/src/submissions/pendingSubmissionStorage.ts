import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RunSubmissionPayload } from '../game/runEvents';

const STORAGE_KEY = 'numberRush.submissions.pending';

export type PendingSubmissionRecord = {
  id: string;
  payload: RunSubmissionPayload;
  createdAt: string;
  attempts: number;
  lastError: string | null;
};

async function readAll(): Promise<PendingSubmissionRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PendingSubmissionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(records: PendingSubmissionRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function listPendingSubmissions(): Promise<PendingSubmissionRecord[]> {
  return readAll();
}

export async function enqueuePendingSubmission(
  payload: RunSubmissionPayload,
): Promise<PendingSubmissionRecord> {
  const records = await readAll();
  const record: PendingSubmissionRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastError: null,
  };
  records.push(record);
  await writeAll(records);
  return record;
}

export async function updatePendingSubmission(
  id: string,
  patch: Partial<Pick<PendingSubmissionRecord, 'attempts' | 'lastError'>>,
): Promise<void> {
  const records = await readAll();
  const next = records.map((r) =>
    r.id === id ? { ...r, ...patch } : r,
  );
  await writeAll(next);
}

export async function removePendingSubmission(id: string): Promise<void> {
  const records = await readAll();
  await writeAll(records.filter((r) => r.id !== id));
}

export async function clearPendingSubmissions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
