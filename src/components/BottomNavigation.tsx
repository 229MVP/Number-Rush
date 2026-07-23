import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Target, Trophy, User } from 'lucide-react-native';
import type { BottomNavRoute } from '../navigation/navigationTypes';
import { colors, neonGlow, typography, withAlpha } from '../theme';

type Props = {
  activeRoute: BottomNavRoute;
  onNavigate: (route: BottomNavRoute) => void;
  style?: ViewStyle;
};

const ITEMS: Array<{
  route: BottomNavRoute;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}> = [
  { route: 'MainMenu', label: 'HOME', Icon: Home },
  { route: 'Missions', label: 'MISSIONS', Icon: Target },
  { route: 'Leaderboard', label: 'RANKS', Icon: Trophy },
  { route: 'Profile', label: 'PROFILE', Icon: User },
];

export function BottomNavigation({ activeRoute, onNavigate, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, 6), pointerEvents: 'box-none' },
        style,
      ]}
    >
      {ITEMS.map(({ route, label, Icon }) => {
        const on = activeRoute === route;
        const color = on ? colors.neonPink : colors.muted;
        return (
          <Pressable
            key={route}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            hitSlop={6}
            onPress={() => onNavigate(route)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={[styles.itemInner, { pointerEvents: 'none' }]}>
              <Icon size={20} color={color} />
              <Text style={[typography.navLabel, { color }]}>{label}</Text>
              {on ? (
                <View style={[styles.indicator, neonGlow(colors.neonPink, 3)]} />
              ) : (
                <View style={styles.indicatorSpacer} />
              )}
            </View>
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
    zIndex: 20,
    elevation: 20,
  },
  item: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  itemPressed: {
    opacity: 0.75,
  },
  itemInner: {
    alignItems: 'center',
    gap: 3,
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
