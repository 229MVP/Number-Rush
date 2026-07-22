import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, typography, withAlpha } from '../theme';

type Props = {
  coins?: number;
  gems?: number;
  style?: ViewStyle;
};

function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

export function CurrencyChip({ coins = 12450, gems = 350, style }: Props) {
  return (
    <View style={[styles.chip, style]}>
      <Text style={[styles.icon, { color: colors.yellow }]}>⬡</Text>
      <Text style={typography.currency}>{formatCount(coins)}</Text>
      <Text style={[styles.icon, styles.gemIcon, { color: colors.neonPink }]}>◆</Text>
      <Text style={typography.currency}>{formatCount(gems)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.electricBlue, 0.13),
    borderRadius: radii.chip,
  },
  icon: {
    fontSize: 12,
    fontWeight: '700',
  },
  gemIcon: {
    marginLeft: 4,
  },
});
