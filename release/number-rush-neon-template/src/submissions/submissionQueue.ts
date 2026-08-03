import { trackEvent } from '../analytics/analyticsService';
import { logger } from '../logging/logger';
import { getSupabaseClient } from '../backend/supabaseClient';
import { getSession } from '../auth/authService';
import type { PendingSubmissionRecord } from './pendingSubmissionStorage';
import {
  listPendingSubmissions,
  removePendingSubmission,
  updatePendingSubmission,
} from './pendingSubmissionStorage';

const MAX_ATTEMPTS = 5;

async function submitOne(record: PendingSubmissionRecord): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const session = await getSession();
  if (!session) return false;

  const { mode, payload } = { mode: record.payload.mode, payload: record.payload };
  const functionName =
    mode === 'daily' ? 'submit-daily-run' : 'submit-ranked-run';

  const { error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    await updatePendingSubmission(record.id, {
      attempts: record.attempts + 1,
      lastError: error.message,
    });
    logger.warn('Submission invoke failed', {
      mode,
      message: error.message,
    });
    return false;
  }

  await removePendingSubmission(record.id);
  trackEvent('submission_sent', { mode });
  return true;
}

export async function flushSubmissionQueue(): Promise<{
  processed: number;
  remaining: number;
}> {
  const pending = await listPendingSubmissions();
  let processed = 0;

  for (const record of pending) {
    if (record.attempts >= MAX_ATTEMPTS) continue;
    const ok = await submitOne(record);
    if (ok) processed += 1;
  }

  const remaining = (await listPendingSubmissions()).length;
  return { processed, remaining };
}

export async function processSubmissionQueueOnce(): Promise<void> {
  await flushSubmissionQueue();
}
