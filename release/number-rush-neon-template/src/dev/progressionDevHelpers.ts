/**
 * __DEV__ player progression helpers — not shown in production UI.
 *
 * Usage (Metro / console / temporary call site):
 *   import {
 *     resetPlayerProgression,
 *     addCoins,
 *     addGems,
 *     addXp,
 *     setPlayerLevel,
 *     unlockAllThemes,
 *     resetMissions,
 *     completeAllMissions,
 *     printPlayerData,
 *   } from './src/dev/progressionDevHelpers';
 */
import { GAME_THEMES } from '../themes/gameThemes';
import { applyXp, getXpRequiredForLevel } from '../progression/xpSystem';
import {
  applyEconomyTransaction,
  createTransactionId,
  getLifetimeStats,
  getPlayerInventory,
  getPlayerProfile,
  resetPlayerProgression,
  savePlayerProfile,
  updatePlayerProfile,
} from '../storage/playerStorage';
import {
  completeAllMissions,
  resetMissions,
} from '../storage/missionStorage';

export {
  resetPlayerProgression,
  resetMissions,
  completeAllMissions,
};

export async function addCoins(amount: number) {
  return applyEconomyTransaction({
    id: createTransactionId('dev-coins'),
    type: 'development_adjustment',
    coinsDelta: amount,
    gemsDelta: 0,
    source: 'dev:addCoins',
    createdAt: new Date().toISOString(),
  });
}

export async function addGems(amount: number) {
  return applyEconomyTransaction({
    id: createTransactionId('dev-gems'),
    type: 'development_adjustment',
    coinsDelta: 0,
    gemsDelta: amount,
    source: 'dev:addGems',
    createdAt: new Date().toISOString(),
  });
}

export async function addXp(amount: number) {
  return applyEconomyTransaction({
    id: createTransactionId('dev-xp'),
    type: 'development_adjustment',
    coinsDelta: 0,
    gemsDelta: 0,
    xpDelta: amount,
    source: 'dev:addXp',
    createdAt: new Date().toISOString(),
  });
}

export async function setPlayerLevel(level: number) {
  const profile = await getPlayerProfile();
  let totalXp = 0;
  for (let l = 1; l < level; l += 1) {
    totalXp += getXpRequiredForLevel(l);
  }
  const next = applyXp(
    { ...profile, level: 1, currentXp: 0, totalXp: 0 },
    totalXp,
  ).updatedProfile;
  const unlocked = new Set(next.unlockedThemeIds);
  if (level >= 5) unlocked.add('cyber-ice');
  await savePlayerProfile({
    ...next,
    level: Math.max(1, Math.floor(level)),
    currentXp: 0,
    unlockedThemeIds: Array.from(unlocked),
  });
  return getPlayerProfile();
}

export async function unlockAllThemes() {
  const ids = GAME_THEMES.map((t) => t.id);
  return updatePlayerProfile({ unlockedThemeIds: ids });
}

export async function printPlayerData() {
  const [profile, inventory, stats] = await Promise.all([
    getPlayerProfile(),
    getPlayerInventory(),
    getLifetimeStats(),
  ]);
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log('[Player]', { profile, inventory, stats });
  }
  return { profile, inventory, stats };
}
