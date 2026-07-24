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
import { countClaimableMissions } from '../storage/missionStorage';
import { getPlayerProfile } from '../storage/playerStorage';
import { useOptionalAudio } from '../audio/AudioProvider';
import { useReducedMotionPreference } from '../settings/SettingsProvider';
import { useOptionalGameTheme } from '../themes/GameThemeProvider';
import { colors, fontFamilies, spacing, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

export function MainMenuScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const themeCtx = useOptionalGameTheme();
  const audio = useOptionalAudio();
  const reducedMotion = useReducedMotionPreference();
  const refreshThemes = themeCtx?.refreshThemes;
  const [dailyBadge, setDailyBadge] = useState<'NEW' | 'DONE' | null>(null);
  const [coins, setCoins] = useState(500);
  const [gems, setGems] = useState(25);
  const [level, setLevel] = useState(1);
  const [claimable, setClaimable] = useState(0);

  const refresh = useCallback(async () => {
    const [done, profile, claimCount] = await Promise.all([
      hasCompletedOfficialDailyAttempt(getUtcDateKey()),
      getPlayerProfile(),
      countClaimableMissions(),
    ]);
    setDailyBadge(done ? 'DONE' : 'NEW');
    setCoins(profile.coins);
    setGems(profile.gems);
    setLevel(profile.level);
    setClaimable(claimCount);
    await refreshThemes?.();
  }, [refreshThemes]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void audio?.playMusic('menu');
    }, [refresh, audio]),
  );

  const onBottomNav = (route: BottomNavRoute) => {
    if (route === 'MainMenu') return;
    navigation.navigate(route);
  };

  const bg = themeCtx?.themeColors.background ?? colors.background;
  const accent = themeCtx?.themeColors.neonPink ?? colors.neonPink;

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: bg }]}>
      <View
        style={[styles.decorLayer, { pointerEvents: 'none' }]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <GridBackground opacity={0.05} />
        <View
          style={[
            styles.menuGlow,
            { backgroundColor: withAlpha(themeCtx?.themeColors.purple ?? colors.purple, 0.1) },
          ]}
        />
        <AnimatedNeonBackground intensity="menu" reducedMotion={reducedMotion} />
        <PerspectiveGrid />
      </View>

      <View style={[styles.topRow, { pointerEvents: 'box-none' }]}>
        <View style={styles.topLeft}>
          <CurrencyChip coins={coins} gems={gems} />
          <View
            pointerEvents="none"
            style={[styles.levelChip, { borderColor: withAlpha(accent, 0.45) }]}
          >
            <Text style={[styles.levelText, { color: accent }]}>LV {level}</Text>
          </View>
        </View>
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
            color={accent}
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

      <BottomNavigation
        activeRoute="MainMenu"
        onNavigate={onBottomNav}
        missionsBadgeCount={claimable}
      />
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
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.card,
  },
  levelText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 10,
    letterSpacing: 0.5,
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
