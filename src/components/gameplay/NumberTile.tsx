import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NumberTileData } from '../../game/gameTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Variant = 'current' | 'next' | 'travel';

type Props = {
  tile: NumberTileData;
  variant?: Variant;
  multiplierSelected?: boolean;
  showEffective?: boolean;
};

export function NumberTile({
  tile,
  variant = 'current',
  multiplierSelected = false,
  showEffective = false,
}: Props) {
  const isCurrent = variant === 'current' || variant === 'travel';
  const effective = multiplierSelected ? tile.value * 2 : tile.value;

  return (
    <View style={styles.col}>
      {variant !== 'travel' ? (
        <Text style={styles.label}>
          {variant === 'current' ? 'CURRENT TILE' : 'NEXT'}
        </Text>
      ) : null}
      <View
        style={[
          isCurrent ? styles.current : styles.next,
          isCurrent
            ? neonGlow(colors.purple, 16)
            : neonGlow(colors.electricBlue, 8),
        ]}
      >
        {isCurrent ? (
          <>
            <View style={[styles.cornerTL, { borderColor: colors.neonPink, pointerEvents: 'none' }]} />
            <View style={[styles.cornerBR, { borderColor: colors.neonPink, pointerEvents: 'none' }]} />
          </>
        ) : null}
        <Text
          style={[
            isCurrent ? styles.currentValue : styles.nextValue,
            isCurrent
              ? neonGlow(colors.purple, 10)
              : neonGlow(colors.electricBlue, 5),
          ]}
        >
          {tile.value}
        </Text>
        {isCurrent && multiplierSelected ? (
          <View style={[styles.badge, neonGlow(colors.orange, 6)]}>
            <Text style={styles.badgeText}>x2</Text>
          </View>
        ) : null}
      </View>
      {isCurrent && showEffective && multiplierSelected ? (
        <Text style={styles.effective}>EFFECTIVE: {effective}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  col: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.5,
  },
  current: {
    width: 72,
    height: 72,
    borderRadius: radii.tile,
    backgroundColor: withAlpha(colors.purple, 0.33),
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  next: {
    width: 46,
    height: 46,
    borderRadius: radii.compact,
    backgroundColor: withAlpha(colors.electricBlue, 0.16),
    borderWidth: 1.5,
    borderColor: withAlpha(colors.electricBlue, 0.33),
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  currentValue: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 38,
    color: colors.white,
  },
  nextValue: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 22,
    color: colors.electricBlue,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: withAlpha(colors.orange, 0.9),
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 9,
    color: colors.white,
  },
  effective: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.orange,
    letterSpacing: 0.5,
  },
});
