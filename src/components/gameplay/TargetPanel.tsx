import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TARGET_VALUE } from '../../game/gameConstants';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Props = {
  target?: number;
  /** Attached to the TARGET panel card for tutorial measurement. */
  measureRef?: React.Ref<View>;
  onPanelLayout?: () => void;
  testID?: string;
};

export function TargetPanel({
  target = TARGET_VALUE,
  measureRef,
  onPanelLayout,
  testID = 'target-panel',
}: Props) {
  return (
    <View style={styles.wrap} testID={testID}>
      <View
        ref={measureRef}
        collapsable={false}
        onLayout={onPanelLayout}
        style={[styles.panel, neonGlow(colors.electricBlue, 10)]}
      >
        <Text style={styles.label}>TARGET</Text>
        <Text style={[styles.value, neonGlow(colors.electricBlue, 8)]}>{target}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 5,
  },
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderRadius: radii.compact,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: withAlpha(colors.electricBlue, 0.53),
  },
  label: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 2,
  },
  value: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 26,
    color: colors.electricBlue,
    lineHeight: 28,
  },
});
