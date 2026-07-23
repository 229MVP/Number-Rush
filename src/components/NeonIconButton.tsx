import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, withAlpha } from '../theme';

type Props = {
  onPress?: () => void;
  color?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  size?: number;
  accessibilityLabel?: string;
};

export function NeonIconButton({
  onPress,
  color = colors.electricBlue,
  children,
  style,
  size = 44,
  accessibilityLabel,
}: Props) {
  const dim = Math.max(44, size);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          width: dim,
          height: dim,
          borderColor: withAlpha(color, 0.27),
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    minWidth: 44,
    minHeight: 44,
  },
});
