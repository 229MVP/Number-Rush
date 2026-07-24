import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MailCheck } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../../components/AnimatedNeonBackground';
import { GridBackground } from '../../components/GridBackground';
import { NeonButton } from '../../components/NeonButton';
import { ScreenTopBar } from '../../components/ScreenTopBar';
import { maskEmail } from '../../auth/authService';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MagicLinkSent'>;

const ACCENT = colors.cyan;

export function MagicLinkSentScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const email = route.params.email;
  const masked = maskEmail(email);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('SignIn');
  };

  return (
    <View
      style={[styles.root, { paddingTop: insets.top }]}
      testID="screen-magic-link-sent"
    >
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar title="CHECK EMAIL" accent={ACCENT} onBack={goBack} />

      <View style={styles.body}>
        <View style={[styles.iconWrap, neonGlow(ACCENT, 10)]}>
          <MailCheck size={48} color={ACCENT} />
        </View>
        <Text style={[styles.title, neonGlow(ACCENT, 6)]}>MAGIC LINK SENT</Text>
        <Text style={styles.bodyText}>
          We sent a sign-in link to{'\n'}
          <Text style={styles.email}>{masked}</Text>
        </Text>
        <Text style={styles.hint}>
          Open the link on this device to finish signing in. You can close this
          screen and return after tapping the email.
        </Text>
        <NeonButton
          label="BACK TO SIGN IN"
          color={ACCENT}
          size="normal"
          onPress={() => navigation.navigate('SignIn')}
        />
        <NeonButton
          label="CONTINUE AS GUEST"
          color={colors.muted}
          size="small"
          onPress={() => navigation.navigate('MainMenu')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(ACCENT, 0.4),
    backgroundColor: withAlpha(ACCENT, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 22,
    letterSpacing: 2,
    color: ACCENT,
    textAlign: 'center',
  },
  bodyText: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
  email: {
    fontFamily: fontFamilies.orbitronBold,
    color: colors.white,
  },
  hint: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    lineHeight: 19,
    color: withAlpha(colors.muted, 0.85),
    textAlign: 'center',
    marginBottom: 8,
  },
});
