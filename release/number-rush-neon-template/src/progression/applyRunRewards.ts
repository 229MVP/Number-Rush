import {
  calculateGameReward,
  type RewardInput,
} from '../progression/gameRewards';
import type { AppliedRunReward, GameReward } from '../progression/progressionTypes';
import {
  applyEconomyTransaction,
  applyLifetimeStatChanges,
  createTransactionId,
  DuplicateTransactionError,
  getPlayerInventory,
  getPlayerProfile,
  wasTransactionApplied,
} from '../storage/playerStorage';
import { applyMissionEvents } from '../storage/missionStorage';
import type { MissionEvent } from '../missions/missionTypes';

export type RunRewardContext = RewardInput & {
  transactionId: string;
  maxComboMultiplier: number;
  longestPerfectStreak: number;
  tilesPlaced: number;
  multipliersUsed?: number;
  swapsUsed?: number;
};

/**
 * Apply run rewards exactly once (guarded by transaction ID).
 * Also emits mission events and lifetime stats.
 */
export async function applyRunRewardsOnce(
  ctx: RunRewardContext,
): Promise<AppliedRunReward | null> {
  const reward: GameReward = calculateGameReward(ctx);

  if (await wasTransactionApplied(ctx.transactionId)) {
    const profile = await getPlayerProfile();
    const inventory = await getPlayerInventory();
    return {
      transactionId: ctx.transactionId,
      reward,
      previousLevel: profile.level,
      newLevel: profile.level,
      levelsGained: 0,
      levelRewards: [],
      profile,
      inventory,
      newlyUnlockedThemes: [],
    };
  }

  const previous = await getPlayerProfile();
  const previousUnlocked = new Set(previous.unlockedThemeIds);

  try {
    const { profile, inventory, levelRewards } = await applyEconomyTransaction({
      id: ctx.transactionId,
      type: 'game_reward',
      coinsDelta: reward.coins,
      gemsDelta: reward.gems,
      xpDelta: reward.xp,
      source: `game:${ctx.mode}`,
      createdAt: new Date().toISOString(),
    });

    const newlyUnlockedThemes = profile.unlockedThemeIds.filter(
      (id) => !previousUnlocked.has(id),
    );

    // Lifetime stats
    const modeGames =
      ctx.mode === 'classic'
        ? { classicGamesPlayed: 1 }
        : ctx.mode === 'daily'
          ? { dailyGamesPlayed: 1 }
          : { rankedGamesPlayed: 1 };

    await applyLifetimeStatChanges({
      gamesPlayed: 1,
      ...modeGames,
      totalPerfectClears: ctx.perfectClears,
      totalTilesPlaced: ctx.tilesPlaced,
      totalCoinsEarned: reward.coins,
      totalGemsEarned: reward.gems,
      dailyWins:
        ctx.mode === 'daily' &&
        'calculatedRank' in ctx &&
        ctx.calculatedRank === 1
          ? 1
          : 0,
      rankedWins:
        ctx.mode === 'ranked' && 'outcome' in ctx && ctx.outcome === 'win'
          ? 1
          : 0,
      maxFields: {
        highestClassicScore:
          ctx.mode === 'classic' ? ctx.score : undefined,
        highestComboMultiplier: ctx.maxComboMultiplier,
        longestPerfectStreak: ctx.longestPerfectStreak,
      },
    });

    // Mission events
    const events: MissionEvent[] = [
      { metric: 'games_played', amount: 1 },
      { metric: 'score_total', amount: ctx.score },
      { metric: 'single_run_score', amount: 0, highestValue: ctx.score },
      { metric: 'perfect_clears', amount: ctx.perfectClears },
      { metric: 'tiles_placed', amount: ctx.tilesPlaced },
      {
        metric: 'reach_combo',
        amount: 0,
        highestValue: ctx.maxComboMultiplier,
      },
      { metric: 'earn_coins', amount: reward.coins },
    ];
    if (ctx.mode === 'classic') {
      events.push({ metric: 'classic_games', amount: 1 });
    }
    if (ctx.mode === 'daily') {
      events.push({ metric: 'daily_attempts', amount: 1 });
    }
    if (ctx.mode === 'ranked') {
      events.push({ metric: 'ranked_games', amount: 1 });
      if ('outcome' in ctx && ctx.outcome === 'win') {
        events.push({ metric: 'ranked_wins', amount: 1 });
      }
    }
    if (ctx.multipliersUsed && ctx.multipliersUsed > 0) {
      events.push({ metric: 'use_multiplier', amount: ctx.multipliersUsed });
    }
    if (ctx.swapsUsed && ctx.swapsUsed > 0) {
      events.push({ metric: 'use_swap', amount: ctx.swapsUsed });
    }
    await applyMissionEvents(events);

    const levelsGained = Math.max(0, profile.level - previous.level);

    return {
      transactionId: ctx.transactionId,
      reward,
      previousLevel: previous.level,
      newLevel: profile.level,
      levelsGained,
      levelRewards,
      profile,
      inventory,
      newlyUnlockedThemes,
    };
  } catch (error) {
    if (error instanceof DuplicateTransactionError) {
      const profile = await getPlayerProfile();
      const inventory = await getPlayerInventory();
      return {
        transactionId: ctx.transactionId,
        reward,
        previousLevel: profile.level,
        newLevel: profile.level,
        levelsGained: 0,
        levelRewards: [],
        profile,
        inventory,
        newlyUnlockedThemes: [],
      };
    }
    throw error;
  }
}

export { createTransactionId };
