export type AppSettings = {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  hapticsEnabled: boolean;
  musicVolume: number;
  soundEffectsVolume: number;
  reducedMotion: boolean;
  highContrast: boolean;
  confirmPowerUpUse: boolean;
  language: string;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  musicEnabled: true,
  soundEffectsEnabled: true,
  hapticsEnabled: true,
  musicVolume: 0.55,
  soundEffectsVolume: 0.8,
  reducedMotion: false,
  highContrast: false,
  confirmPowerUpUse: false,
  language: 'en',
};

export const SETTINGS_STORAGE_KEY = 'numberRush.settings';
