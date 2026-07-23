import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { ArrowLeft, LucideIcon } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { NeonIconButton } from '../components/NeonIconButton';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, spacing, withAlpha } from '../theme';

export type ComingSoonConfig = {
  title: string;
  accent: string;
  description: string;
  Icon: LucideIcon;
};

type Props = {
  navigation: NavigationProp<RootStackParamList>;
  config: ComingSoonConfig;
};

export function ComingSoonScreen({ navigation, config }: Props) {
  const insets = useSafeAreaInsets();
  const { title, accent, description, Icon } = config;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decorLayer, { pointerEvents: 'none' as const }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <View style={styles.topBar}>
        <NeonIconButton
          accessibilityLabel="Back"
          color={accent}
          onPress={() => navigation.navigate('MainMenu')}
        >
          <ArrowLeft size={17} color={accent} />
        </NeonIconButton>
        <Text style={[styles.topTitle, { textShadowColor: withAlpha(accent, 0.55) }]}>
          {title}
        </Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.body}>
        <View style={[styles.iconWrap, { borderColor: withAlpha(accent, 0.45), backgroundColor: withAlpha(accent, 0.12) }, neonGlow(accent, 10)]}>
          <Icon size={42} color={accent} />
        </View>
        <Text style={[styles.coming, { color: accent }, neonGlow(accent, 8)]}>COMING SOON</Text>
        <Text style={styles.desc}>{description}</Text>
        <NeonButton
          label="BACK TO MENU"
          color={accent}
          size="large"
          onPress={() => navigation.navigate('MainMenu')}
          style={styles.cta}
        />
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
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(colors.electricBlue, 0.09),
    zIndex: 5,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.white,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  spacer: {
    width: 44,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 5,
    gap: 14,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radii.card,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  coming: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 28,
    letterSpacing: 2,
    textAlign: 'center',
  },
  desc: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  cta: {
    marginTop: 18,
    width: '100%',
    maxWidth: 320,
  },
});
