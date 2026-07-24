import type { LevelReward, PlayerProfile } from './progressionTypes';

/** XP required to advance from `level` to `level + 1`. */
export function getXpRequiredForLevel(level: number): number {
  const safe = Math.max(1, Math.floor(level));
  return 100 + (safe - 1) * 50;
}

export function getLevelProgress(profile: PlayerProfile): {
  currentLevel: number;
  currentXp: number;
  requiredXp: number;
  progressPercentage: number;
} {
  const requiredXp = getXpRequiredForLevel(profile.level);
  const currentXp = Math.max(0, profile.currentXp);
  return {
    currentLevel: profile.level,
    currentXp,
    requiredXp,
    progressPercentage: Math.min(100, (currentXp / requiredXp) * 100),
  };
}

/**
 * Milestone-based level rewards (data-driven).
 * Every level: 100 coins
 * Every 5 levels: +10 gems
 * Every 10 levels: +1 wild + optional theme unlock
 */
export function getLevelReward(level: number): LevelReward {
  const reward: LevelReward = {
    level,
    coins: 100,
    gems: 0,
  };
  if (level % 5 === 0) {
    reward.gems += 10;
  }
  if (level === 5) {
    reward.themeUnlockId = 'cyber-ice';
  }
  if (level % 10 === 0) {
    reward.inventory = { wild: 1 };
  }
  return reward;
}

export function applyXp(
  profile: PlayerProfile,
  xpEarned: number,
): {
  updatedProfile: PlayerProfile;
  levelsGained: number;
  previousLevel: number;
  newLevel: number;
  levelRewards: LevelReward[];
} {
  const previousLevel = profile.level;
  let level = profile.level;
  let currentXp = profile.currentXp + Math.max(0, Math.floor(xpEarned));
  const totalXp = profile.totalXp + Math.max(0, Math.floor(xpEarned));
  const levelRewards: LevelReward[] = [];
  let levelsGained = 0;

  // Cap runaway leveling in a single apply
  while (levelsGained < 50) {
    const needed = getXpRequiredForLevel(level);
    if (currentXp < needed) break;
    currentXp -= needed;
    level += 1;
    levelsGained += 1;
    levelRewards.push(getLevelReward(level));
  }

  const unlocked = new Set(profile.unlockedThemeIds);
  for (const reward of levelRewards) {
    if (reward.themeUnlockId) unlocked.add(reward.themeUnlockId);
  }

  return {
    updatedProfile: {
      ...profile,
      level,
      currentXp,
      totalXp,
      unlockedThemeIds: Array.from(unlocked),
      updatedAt: new Date().toISOString(),
    },
    levelsGained,
    previousLevel,
    newLevel: level,
    levelRewards,
  };
}

export function getRankTitleForLevel(level: number): string {
  if (level >= 50) return 'Number Legend';
  if (level >= 30) return 'Neon Master';
  if (level >= 20) return 'Arcade Elite';
  if (level >= 10) return 'Rush Specialist';
  if (level >= 5) return 'Lane Runner';
  return 'Number Rookie';
}
