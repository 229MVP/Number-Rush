import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Play, Settings, ShoppingBag, Star, Trophy } from 'lucide-react-native';
import { BottomNavigation, BottomNavId } from '../components/BottomNavigation';
import { CurrencyChip } from '../components/CurrencyChip';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { NeonIconButton } from '../components/NeonIconButton';
import { NumberRushLogo } from '../components/NumberRushLogo';
import { PerspectiveGrid } from '../components/PerspectiveGrid';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, spacing, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

function comingSoon(label: string) {
  Alert.alert(label, 'Coming soon.');
}

export function MainMenuScreen(_props: Props) {
  const insets = useSafeAreaInsets();

  const onBottomNav = (id: BottomNavId) => {
    if (id === 'menu') return;
    const labels: Record<BottomNavId, string> = {
      menu: 'Home',
      missions: 'Missions',
      leaderboard: 'Ranks',
      profile: 'Profile',
    };
    comingSoon(labels[id]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <CurrencyChip />
        <NeonIconButton onPress={() => comingSoon('Settings')} color={colors.muted}>
          <Settings size={17} color={colors.muted} />
        </NeonIconButton>
      </View>

      <View style={styles.content}>
        <GridBackground opacity={0.05} />
        <View style={styles.menuGlow} pointerEvents="none" />
        <PerspectiveGrid />

        <View style={styles.logoWrap}>
          <NumberRushLogo scale={0.84} />
        </View>

        <View style={styles.buttons}>
          <NeonButton
            label="PLAY"
            color={colors.neonPink}
            size="large"
            icon={<Play size={17} color={colors.white} />}
            onPress={() => comingSoon('Play')}
          />
          <NeonButton
            label="DAILY TOURNAMENT"
            color={colors.orange}
            size="large"
            icon={<Star size={17} color={colors.white} />}
            onPress={() => comingSoon('Daily Tournament')}
          />
          <NeonButton
            label="RANKED"
            color={colors.electricBlue}
            size="large"
            icon={<Trophy size={17} color={colors.white} />}
            onPress={() => comingSoon('Ranked')}
          />
          <NeonButton
            label="SHOP"
            color={colors.purple}
            size="large"
            icon={<ShoppingBag size={17} color={colors.white} />}
            onPress={() => comingSoon('Shop')}
          />
        </View>
      </View>

      <BottomNavigation active="menu" onNavigate={onBottomNav} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 10,
    overflow: 'hidden',
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
    zIndex: 1,
  },
  buttons: {
    width: '100%',
    gap: spacing.menuButtonGap,
    zIndex: 1,
  },
});
