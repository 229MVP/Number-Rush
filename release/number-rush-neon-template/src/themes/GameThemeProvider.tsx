import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  GAME_THEMES,
  getThemeById,
  type GameTheme,
} from './gameThemes';
import {
  applyEconomyTransaction,
  createTransactionId,
  getPlayerProfile,
  updatePlayerProfile,
} from '../storage/playerStorage';
import type { PlayerProfile } from '../progression/progressionTypes';
import { colors as baseColors } from '../theme/colors';

type ThemeColors = {
  background: string;
  backgroundSecondary: string;
  card: string;
  neonPink: string;
  electricBlue: string;
  cyan: string;
  orange: string;
  purple: string;
  yellow: string;
  green: string;
  red: string;
  white: string;
  muted: string;
  magenta: string;
  panelLight: string;
};

type GameThemeContextValue = {
  activeTheme: GameTheme;
  themeColors: ThemeColors;
  availableThemes: GameTheme[];
  unlockedThemeIds: string[];
  selectTheme: (themeId: string) => Promise<boolean>;
  unlockTheme: (themeId: string) => Promise<boolean>;
  refreshThemes: () => Promise<void>;
  profile: PlayerProfile | null;
};

const GameThemeContext = createContext<GameThemeContextValue | null>(null);

function buildThemeColors(theme: GameTheme): ThemeColors {
  return {
    ...baseColors,
    background: theme.colors.background,
    backgroundSecondary: theme.colors.backgroundSecondary,
    card: theme.colors.card,
    neonPink: theme.colors.primary,
    electricBlue: theme.colors.secondary,
    cyan: theme.colors.accent,
    orange: theme.colors.progress,
  };
}

export function GameThemeProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [activeTheme, setActiveTheme] = useState<GameTheme>(GAME_THEMES[0]);

  const refreshThemes = useCallback(async () => {
    const p = await getPlayerProfile();
    setProfile(p);
    setActiveTheme(getThemeById(p.selectedThemeId));
  }, []);

  useEffect(() => {
    void refreshThemes();
  }, [refreshThemes]);

  const selectTheme = useCallback(async (themeId: string) => {
    const p = await getPlayerProfile();
    if (!p.unlockedThemeIds.includes(themeId)) return false;
    const next = await updatePlayerProfile({ selectedThemeId: themeId });
    setProfile(next);
    setActiveTheme(getThemeById(themeId));
    return true;
  }, []);

  const unlockTheme = useCallback(async (themeId: string) => {
    const theme = getThemeById(themeId);
    const p = await getPlayerProfile();
    if (p.unlockedThemeIds.includes(themeId)) return true;

    if (theme.unlockType === 'coins') {
      const price = typeof theme.unlockValue === 'number' ? theme.unlockValue : 0;
      await applyEconomyTransaction({
        id: createTransactionId(`theme-${themeId}`),
        type: 'theme_unlock',
        coinsDelta: -price,
        gemsDelta: 0,
        themeUnlockIds: [themeId],
        source: `theme:${themeId}`,
        createdAt: new Date().toISOString(),
      });
    } else if (theme.unlockType === 'gems') {
      const price = typeof theme.unlockValue === 'number' ? theme.unlockValue : 0;
      await applyEconomyTransaction({
        id: createTransactionId(`theme-${themeId}`),
        type: 'theme_unlock',
        coinsDelta: 0,
        gemsDelta: -price,
        themeUnlockIds: [themeId],
        source: `theme:${themeId}`,
        createdAt: new Date().toISOString(),
      });
    } else {
      await updatePlayerProfile({
        unlockedThemeIds: [...p.unlockedThemeIds, themeId],
      });
    }
    await refreshThemes();
    return true;
  }, [refreshThemes]);

  const value = useMemo<GameThemeContextValue>(
    () => ({
      activeTheme,
      themeColors: buildThemeColors(activeTheme),
      availableThemes: GAME_THEMES,
      unlockedThemeIds: profile?.unlockedThemeIds ?? ['neon-classic'],
      selectTheme,
      unlockTheme,
      refreshThemes,
      profile,
    }),
    [activeTheme, profile, selectTheme, unlockTheme, refreshThemes],
  );

  return (
    <GameThemeContext.Provider value={value}>
      {children}
    </GameThemeContext.Provider>
  );
}

export function useGameTheme(): GameThemeContextValue {
  const ctx = useContext(GameThemeContext);
  if (!ctx) {
    throw new Error('useGameTheme must be used within GameThemeProvider');
  }
  return ctx;
}

/** Safe hook that falls back when provider missing (tests). */
export function useOptionalGameTheme(): GameThemeContextValue | null {
  return useContext(GameThemeContext);
}
