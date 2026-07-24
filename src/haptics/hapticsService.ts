import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

class HapticsService {
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private async run(fn: () => Promise<void>): Promise<void> {
    if (!this.enabled) return;
    if (Platform.OS === 'web') return;
    try {
      await fn();
    } catch {
      // Unsupported device — fail soft
    }
  }

  selection(): void {
    void this.run(() => Haptics.selectionAsync());
  }

  lightImpact(): void {
    void this.run(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    );
  }

  mediumImpact(): void {
    void this.run(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    );
  }

  heavyImpact(): void {
    void this.run(() =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
    );
  }

  success(): void {
    void this.run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  }

  warning(): void {
    void this.run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    );
  }

  error(): void {
    void this.run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    );
  }
}

export const hapticsService = new HapticsService();
