import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Play, Settings, ShoppingBag, Star, Trophy } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { BottomNavigation } from '../components/BottomNavigation';
import { CurrencyChip } from '../components/CurrencyChip';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { NeonIconButton } from '../components/NeonIconButton';
import { NumberRushLogo } from '../components/NumberRushLogo';
import { PerspectiveGrid } from '../components/PerspectiveGrid';
import { getUtcDateKey } from '../game/dailyTournament';
import type { BottomNavRoute, RootStackParamList } from '../navigation/navigationTypes';
import { hasCompletedOfficialDailyAttempt } from '../storage/dailyStorage';
import { colors, fontFamilies, spacing, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

export function MainMenuScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [dailyBadge, setDailyBadge] = useState<'NEW' | 'DONE' | null>(null);

  const refreshBadge = useCallback(async () => {
    const done = await hasCompletedOfficialDailyAttempt(getUtcDateKey());
    setDailyBadge(done ? 'DONE' : 'NEW');
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshBadge();
    }, [refreshBadge]),
  );

  const onBottomNav = (route: BottomNavRoute) => {
    if (route === 'MainMenu') return;
    navigation.navigate(route);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decorLayer, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <View style={styles.menuGlow} />
        <AnimatedNeonBackground intensity="menu" />
        <PerspectiveGrid />
      </View>

      <View style={[styles.topRow, { pointerEvents: 'box-none' }]}>
        <CurrencyChip />
        <NeonIconButton
          accessibilityLabel="Settings"
          onPress={() => navigation.navigate('Settings')}
          color={colors.muted}
        >
          <Settings size={17} color={colors.muted} />
        </NeonIconButton>
      </View>

      <View style={[styles.content, { pointerEvents: 'box-none' }]}>
        <View style={[styles.logoWrap, { pointerEvents: 'none' }]}>
          <NumberRushLogo scale={0.84} />
        </View>

        <View style={[styles.buttons, { pointerEvents: 'box-none' }]}>
          <NeonButton
            label="PLAY"
            color={colors.neonPink}
            size="large"
            icon={<Play size={17} color={colors.white} />}
            onPress={() =>
              navigation.navigate('Gameplay', { mode: 'classic' })
            }
          />
          <View style={styles.buttonWrap}>
            <NeonButton
              label="DAILY TOURNAMENT"
              color={colors.orange}
              size="large"
              icon={<Star size={17} color={colors.white} />}
              onPress={() => navigation.navigate('Tournament')}
            />
            {dailyBadge ? (
              <View
                pointerEvents="none"
                style={[
                  styles.badge,
                  dailyBadge === 'DONE' ? styles.badgeDone : styles.badgeNew,
                ]}
              >
                <Text style={styles.badgeText}>{dailyBadge}</Text>
              </View>
            ) : null}
          </View>
          <NeonButton
            label="RANKED"
            color={colors.electricBlue}
            size="large"
            icon={<Trophy size={17} color={colors.white} />}
            onPress={() => navigation.navigate('Ranked')}
          />
          <NeonButton
            label="SHOP"
            color={colors.purple}
            size="large"
            icon={<ShoppingBag size={17} color={colors.white} />}
            onPress={() => navigation.navigate('Shop')}
          />
        </View>
      </View>

      <BottomNavigation activeRoute="MainMenu" onNavigate={onBottomNav} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  decorLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 10,
    zIndex: 10,
  },
  menuGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: withAlpha(colors.purple, 0.1),
    opacity: 0.85,
  },
  logoWrap: {
    marginTop: 10,
    marginBottom: 26,
    alignItems: 'center',
  },
  buttons: {
    width: '100%',
    gap: spacing.menuButtonGap,
  },
  buttonWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: 10,
    zIndex: 5,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
  },
  badgeNew: {
    backgroundColor: withAlpha(colors.green, 0.25),
    borderColor: colors.green,
  },
  badgeDone: {
    backgroundColor: withAlpha(colors.electricBlue, 0.25),
    borderColor: colors.electricBlue,
  },
  badgeText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: colors.white,
    letterSpacing: 0.8,
  },
});
