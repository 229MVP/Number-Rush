import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Shuffle, Zap } from 'lucide-react-native';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type MultiProps = {
  quantity: number;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** Competitive modes: show disabled tournament copy. */
  lockedReason?: string | null;
};

export function MultiplierPowerUpButton({
  quantity,
  selected,
  onPress,
  disabled = false,
  lockedReason = null,
}: MultiProps) {
  const locked = lockedReason != null;
  const unavailable = locked || quantity <= 0 || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Multiplier"
      disabled={unavailable && !selected}
      onPress={onPress}
      style={[
        styles.btn,
        {
          backgroundColor: withAlpha(colors.orange, selected ? 0.2 : 0.1),
          borderColor: selected ? colors.orange : withAlpha(colors.orange, 0.35),
          opacity: unavailable && !selected ? 0.45 : 1,
        },
        selected ? neonGlow(colors.orange, 10) : null,
      ]}
    >
      <Text
        style={[
          styles.x,
          { color: selected ? colors.yellow : colors.orange },
        ]}
      >
        x2
      </Text>
      <View>
        <Text style={[styles.title, { color: colors.orange }]}>MULTI</Text>
        <Text style={styles.sub}>
          {locked ? lockedReason : `×${quantity} left`}
        </Text>
      </View>
      <Zap size={13} color={selected ? colors.yellow : colors.orange} />
    </Pressable>
  );
}

type SwapProps = {
  quantity: number;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
  lockedReason?: string | null;
};

export function SwapPowerUpButton({
  quantity,
  active,
  onPress,
  disabled = false,
  lockedReason = null,
}: SwapProps) {
  const locked = lockedReason != null;
  const unavailable = locked || quantity <= 0 || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Swap"
      disabled={unavailable && !active}
      onPress={onPress}
      style={[
        styles.btn,
        {
          backgroundColor: withAlpha(colors.electricBlue, active ? 0.22 : 0.1),
          borderColor: active
            ? colors.electricBlue
            : withAlpha(colors.electricBlue, 0.35),
          opacity: unavailable && !active ? 0.45 : 1,
        },
        active ? neonGlow(colors.electricBlue, 10) : null,
      ]}
    >
      <Shuffle size={15} color={colors.electricBlue} />
      <View>
        <Text style={[styles.title, { color: colors.electricBlue }]}>SWAP</Text>
        <Text style={styles.sub}>
          {locked ? lockedReason : `×${quantity} left`}
        </Text>
      </View>
    </Pressable>
  );
}

/** Combined export used by GameplayScreen power-up row. */
export function PowerUpButton(
  props:
    | (MultiProps & { kind: 'multi' })
    | (SwapProps & { kind: 'swap' }),
) {
  if (props.kind === 'multi') {
    const { kind: _kind, ...rest } = props;
    return <MultiplierPowerUpButton {...rest} />;
  }
  const { kind: _kind, ...rest } = props;
  return <SwapPowerUpButton {...rest} />;
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: radii.compact,
    borderWidth: 1.5,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  x: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 14,
  },
  title: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
  },
  sub: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 9,
    color: colors.muted,
  },
});
