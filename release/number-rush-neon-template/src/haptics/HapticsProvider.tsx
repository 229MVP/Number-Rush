import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getAppSettings,
  updateAppSettings,
} from '../storage/settingsStorage';
import { hapticsService } from './hapticsService';

type HapticsContextValue = {
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  selection: () => void;
  lightImpact: () => void;
  mediumImpact: () => void;
  heavyImpact: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
  refreshFromStorage: () => Promise<void>;
};

const HapticsContext = createContext<HapticsContextValue | null>(null);

export function HapticsProvider({ children }: { children: React.ReactNode }) {
  const [hapticsEnabled, setEnabledState] = useState(true);

  const refreshFromStorage = useCallback(async () => {
    const settings = await getAppSettings();
    setEnabledState(settings.hapticsEnabled);
    hapticsService.setEnabled(settings.hapticsEnabled);
  }, []);

  useEffect(() => {
    void refreshFromStorage();
  }, [refreshFromStorage]);

  const value = useMemo<HapticsContextValue>(
    () => ({
      hapticsEnabled,
      setHapticsEnabled: async (enabled) => {
        await updateAppSettings({ hapticsEnabled: enabled });
        setEnabledState(enabled);
        hapticsService.setEnabled(enabled);
      },
      selection: () => hapticsService.selection(),
      lightImpact: () => hapticsService.lightImpact(),
      mediumImpact: () => hapticsService.mediumImpact(),
      heavyImpact: () => hapticsService.heavyImpact(),
      success: () => hapticsService.success(),
      warning: () => hapticsService.warning(),
      error: () => hapticsService.error(),
      refreshFromStorage,
    }),
    [hapticsEnabled, refreshFromStorage],
  );

  return (
    <HapticsContext.Provider value={value}>{children}</HapticsContext.Provider>
  );
}

export function useHaptics(): HapticsContextValue {
  const ctx = useContext(HapticsContext);
  if (!ctx) throw new Error('useHaptics must be used within HapticsProvider');
  return ctx;
}

export function useOptionalHaptics(): HapticsContextValue | null {
  return useContext(HapticsContext);
}
