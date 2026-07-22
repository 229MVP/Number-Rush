import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Target, Trophy, User } from 'lucide-react-native';
import { colors, neonGlow, typography, withAlpha } from '../theme';

export type BottomNavId = 'menu' | 'missions' | 'leaderboard' | 'profile';

type Props = {
  active: BottomNavId;
  onNavigate: (id: BottomNavId) => void;
  style?: ViewStyle;
};

const ITEMS: Array<{
  id: BottomNavId;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}> = [
  { id: 'menu', label: 'HOME', Icon: Home },
  { id: 'missions', label: 'MISSIONS', Icon: Target },
  { id: 'leaderboard', label: 'RANKS', Icon: Trophy },
  { id: 'profile', label: 'PROFILE', Icon: User },
];

export function BottomNavigation({ active, onNavigate, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 2) }, style]}>
      {ITEMS.map(({ id, label, Icon }) => {
        const on = active === id;
        const color = on ? colors.neonPink : colors.muted;
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onNavigate(id)}
            style={styles.item}
          >
            <Icon size={20} color={color} />
            <Text style={[typography.navLabel, { color }]}>{label}</Text>
            {on ? <View style={[styles.indicator, neonGlow(colors.neonPink, 3)]} /> : <View style={styles.indicatorSpacer} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: withAlpha(colors.electricBlue, 0.09),
    backgroundColor: withAlpha(colors.backgroundSecondary, 0.93),
    paddingTop: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
  },
  indicator: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.neonPink,
  },
  indicatorSpacer: {
    width: 18,
    height: 2,
  },
});
