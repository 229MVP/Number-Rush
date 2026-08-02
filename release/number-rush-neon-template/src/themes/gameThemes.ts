export type GameTheme = {
  id: string;
  name: string;
  description: string;
  unlockType: 'default' | 'level' | 'coins' | 'gems' | 'rank';
  unlockValue: number | string;
  colors: {
    background: string;
    backgroundSecondary: string;
    card: string;
    primary: string;
    secondary: string;
    accent: string;
    progress: string;
  };
};

export const GAME_THEMES: GameTheme[] = [
  {
    id: 'neon-classic',
    name: 'NEON CLASSIC',
    description: 'Signature pink and electric blue arcade.',
    unlockType: 'default',
    unlockValue: 0,
    colors: {
      background: '#050617',
      backgroundSecondary: '#0A0D24',
      card: '#10132E',
      primary: '#FF2DBB',
      secondary: '#16C8FF',
      accent: '#4DEBFF',
      progress: '#FF9D1C',
    },
  },
  {
    id: 'cyber-ice',
    name: 'CYBER ICE',
    description: 'Cool cyan circuits for Level 5+',
    unlockType: 'level',
    unlockValue: 5,
    colors: {
      background: '#040B16',
      backgroundSecondary: '#071525',
      card: '#0C1C2E',
      primary: '#4DEBFF',
      secondary: '#16C8FF',
      accent: '#8FD9FF',
      progress: '#57F287',
    },
  },
  {
    id: 'solar-blaze',
    name: 'SOLAR BLAZE',
    description: 'Orange heat — unlock for 3,000 coins.',
    unlockType: 'coins',
    unlockValue: 3000,
    colors: {
      background: '#120805',
      backgroundSecondary: '#1A0E08',
      card: '#24140C',
      primary: '#FF9D1C',
      secondary: '#FFD339',
      accent: '#FF6B1C',
      progress: '#FFD339',
    },
  },
  {
    id: 'void-purple',
    name: 'VOID PURPLE',
    description: 'Deep purple neon — 50 gems.',
    unlockType: 'gems',
    unlockValue: 50,
    colors: {
      background: '#0A0514',
      backgroundSecondary: '#120820',
      card: '#1A1030',
      primary: '#8D3DFF',
      secondary: '#FF2DBB',
      accent: '#C77DFF',
      progress: '#FF2DBB',
    },
  },
  {
    id: 'gold-circuit',
    name: 'GOLD CIRCUIT',
    description: 'Reach Gold Ranked division.',
    unlockType: 'rank',
    unlockValue: 'gold',
    colors: {
      background: '#0C0A04',
      backgroundSecondary: '#161208',
      card: '#221C0C',
      primary: '#FFD339',
      secondary: '#16C8FF',
      accent: '#FFE566',
      progress: '#FF9D1C',
    },
  },
  {
    id: 'blaze-legend',
    name: 'BLAZE LEGEND',
    description: 'Reach Blaze Ranked division.',
    unlockType: 'rank',
    unlockValue: 'blaze',
    colors: {
      background: '#140604',
      backgroundSecondary: '#1C0A06',
      card: '#2A1008',
      primary: '#FF9D1C',
      secondary: '#FF365E',
      accent: '#FFD339',
      progress: '#FF6B1C',
    },
  },
];

export function getThemeById(id: string): GameTheme {
  return GAME_THEMES.find((t) => t.id === id) ?? GAME_THEMES[0];
}
