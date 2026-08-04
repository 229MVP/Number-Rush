import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';

import type { RemoteConfig, RemoteConfigFetchState } from './liveOpsTypes';
import {
  bootstrapRemoteConfig,
  getRemoteConfigSnapshot,
  refreshRemoteConfig,
  refreshServerClock,
} from './remoteConfigService';
import { getServerClockSnapshot } from './serverClock';
import type { ServerClockSnapshot } from './liveOpsTypes';

type RemoteConfigContextValue = {
  config: RemoteConfig;
  fetchState: RemoteConfigFetchState;
  serverClock: ServerClockSnapshot;
  refresh: (force?: boolean) => Promise<void>;
};

const RemoteConfigContext = createContext<RemoteConfigContextValue | null>(null);

export function RemoteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<RemoteConfig>(getRemoteConfigSnapshot());
  const [fetchState, setFetchState] = useState<RemoteConfigFetchState>('idle');
  const [serverClock, setServerClock] = useState(getServerClockSnapshot());

  const refresh = useCallback(async (force = false) => {
    setFetchState('loading');
    await refreshServerClock();
    setServerClock(getServerClockSnapshot());
    const next = await refreshRemoteConfig({ force });
    setConfig(next);
    setFetchState('ready');
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const boot = await bootstrapRemoteConfig();
      if (cancelled) return;
      setConfig(boot);
      setFetchState('cached');
      await refresh(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh(false);
      }
    });
    return () => sub.remove();
  }, [refresh]);

  const value = useMemo(
    () => ({ config, fetchState, serverClock, refresh }),
    [config, fetchState, serverClock, refresh],
  );

  return (
    <RemoteConfigContext.Provider value={value}>
      {children}
    </RemoteConfigContext.Provider>
  );
}

export function useRemoteConfigContext(): RemoteConfigContextValue {
  const ctx = useContext(RemoteConfigContext);
  if (!ctx) {
    throw new Error('useRemoteConfigContext must be used within RemoteConfigProvider');
  }
  return ctx;
}
