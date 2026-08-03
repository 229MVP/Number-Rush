import { colors } from './colors';
import { withAlpha } from './colors';

export type ContrastPalette = {
  textPrimary: string;
  textMuted: string;
  borderStrong: number;
  borderLane: string;
  progressTrack: string;
  progressFill: string;
  heartEmpty: string;
  buttonInactive: string;
};

export function getContrastPalette(highContrast: boolean): ContrastPalette {
  if (!highContrast) {
    return {
      textPrimary: colors.white,
      textMuted: colors.muted,
      borderStrong: 0.35,
      borderLane: withAlpha(colors.electricBlue, 0.25),
      progressTrack: colors.backgroundSecondary,
      progressFill: colors.cyan,
      heartEmpty: withAlpha(colors.red, 0.35),
      buttonInactive: withAlpha(colors.muted, 0.35),
    };
  }
  return {
    textPrimary: '#FFFFFF',
    textMuted: '#C8D0E0',
    borderStrong: 0.7,
    borderLane: withAlpha(colors.electricBlue, 0.75),
    progressTrack: '#1A2038',
    progressFill: '#7AF0FF',
    heartEmpty: withAlpha(colors.red, 0.85),
    buttonInactive: withAlpha(colors.white, 0.35),
  };
}
