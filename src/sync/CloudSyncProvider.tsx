import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { cloudSyncEnabled } from '../config/featureFlags';
import {
  getCloudSyncStatus,
  queueDomainChange,
  subscribeCloudSyncStatus,
  syncNow,
} from '../sync/cloudSyncService';
import type { CloudProgressBundle, SyncDomain, SyncStatus } from '../sync/syncTypes';
import { useAuth } from '../hooks/useAuth';

export type CloudSyncContextValue = {
  status: SyncStatus;
  lastBundle: CloudProgressBundle | null;
  enabled: boolean;
  queueDomainChange: (domain: SyncDomain) => void;
  syncNow: () => Promise<CloudProgressBundle | null>;
};

const CloudSyncContext = createContext<CloudSyncContextValue | null>(null);

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<SyncStatus>(getCloudSyncStatus());
  const [lastBundle, setLastBundle] = useState<CloudProgressBundle | null>(
    null,
  );

  useEffect(() => subscribeCloudSyncStatus(setStatus), []);

  useEffect(() => {
    if (!cloudSyncEnabled || !isAuthenticated) return;
    void syncNow('manual').then((bundle) => {
      if (bundle) setLastBundle(bundle);
    });
  }, [isAuthenticated]);

  const queueChange = useCallback((domain: SyncDomain) => {
    queueDomainChange(domain);
  }, []);

  const runSync = useCallback(async () => {
    const bundle = await syncNow('manual');
    if (bundle) setLastBundle(bundle);
    return bundle;
  }, []);

  const value = useMemo<CloudSyncContextValue>(
    () => ({
      status,
      lastBundle,
      enabled: cloudSyncEnabled,
      queueDomainChange: queueChange,
      syncNow: runSync,
    }),
    [status, lastBundle, queueChange, runSync],
  );

  return (
    <CloudSyncContext.Provider value={value}>
      {children}
    </CloudSyncContext.Provider>
  );
}

export function useCloudSyncContext(): CloudSyncContextValue {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) {
    throw new Error('useCloudSyncContext must be used within CloudSyncProvider');
  }
  return ctx;
}
