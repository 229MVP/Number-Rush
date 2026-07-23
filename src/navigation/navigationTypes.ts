export type RootStackParamList = {
  Splash: undefined;
  MainMenu: undefined;
  Gameplay: undefined;
  GameOver: {
    finalScore: number;
    bestScore: number;
    maxComboMultiplier: number;
    longestPerfectStreak: number;
    perfectClears: number;
    tilesPlaced: number;
    isNewBest: boolean;
  };
  Tournament: undefined;
  Ranked: undefined;
  Shop: undefined;
  Settings: undefined;
  Missions: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type BottomNavRoute = 'MainMenu' | 'Missions' | 'Leaderboard' | 'Profile';
