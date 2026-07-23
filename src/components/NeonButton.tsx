import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, neonGlow, radii, typography, withAlpha } from '../theme';

type Size = 'small' | 'normal' | 'large';

type Props = {
  label: string;
  color: string;
  onPress?: () => void;
  size?: Size;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
};

const SIZE_MAP = {
  large: { padV: 14, padH: 24, text: typography.buttonLarge },
  normal: { padV: 11, padH: 20, text: typography.buttonNormal },
  small: { padV: 8, padH: 14, text: { ...typography.buttonNormal, fontSize: 12 } },
} as const;

export function NeonButton({
  label,
  color,
  onPress,
  size = 'normal',
  fullWidth = true,
  icon,
  style,
  disabled = false,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = SIZE_MAP[size];

  const animateTo = (to: number) => {
    Animated.timing(scale, {
      toValue: to,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      onPressIn={() => {
        if (!disabled) animateTo(0.95);
      }}
      onPressOut={() => animateTo(1)}
      style={[
        styles.outer,
        fullWidth ? styles.fullWidth : null,
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
        <LinearGradient
          pointerEvents="none"
          colors={[withAlpha(color, 0.8), withAlpha(color, 0.53)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              borderColor: color,
              paddingVertical: cfg.padV,
              paddingHorizontal: cfg.padH,
              ...neonGlow(color, 14),
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <View pointerEvents="none" style={styles.row}>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={cfg.text}>{label}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    minHeight: 44,
    borderRadius: radii.button,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    borderRadius: radii.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 0,
  },
});
