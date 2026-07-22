import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, withAlpha } from '../theme';

type Props = {
  onPress?: () => void;
  color?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  size?: number;
};

export function NeonIconButton({
  onPress,
  color = colors.electricBlue,
  children,
  style,
  size = 36,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          width: size,
          height: size,
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
  },
});
