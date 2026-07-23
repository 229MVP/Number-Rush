import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../game/gameConstants';

export async function getBestScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.bestScore);
    if (raw == null) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export async function setBestScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.bestScore, String(Math.max(0, Math.floor(score))));
  } catch {
    // Storage unavailable (e.g. restricted web) — ignore safely.
  }
}

export async function updateBestScoreIfNeeded(
  finalScore: number,
): Promise<{ bestScore: number; isNewBest: boolean }> {
  const previous = await getBestScore();
  if (finalScore > previous) {
    await setBestScore(finalScore);
    return { bestScore: finalScore, isNewBest: true };
  }
  return { bestScore: previous, isNewBest: false };
}

export async function getTutorialCompleted(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.tutorialCompleted);
    return raw === '1' || raw === 'true';
  } catch {
    return false;
  }
}

export async function setTutorialCompleted(completed = true): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.tutorialCompleted,
      completed ? '1' : '0',
    );
  } catch {
    // ignore
  }
}

/** Dev helper — call from console if you need to re-show the tutorial. */
export async function resetTutorialForDev(): Promise<void> {
  if (!__DEV__) return;
  await setTutorialCompleted(false);
}
