import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../network/NetworkProvider';
import type { RunSubmissionPayload } from '../game/runEvents';
import {
  enqueuePendingSubmission,
  listPendingSubmissions,
  type PendingSubmissionRecord,
} from './pendingSubmissionStorage';
import { flushSubmissionQueue } from './submissionQueue';

export type SubmissionContextValue = {
  pending: PendingSubmissionRecord[];
  enqueue: (payload: RunSubmissionPayload) => Promise<void>;
  flush: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SubmissionContext = createContext<SubmissionContextValue | null>(null);

export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { isInternetReachable } = useNetwork();
  const [pending, setPending] = useState<PendingSubmissionRecord[]>([]);

  const refresh = useCallback(async () => {
    setPending(await listPendingSubmissions());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const flush = useCallback(async () => {
    if (!isAuthenticated || !isInternetReachable) return;
    await flushSubmissionQueue();
    await refresh();
  }, [isAuthenticated, isInternetReachable, refresh]);

  useEffect(() => {
    if (!isAuthenticated || !isInternetReachable) return;
    void flush();
  }, [isAuthenticated, isInternetReachable, flush]);

  const enqueue = useCallback(
    async (payload: RunSubmissionPayload) => {
      await enqueuePendingSubmission(payload);
      await refresh();
      if (isAuthenticated && isInternetReachable) {
        await flush();
      }
    },
    [flush, isAuthenticated, isInternetReachable, refresh],
  );

  const value = useMemo(
    () => ({
      pending,
      enqueue,
      flush,
      refresh,
    }),
    [pending, enqueue, flush, refresh],
  );

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmissions(): SubmissionContextValue {
  const ctx = useContext(SubmissionContext);
  if (!ctx) {
    throw new Error('useSubmissions must be used within SubmissionProvider');
  }
  return ctx;
}
