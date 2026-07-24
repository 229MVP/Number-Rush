import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { trackEvent } from '../analytics/analyticsService';
import { getAppVersionLabel } from '../config/releaseChannel';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';
import { Platform } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateRequired'>;

export function UpdateRequiredScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { config } = useRemoteConfig();
  const storeUrl =
    Platform.OS === 'ios' ? config.app.iosStoreUrl : config.app.androidStoreUrl;

  React.useEffect(() => {
    trackEvent('update_required_viewed', { version: getAppVersionLabel() });
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.05} />
        <AnimatedNeonBackground />
      </View>
      <ScreenTopBar title="UPDATE REQUIRED" onBack={() => navigation.navigate('LegalInfo')} />
      <View style={[styles.card, neonGlow(colors.neonPink, 10)]}>
        <Text style={[styles.title, neonGlow(colors.neonPink, 6)]}>NEW VERSION REQUIRED</Text>
        <Text style={styles.body}>{config.app.updateMessage}</Text>
        <Text style={styles.meta}>
          Current {getAppVersionLabel()} · Minimum {config.app.minimumSupportedVersion}
        </Text>
        <NeonButton
          label="OPEN STORE"
          color={colors.cyan}
          onPress={() => {
            if (storeUrl) void Linking.openURL(storeUrl);
          }}
          disabled={!storeUrl}
        />
        <NeonButton
          label="LEGAL"
          color={colors.purple}
          onPress={() => navigation.navigate('LegalInfo')}
        />
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
    borderColor: withAlpha(colors.neonPink, 0.4),
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.orbitronBlack,
    color: colors.neonPink,
    fontSize: 18,
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.white,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  meta: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
