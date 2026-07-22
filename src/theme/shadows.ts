import { Platform, ViewStyle } from 'react-native';
import { withAlpha } from './colors';

/** Approximate CSS glow with RN shadow props (iOS) + elevation (Android). */
export function neonGlow(color: string, radius = 12): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: radius,
    },
    android: {
      elevation: Math.max(2, Math.round(radius / 3)),
      shadowColor: color,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.55,
      shadowRadius: radius,
    },
  }) as ViewStyle;
}

export function softCardShadow(color: string): ViewStyle {
  return neonGlow(withAlpha(color, 0.35), 8);
}
