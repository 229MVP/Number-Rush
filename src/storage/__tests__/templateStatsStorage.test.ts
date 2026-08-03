import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_TEMPLATE_STATS,
  getTemplateStats,
  recordCompletedRun,
  resetTemplateStats,
} from '../templateStatsStorage';

describe('templateStatsStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('defaults to zeroed local stats', async () => {
    expect(await getTemplateStats()).toEqual(DEFAULT_TEMPLATE_STATS);
  });

  it('accumulates perfect clears, tiles placed, and games played', async () => {
    await recordCompletedRun({
      perfectClears: 3,
      tilesPlaced: 12,
      maxComboMultiplier: 2,
    });
    const after1 = await recordCompletedRun({
      perfectClears: 5,
      tilesPlaced: 8,
      maxComboMultiplier: 4,
    });
    expect(after1).toEqual({
      gamesPlayed: 2,
      totalPerfectClears: 8,
      totalTilesPlaced: 20,
      highestCombo: 4,
    });
  });

  it('never lowers the highest combo', async () => {
    await recordCompletedRun({ perfectClears: 1, tilesPlaced: 1, maxComboMultiplier: 4 });
    const after = await recordCompletedRun({
      perfectClears: 1,
      tilesPlaced: 1,
      maxComboMultiplier: 1,
    });
    expect(after.highestCombo).toBe(4);
  });

  it('reset clears all counters back to defaults', async () => {
    await recordCompletedRun({ perfectClears: 2, tilesPlaced: 5, maxComboMultiplier: 3 });
    await resetTemplateStats();
    expect(await getTemplateStats()).toEqual(DEFAULT_TEMPLATE_STATS);
  });
});
