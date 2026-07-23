/**
 * __DEV__ testing helpers for Daily Tournament + Ranked.
 *
 * These are NOT shown in the production UI. Import from the Metro console,
 * a temporary Settings debug panel, or call from React Native Debugger:
 *
 *   import {
 *     resetDailyAttempt,
 *     addRankedPointsDev,
 *     resetRankedProfile,
 *   } from './src/storage/gameStorage';
 *
 * Examples:
 *   await resetDailyAttempt()           // clear today's official + practice
 *   await addRankedPointsDev(300)       // jump toward Silver
 *   await addRankedPointsDev(-300)      // subtract RP (floors at 0)
 *   await resetRankedProfile()          // back to Bronze III / 0 RP
 *
 * Storage keys:
 *   numberRush.daily.lastOfficialDate
 *   numberRush.daily.officialScores
 *   numberRush.daily.practiceBest
 *   numberRush.daily.completedAttempts
 *   numberRush.ranked.profile
 */
export {
  resetDailyAttempt,
  addRankedPointsDev,
  resetRankedProfile,
} from '../storage/gameStorage';
