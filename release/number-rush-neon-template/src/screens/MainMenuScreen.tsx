import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HelpCircle, Play, Settings, TrendingUp } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { NeonIconButton } from '../components/NeonIconButton';
import { NumberRushLogo } from '../components/NumberRushLogo';
import { PerspectiveGrid } from '../components/PerspectiveGrid';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { useOptionalAudio } from '../audio/AudioProvider';
import { useReducedMotionPreference } from '../settings/SettingsProvider';
import { useOptionalGameTheme } from '../themes/GameThemeProvider';
import { colors, spacing, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

export function MainMenuScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const themeCtx = useOptionalGameTheme();
  const audio = useOptionalAudio();
  const reducedMotion = useReducedMotionPreference();

  useFocusEffect(
    useCallback(() => {
      void audio?.playMusic('menu');
    }, [audio]),
  );

  const bg = themeCtx?.themeColors.background ?? colors.background;
  const accent = themeCtx?.themeColors.neonPink ?? colors.neonPink;

  return (
    <View
      style={[styles.root, { paddingTop: insets.top, backgroundColor: bg }]}
      testID="main-menu"
    >
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
        <View style={styles.topSpacer} />
        <NeonIconButton
          testID="menu-settings"
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
            testID="menu-play"
            label="PLAY"
            color={accent}
            size="large"
            icon={<Play size={17} color={colors.white} />}
            onPress={() =>
              navigation.navigate('Gameplay', { mode: 'classic' })
            }
          />
          <NeonButton
            testID="menu-how-to-play"
            label="HOW TO PLAY"
            color={colors.cyan}
            size="large"
            icon={<HelpCircle size={17} color={colors.white} />}
            onPress={() => navigation.navigate('HowToPlay')}
          />
          <NeonButton
            testID="menu-stats"
            label="STATS"
            color={colors.green}
            size="large"
            icon={<TrendingUp size={17} color={colors.white} />}
            onPress={() => navigation.navigate('Stats')}
          />
        </View>
      </View>
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
  topSpacer: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 10,
    justifyContent: 'center',
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
});
