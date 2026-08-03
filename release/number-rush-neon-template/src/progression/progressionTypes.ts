/** Player progression, economy, and inventory type models. */

export type PlayerProfile = {
  username: string;
  level: number;
  currentXp: number;
  totalXp: number;
  coins: number;
  gems: number;
  selectedThemeId: string;
  unlockedThemeIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type LifetimeStats = {
  highestClassicScore: number;
  gamesPlayed: number;
  classicGamesPlayed: number;
  dailyGamesPlayed: number;
  rankedGamesPlayed: number;
  totalPerfectClears: number;
  totalTilesPlaced: number;
  totalCoinsEarned: number;
  totalGemsEarned: number;
  highestComboMultiplier: number;
  longestPerfectStreak: number;
  dailyWins: number;
  rankedWins: number;
};

export type PlayerInventory = {
  multiplier: number;
  swap: number;
  bomb: number;
  freeze: number;
  shield: number;
  wild: number;
};

export type EconomyTransactionType =
  | 'game_reward'
  | 'mission_reward'
  | 'shop_purchase'
  | 'theme_unlock'
  | 'level_reward'
  | 'development_adjustment'
  | 'rewarded_ad_bonus';

export type EconomyTransaction = {
  id: string;
  type: EconomyTransactionType;
  coinsDelta: number;
  gemsDelta: number;
  inventoryChanges?: Partial<PlayerInventory>;
  xpDelta?: number;
  themeUnlockIds?: string[];
  source: string;
  createdAt: string;
};

export type LevelReward = {
  level: number;
  coins: number;
  gems: number;
  inventory?: Partial<PlayerInventory>;
  themeUnlockId?: string;
};

export type GameRewardBreakdown = {
  baseXp: number;
  scoreXp: number;
  perfectXp: number;
  modeBonusXp: number;
  baseCoins: number;
  scoreCoins: number;
  perfectCoins: number;
  gemsAwarded: number;
};

export type GameReward = {
  xp: number;
  coins: number;
  gems: number;
  reasonBreakdown: GameRewardBreakdown;
};

export type AppliedRunReward = {
  transactionId: string;
  reward: GameReward;
  previousLevel: number;
  newLevel: number;
  levelsGained: number;
  levelRewards: LevelReward[];
  profile: PlayerProfile;
  inventory: PlayerInventory;
  newlyUnlockedThemes: string[];
};

export const DEFAULT_USERNAME = 'NeonPlayer';
export const DEFAULT_THEME_ID = 'neon-classic';

export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  username: DEFAULT_USERNAME,
  level: 1,
  currentXp: 0,
  totalXp: 0,
  coins: 500,
  gems: 25,
  selectedThemeId: DEFAULT_THEME_ID,
  unlockedThemeIds: [DEFAULT_THEME_ID],
  createdAt: '',
  updatedAt: '',
};

export const DEFAULT_PLAYER_INVENTORY: PlayerInventory = {
  multiplier: 2,
  swap: 3,
  bomb: 0,
  freeze: 0,
  shield: 0,
  wild: 0,
};

export const DEFAULT_LIFETIME_STATS: LifetimeStats = {
  highestClassicScore: 0,
  gamesPlayed: 0,
  classicGamesPlayed: 0,
  dailyGamesPlayed: 0,
  rankedGamesPlayed: 0,
  totalPerfectClears: 0,
  totalTilesPlaced: 0,
  totalCoinsEarned: 0,
  totalGemsEarned: 0,
  highestComboMultiplier: 0,
  longestPerfectStreak: 0,
  dailyWins: 0,
  rankedWins: 0,
};

export const STORAGE_KEYS_PLAYER = {
  profile: 'numberRush.player.profile',
  inventory: 'numberRush.player.inventory',
  lifetimeStats: 'numberRush.player.lifetimeStats',
  transactionHistory: 'numberRush.player.transactionHistory',
  appliedRewardIds: 'numberRush.player.appliedRewardIds',
} as const;
