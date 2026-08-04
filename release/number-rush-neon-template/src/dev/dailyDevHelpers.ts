/**
 * __DEV__ Daily Tournament helpers — not shown in production UI.
 *
 * Usage (Metro / RN debugger):
 *   import {
 *     resetTodayOfficialAttempt,
 *     resetAllDailyData,
 *     printTodayDailySequence,
 *   } from './src/dev/dailyDevHelpers';
 *
 *   await resetTodayOfficialAttempt();
 *   await resetAllDailyData();
 *   printTodayDailySequence();
 */
import { DAILY_MAX_TILES } from '../game/gameConstants';
import { getDailySeed, getUtcDateKey } from '../game/dailyTournament';
import { TileGenerator } from '../game/tileGenerator';
import {
  resetAllDailyData,
  resetTodayOfficialAttempt,
} from '../storage/dailyStorage';

export { resetTodayOfficialAttempt, resetAllDailyData };

export function printTodayDailySequence(): number[] {
  const dateKey = getUtcDateKey();
  const seed = getDailySeed(dateKey);
  const values = TileGenerator.previewSeed(seed, DAILY_MAX_TILES);
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[Daily] ${dateKey} seed=${seed}`);
    // eslint-disable-next-line no-console
    console.log(`[Daily] first ${DAILY_MAX_TILES}:`, values.join(', '));
  }
  return values;
}
