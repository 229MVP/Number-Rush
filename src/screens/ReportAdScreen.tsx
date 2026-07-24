import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnimatedNeonBackground } from '../components/AnimatedNeonBackground';
import { GridBackground } from '../components/GridBackground';
import { NeonButton } from '../components/NeonButton';
import { ScreenTopBar } from '../components/ScreenTopBar';
import { useAds } from '../hooks/useAds';
import { useConsent } from '../hooks/useConsent';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportAd'>;

export function ReportAdScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const ads = useAds();
  const consent = useConsent();
  const [copied, setCopied] = useState(false);

  const reportText = useMemo(() => {
    const lines = [
      'Number Rush — Ad report',
      `Generated: ${new Date().toISOString()}`,
      `Consent: ${consent.consentStatus}`,
      `Can request ads: ${consent.canRequestAds}`,
      `Ads available: ${ads.adsAvailable}`,
      `Rewarded load: ${ads.rewardedState}`,
      `Interstitial load: ${ads.interstitialState}`,
      '',
      'Describe what happened (optional, add below before sending):',
      '- Placement:',
      '- What you expected:',
      '- What occurred:',
    ];
    return lines.join('\n');
  }, [ads, consent]);

  const copyReport = () => {
    void (async () => {
      try {
        if (
          Platform.OS === 'web' &&
          typeof navigator !== 'undefined' &&
          navigator.clipboard
        ) {
          await navigator.clipboard.writeText(reportText);
        } else {
          await Share.share({ message: reportText });
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        Alert.alert('Copy failed', 'Select the report text and copy manually.');
      }
    })();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar
        title="REPORT AD"
        accent={colors.orange}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('Settings');
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.hint}>
          Copy this report and send it via Beta Feedback or your support channel.
          Screenshots are not attached automatically.
        </Text>
        <View style={[styles.reportBox, neonGlow(colors.orange, 6)]}>
          <Text selectable style={styles.reportText}>
            {reportText}
          </Text>
        </View>
        <NeonButton
          label={copied ? 'COPIED!' : 'COPY REPORT'}
          color={colors.orange}
          onPress={copyReport}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  scroll: { padding: 16, gap: 14, paddingBottom: 32 },
  hint: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  reportBox: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.35),
    padding: 14,
  },
  reportText: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 12,
    color: colors.white,
    lineHeight: 18,
  },
});
