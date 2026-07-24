import type { DailyResultsParams, GameMode, RunCompletionReason } from '../game/gameTypes';
import type { SyncConflict } from '../sync/syncTypes';

export type RootStackParamList = {
  Splash: undefined;
  MainMenu: undefined;
  Gameplay: {
    mode?: GameMode;
    seed?: string;
    officialAttempt?: boolean;
  };
  GameOver: {
    finalScore: number;
    bestScore: number;
    maxComboMultiplier: number;
    longestPerfectStreak: number;
    perfectClears: number;
    tilesPlaced: number;
    isNewBest: boolean;
    rewardKey: string;
    multipliersUsed: number;
    swapsUsed: number;
  };
  Tournament: undefined;
  DailyResults: DailyResultsParams;
  Ranked: undefined;
  Shop: { initialTab?: 'powerup' | 'theme' | 'coins' | 'gems' } | undefined;
  Settings: undefined;
  Missions: undefined;
  Leaderboard: undefined;
  Profile: undefined;
  PowerUps: undefined;
  BetaFeedback: undefined;
  LegalInfo: { section?: 'privacy' | 'terms' | 'data' | 'licenses' } | undefined;
  SignIn: undefined;
  MagicLinkSent: { email: string };
  Account: undefined;
  CloudSync: undefined;
  SyncConflict: { conflicts: SyncConflict[] };
  AuthCallback: { url?: string } | undefined;
};

export type BottomNavRoute = 'MainMenu' | 'Missions' | 'Leaderboard' | 'Profile';

export type { RunCompletionReason };
