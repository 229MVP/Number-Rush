import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  getAppSettings,
  updateAppSettings,
} from '../storage/settingsStorage';
import { audioService } from './audioService';
import type { MusicTrackId, SoundEffectId } from './audioTypes';

type AudioContextValue = {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  musicVolume: number;
  soundEffectsVolume: number;
  playSound: (id: SoundEffectId) => void;
  playMusic: (track: MusicTrackId) => Promise<void>;
  stopMusic: () => Promise<void>;
  pauseMusic: () => void;
  resumeMusic: () => void;
  setMusicEnabled: (enabled: boolean) => Promise<void>;
  setSoundEffectsEnabled: (enabled: boolean) => Promise<void>;
  setMusicVolume: (volume: number) => Promise<void>;
  setSoundEffectsVolume: (volume: number) => Promise<void>;
  refreshFromStorage: () => Promise<void>;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [musicEnabled, setMusicEnabledState] = useState(true);
  const [soundEffectsEnabled, setSfxEnabledState] = useState(true);
  const [musicVolume, setMusicVolumeState] = useState(0.55);
  const [soundEffectsVolume, setSfxVolumeState] = useState(0.8);

  const applyLocal = useCallback(
    (next: {
      musicEnabled: boolean;
      soundEffectsEnabled: boolean;
      musicVolume: number;
      soundEffectsVolume: number;
    }) => {
      setMusicEnabledState(next.musicEnabled);
      setSfxEnabledState(next.soundEffectsEnabled);
      setMusicVolumeState(next.musicVolume);
      setSfxVolumeState(next.soundEffectsVolume);
      audioService.configure(next);
    },
    [],
  );

  const refreshFromStorage = useCallback(async () => {
    const settings = await getAppSettings();
    applyLocal({
      musicEnabled: settings.musicEnabled,
      soundEffectsEnabled: settings.soundEffectsEnabled,
      musicVolume: settings.musicVolume,
      soundEffectsVolume: settings.soundEffectsVolume,
    });
  }, [applyLocal]);

  useEffect(() => {
    void (async () => {
      await audioService.init();
      await refreshFromStorage();
    })();
    return () => {
      void audioService.dispose();
    };
  }, [refreshFromStorage]);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      void audioService.setAppActive(state === 'active');
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVis = () => {
      void audioService.setAppActive(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const value = useMemo<AudioContextValue>(
    () => ({
      musicEnabled,
      soundEffectsEnabled,
      musicVolume,
      soundEffectsVolume,
      playSound: (id) => audioService.playSound(id),
      playMusic: (track) => audioService.playMusic(track),
      stopMusic: () => audioService.stopMusic(),
      pauseMusic: () => audioService.pauseMusic(),
      resumeMusic: () => audioService.resumeMusic(),
      setMusicEnabled: async (enabled) => {
        const next = await updateAppSettings({ musicEnabled: enabled });
        applyLocal({
          musicEnabled: next.musicEnabled,
          soundEffectsEnabled: next.soundEffectsEnabled,
          musicVolume: next.musicVolume,
          soundEffectsVolume: next.soundEffectsVolume,
        });
      },
      setSoundEffectsEnabled: async (enabled) => {
        const next = await updateAppSettings({ soundEffectsEnabled: enabled });
        applyLocal({
          musicEnabled: next.musicEnabled,
          soundEffectsEnabled: next.soundEffectsEnabled,
          musicVolume: next.musicVolume,
          soundEffectsVolume: next.soundEffectsVolume,
        });
      },
      setMusicVolume: async (volume) => {
        const next = await updateAppSettings({ musicVolume: volume });
        applyLocal({
          musicEnabled: next.musicEnabled,
          soundEffectsEnabled: next.soundEffectsEnabled,
          musicVolume: next.musicVolume,
          soundEffectsVolume: next.soundEffectsVolume,
        });
      },
      setSoundEffectsVolume: async (volume) => {
        const next = await updateAppSettings({ soundEffectsVolume: volume });
        applyLocal({
          musicEnabled: next.musicEnabled,
          soundEffectsEnabled: next.soundEffectsEnabled,
          musicVolume: next.musicVolume,
          soundEffectsVolume: next.soundEffectsVolume,
        });
      },
      refreshFromStorage,
    }),
    [
      musicEnabled,
      soundEffectsEnabled,
      musicVolume,
      soundEffectsVolume,
      applyLocal,
      refreshFromStorage,
    ],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}

export function useOptionalAudio(): AudioContextValue | null {
  return useContext(AudioContext);
}
