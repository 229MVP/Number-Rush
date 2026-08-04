import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { trackEvent } from '../analytics/analyticsService';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Maintenance'>;

export function MaintenanceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { config, refresh } = useRemoteConfig();
  const allowClassic = config.app.allowOfflineClassicDuringMaintenance;

  React.useEffect(() => {
    trackEvent('maintenance_screen_viewed');
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground />
      </View>
      <ScreenTopBar title="MAINTENANCE" onBack={() => navigation.navigate('LegalInfo')} />
      <View style={[styles.card, neonGlow(colors.orange, 10)]}>
        <Text style={[styles.title, neonGlow(colors.orange, 6)]}>WE&apos;LL BE RIGHT BACK</Text>
        <Text style={styles.body}>{config.app.maintenanceMessage}</Text>
        {config.app.estimatedReturnAt ? (
          <Text style={styles.meta}>Estimated return: {config.app.estimatedReturnAt}</Text>
        ) : null}
        <NeonButton
          label="RETRY"
          color={colors.cyan}
          onPress={() => {
            void refresh(true);
          }}
        />
        {allowClassic ? (
          <NeonButton
            label="PLAY CLASSIC OFFLINE"
            color={colors.purple}
            onPress={() => navigation.navigate('Gameplay', { mode: 'classic' })}
          />
        ) : null}
        <Pressable onPress={() => navigation.navigate('LegalInfo', { section: 'privacy' })}>
          <Text style={styles.link}>Legal / Privacy</Text>
        </Pressable>
        {config.app.supportUrl ? (
          <Text style={styles.meta}>Support: {config.app.supportUrl}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
  decor: { ...StyleSheet.absoluteFill },
  card: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: radii.modal,
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.4),
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.orbitronBlack,
    color: colors.orange,
    fontSize: 18,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  meta: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  link: {
    fontFamily: fontFamilies.orbitronBold,
    color: colors.cyan,
    textAlign: 'center',
    marginTop: 8,
  },
});
