import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_APP_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type AppSettings,
} from '../settings/settingsTypes';

function clamp01(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

export function normalizeAppSettings(value: unknown): AppSettings {
  if (value == null || typeof value !== 'object') {
    return { ...DEFAULT_APP_SETTINGS };
  }
  const raw = value as Record<string, unknown>;
  return {
    musicEnabled:
      typeof raw.musicEnabled === 'boolean'
        ? raw.musicEnabled
        : DEFAULT_APP_SETTINGS.musicEnabled,
    soundEffectsEnabled:
      typeof raw.soundEffectsEnabled === 'boolean'
        ? raw.soundEffectsEnabled
        : DEFAULT_APP_SETTINGS.soundEffectsEnabled,
    hapticsEnabled:
      typeof raw.hapticsEnabled === 'boolean'
        ? raw.hapticsEnabled
        : DEFAULT_APP_SETTINGS.hapticsEnabled,
    musicVolume: clamp01(raw.musicVolume, DEFAULT_APP_SETTINGS.musicVolume),
    soundEffectsVolume: clamp01(
      raw.soundEffectsVolume,
      DEFAULT_APP_SETTINGS.soundEffectsVolume,
    ),
    reducedMotion:
      typeof raw.reducedMotion === 'boolean'
        ? raw.reducedMotion
        : DEFAULT_APP_SETTINGS.reducedMotion,
    highContrast:
      typeof raw.highContrast === 'boolean'
        ? raw.highContrast
        : DEFAULT_APP_SETTINGS.highContrast,
    confirmPowerUpUse:
      typeof raw.confirmPowerUpUse === 'boolean'
        ? raw.confirmPowerUpUse
        : DEFAULT_APP_SETTINGS.confirmPowerUpUse,
    language:
      typeof raw.language === 'string' && raw.language.length > 0
        ? raw.language
        : DEFAULT_APP_SETTINGS.language,
  };
}

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw == null || raw === '') {
      const defaults = { ...DEFAULT_APP_SETTINGS };
      await saveAppSettings(defaults);
      return defaults;
    }
    return normalizeAppSettings(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizeAppSettings(settings)),
    );
  } catch {
    // ignore
  }
}

export async function updateAppSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  const current = await getAppSettings();
  const next = normalizeAppSettings({ ...current, ...patch });
  await saveAppSettings(next);
  return next;
}

export async function resetAppSettings(): Promise<AppSettings> {
  const defaults = { ...DEFAULT_APP_SETTINGS };
  await saveAppSettings(defaults);
  return defaults;
}
