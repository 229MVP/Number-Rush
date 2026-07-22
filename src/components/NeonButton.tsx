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
    <Animated.View style={[{ transform: [{ scale }], width: fullWidth ? '100%' : undefined }, style]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={() => animateTo(0.95)}
        onPressOut={() => animateTo(1)}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <LinearGradient
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
            },
          ]}
        >
          <View style={styles.row}>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={cfg.text}>{label}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radii.button,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.95,
  },
  gradient: {
    borderRadius: radii.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
