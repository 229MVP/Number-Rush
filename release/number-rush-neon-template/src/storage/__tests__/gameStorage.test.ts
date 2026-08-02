import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getBestScore,
  getTutorialCompleted,
  setBestScore,
  setTutorialCompleted,
  updateBestScoreIfNeeded,
} from '../gameStorage';

describe('gameStorage best-score persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('defaults to 0 when nothing stored', async () => {
    expect(await getBestScore()).toBe(0);
  });

  it('normalizes malformed stored values to 0', async () => {
    await AsyncStorage.setItem('numberRush.bestScore', 'not-a-number');
    expect(await getBestScore()).toBe(0);
  });

  it('normalizes negative values to 0', async () => {
    await AsyncStorage.setItem('numberRush.bestScore', '-50');
    expect(await getBestScore()).toBe(0);
  });

  it('floors and clamps written values', async () => {
    await setBestScore(1234.9);
    expect(await getBestScore()).toBe(1234);
    await setBestScore(-10);
    expect(await getBestScore()).toBe(0);
  });

  it('updateBestScoreIfNeeded only raises the stored best', async () => {
    await setBestScore(100);
    const lower = await updateBestScoreIfNeeded(50);
    expect(lower).toEqual({ bestScore: 100, isNewBest: false });

    const higher = await updateBestScoreIfNeeded(250);
    expect(higher).toEqual({ bestScore: 250, isNewBest: true });
    expect(await getBestScore()).toBe(250);
  });

  it('tutorial completion flag persists and resets', async () => {
    expect(await getTutorialCompleted()).toBe(false);
    await setTutorialCompleted(true);
    expect(await getTutorialCompleted()).toBe(true);
    await setTutorialCompleted(false);
    expect(await getTutorialCompleted()).toBe(false);
  });
});
