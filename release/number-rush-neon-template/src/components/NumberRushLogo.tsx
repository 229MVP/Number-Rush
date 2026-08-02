import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, neonGlow, typography } from '../theme';

type Props = {
  scale?: number;
  style?: ViewStyle;
};

export function NumberRushLogo({ scale = 1, style }: Props) {
  return (
    <View style={[styles.wrap, { transform: [{ scale }] }, style]}>
      <Text style={[typography.logoNumber, styles.number, styles.numberGlow]}>{'NUMBER'}</Text>
      <Text style={[typography.logoRush, styles.rush]}>{'RUSH'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  number: {
    transform: [{ rotate: '-1.5deg' }],
  },
  numberGlow: {
    ...neonGlow(colors.neonPink, 14),
  },
  rush: {
    marginTop: -6,
    transform: [{ rotate: '-1.5deg' }],
    ...neonGlow(colors.electricBlue, 16),
  },
});
