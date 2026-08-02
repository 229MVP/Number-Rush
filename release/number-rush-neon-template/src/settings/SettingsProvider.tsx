import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  type EmitterSubscription,
} from 'react-native';
import {
  getAppSettings,
  resetAppSettings,
  updateAppSettings,
} from '../storage/settingsStorage';
import type { AppSettings } from './settingsTypes';
import { DEFAULT_APP_SETTINGS } from './settingsTypes';

type SettingsContextValue = {
  settings: AppSettings;
  reducedMotionActive: boolean;
  refreshSettings: () => Promise<void>;
  patchSettings: (patch: Partial<AppSettings>) => Promise<void>;
  restoreDefaults: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  const refreshSettings = useCallback(async () => {
    const next = await getAppSettings();
    setSettings(next);
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    let sub: EmitterSubscription | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion);
    sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystemReduceMotion,
    );
    return () => {
      sub?.remove();
    };
  }, []);

  const patchSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = await updateAppSettings(patch);
    setSettings(next);
  }, []);

  const restoreDefaults = useCallback(async () => {
    const next = await resetAppSettings();
    setSettings(next);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      reducedMotionActive: settings.reducedMotion || systemReduceMotion,
      refreshSettings,
      patchSettings,
      restoreDefaults,
    }),
    [
      settings,
      systemReduceMotion,
      refreshSettings,
      patchSettings,
      restoreDefaults,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function useOptionalSettings(): SettingsContextValue | null {
  return useContext(SettingsContext);
}

/** Combines in-app setting with OS reduce-motion preference. */
export function useReducedMotionPreference(): boolean {
  const ctx = useOptionalSettings();
  return ctx?.reducedMotionActive ?? false;
}
