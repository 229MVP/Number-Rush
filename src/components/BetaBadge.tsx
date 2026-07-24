import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getReleaseChannel,
  shouldShowNonProductionBadge,
} from '../config/releaseChannel';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { colors, fontFamilies, withAlpha } from '../theme';

/**
 * Non-production badge. Hidden in production channel / when remote config disables it.
 */
export function BetaBadge() {
  const insets = useSafeAreaInsets();
  const { config } = useRemoteConfig();
  const channel = getReleaseChannel();
  if (!shouldShowNonProductionBadge(channel)) return null;
  if (!config.beta.betaBadgeEnabled) return null;

  const label =
    channel === 'closed-beta' ? 'CLOSED BETA' : channel === 'preview' ? 'BETA' : 'DEV';

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { top: Math.max(insets.top, 8) }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID="beta-badge"
    >
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 10,
    zIndex: 1000,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: withAlpha(colors.yellow, 0.55),
    backgroundColor: withAlpha(colors.background, 0.72),
  },
  text: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.yellow,
  },
});
