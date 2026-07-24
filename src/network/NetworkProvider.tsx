import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import * as Network from 'expo-network';

import { logger } from '../logging/logger';

export type NetworkContextValue = {
  isConnected: boolean;
  isInternetReachable: boolean;
};

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isInternetReachable: true,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const state = await Network.getNetworkStateAsync();
        if (cancelled) return;
        setIsConnected(state.isConnected ?? true);
        setIsInternetReachable(state.isInternetReachable ?? state.isConnected ?? true);
      } catch (error) {
        if (Platform.OS === 'web') {
          setIsConnected(true);
          setIsInternetReachable(true);
          return;
        }
        logger.warn('Network state unavailable', {
          message: error instanceof Error ? error.message : 'unknown',
        });
      }
    }

    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, 15_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const value = useMemo(
    () => ({ isConnected, isInternetReachable }),
    [isConnected, isInternetReachable],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  return useContext(NetworkContext);
}
