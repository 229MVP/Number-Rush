import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HelpCircle, Snowflake } from 'lucide-react-native';
import type { NumberTileData } from '../../game/gameTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Variant = 'current' | 'next' | 'travel';

type Props = {
  tile: NumberTileData;
  variant?: Variant;
  multiplierSelected?: boolean;
  freezeSelected?: boolean;
  wildValue?: number | null;
  showEffective?: boolean;
  measureRef?: React.Ref<View>;
  onCardLayout?: () => void;
  testID?: string;
};

function NumberTileComponent({
  tile,
  variant = 'current',
  multiplierSelected = false,
  freezeSelected = false,
  wildValue = null,
  showEffective = false,
  measureRef,
  onCardLayout,
  testID,
}: Props) {
  const isCurrent = variant === 'current' || variant === 'travel';
  const displayValue = wildValue != null ? wildValue : tile.value;
  const effective =
    wildValue != null
      ? wildValue
      : multiplierSelected
        ? tile.value * 2
        : tile.value;

  const a11yLabel =
    variant === 'next'
      ? `Next tile, value ${tile.value}`
      : wildValue != null
        ? `Current tile, wild value ${wildValue}`
        : freezeSelected
          ? `Current tile, value ${tile.value}, frozen`
          : multiplierSelected
            ? `Current tile, value ${tile.value}, multiplier active, effective ${effective}`
            : `Current tile, value ${tile.value}`;

  return (
    <View
      testID={testID}
      style={styles.col}
      accessible
      accessibilityLabel={a11yLabel}
    >
      {variant !== 'travel' ? (
        <Text style={styles.label} importantForAccessibility="no">
          {variant === 'current' ? 'CURRENT TILE' : 'NEXT'}
        </Text>
      ) : null}
      <View
        ref={measureRef}
        collapsable={false}
        onLayout={onCardLayout}
        style={[
          isCurrent ? styles.current : styles.next,
          isCurrent
            ? neonGlow(
                freezeSelected
                  ? colors.cyan
                  : wildValue != null
                    ? colors.purple
                    : colors.purple,
                16,
              )
            : neonGlow(colors.electricBlue, 8),
          freezeSelected && isCurrent
            ? { borderColor: colors.cyan, backgroundColor: withAlpha(colors.cyan, 0.22) }
            : null,
        ]}
      >
        {isCurrent ? (
          <>
            <View
              style={[styles.cornerTL, { borderColor: colors.neonPink }]}
              importantForAccessibility="no"
            />
            <View
              style={[styles.cornerBR, { borderColor: colors.neonPink }]}
              importantForAccessibility="no"
            />
          </>
        ) : null}
        <Text
          style={[
            isCurrent ? styles.currentValue : styles.nextValue,
            isCurrent
              ? neonGlow(colors.purple, 10)
              : neonGlow(colors.electricBlue, 5),
          ]}
          importantForAccessibility="no"
        >
          {displayValue}
        </Text>
        {isCurrent && multiplierSelected && wildValue == null ? (
          <View style={[styles.badge, neonGlow(colors.orange, 6)]}>
            <Text style={styles.badgeText}>x2</Text>
          </View>
        ) : null}
        {isCurrent && freezeSelected ? (
          <View style={[styles.frostBadge, neonGlow(colors.cyan, 6)]}>
            <Snowflake size={10} color={colors.cyan} />
            <Text style={styles.frostText}>FROZEN</Text>
          </View>
        ) : null}
        {isCurrent && wildValue != null ? (
          <View style={[styles.wildBadge, neonGlow(colors.purple, 6)]}>
            <HelpCircle size={10} color={colors.white} />
          </View>
        ) : null}
      </View>
      {isCurrent && showEffective && (multiplierSelected || wildValue != null) ? (
        <Text style={styles.effective}>EFFECTIVE: {effective}</Text>
      ) : null}
    </View>
  );
}

export const NumberTile = memo(NumberTileComponent);

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
  frostBadge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    right: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: withAlpha(colors.cyan, 0.85),
    borderRadius: 5,
    paddingVertical: 1,
  },
  frostText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 7,
    color: colors.background,
  },
  wildBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: withAlpha(colors.purple, 0.95),
    borderRadius: 8,
    padding: 2,
  },
  effective: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 10,
    color: colors.orange,
    letterSpacing: 0.5,
  },
});
