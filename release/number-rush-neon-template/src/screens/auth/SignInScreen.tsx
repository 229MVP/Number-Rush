import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { AnimatedNeonBackground } from '../../components/AnimatedNeonBackground';
import { GridBackground } from '../../components/GridBackground';
import { NeonButton } from '../../components/NeonButton';
import { ScreenTopBar } from '../../components/ScreenTopBar';
import { useAuth } from '../../hooks/useAuth';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

const ACCENT = colors.neonPink;

export function SignInScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signInWithMagicLink, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainMenu');
  };

  const handleSendLink = async () => {
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      const redirectTo = Linking.createURL('auth/callback');
      const result = await signInWithMagicLink(email, redirectTo);
      if (!result.ok) {
        const msg =
          result.error === 'invalid_email'
            ? 'Enter a valid email address.'
            : result.error === 'supabase_not_configured'
              ? 'Sign-in is unavailable offline.'
              : result.error;
        setError(msg);
        return;
      }
      navigation.replace('MagicLinkSent', { email: email.trim().toLowerCase() });
    } finally {
      setSending(false);
    }
  };

  const handleGuest = async () => {
    await continueAsGuest();
    navigation.navigate('MainMenu');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="screen-sign-in">
      <View style={[styles.decor, { pointerEvents: 'none' }]}>
        <GridBackground opacity={0.04} />
        <AnimatedNeonBackground intensity="menu" />
      </View>

      <ScreenTopBar title="SIGN IN" accent={ACCENT} onBack={goBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.hero, neonGlow(ACCENT, 6)]}>NUMBER RUSH</Text>
          <Text style={styles.subtitle}>
            Save progress across devices with a magic link — no password required.
          </Text>

          <View style={[styles.fieldWrap, neonGlow(ACCENT, 4)]}>
            <Mail size={18} color={withAlpha(ACCENT, 0.7)} />
            <TextInput
              testID="sign-in-email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={withAlpha(colors.muted, 0.55)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <NeonButton
            testID="sign-in-send-link"
            label={sending ? 'SENDING…' : 'SEND MAGIC LINK'}
            color={ACCENT}
            size="large"
            disabled={sending || !email.trim()}
            onPress={() => void handleSendLink()}
          />

          <NeonButton
            testID="sign-in-guest"
            label="CONTINUE AS GUEST"
            color={colors.electricBlue}
            size="normal"
            onPress={() => void handleGuest()}
          />

          <View style={styles.legalRow}>
            <Pressable
              onPress={() => navigation.navigate('LegalInfo', { section: 'privacy' })}
              hitSlop={8}
            >
              <Text style={styles.legalLink}>Privacy</Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable
              onPress={() => navigation.navigate('LegalInfo', { section: 'terms' })}
              hitSlop={8}
            >
              <Text style={styles.legalLink}>Terms</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  decor: { ...StyleSheet.absoluteFill },
  flex: { flex: 1 },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  hero: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 26,
    letterSpacing: 3,
    color: ACCENT,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: withAlpha(ACCENT, 0.35),
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 16,
    color: colors.white,
    paddingVertical: 12,
  },
  error: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 13,
    color: colors.red,
    textAlign: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  legalLink: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: colors.cyan,
  },
  legalDot: {
    fontFamily: fontFamilies.rajdhaniBold,
    color: colors.muted,
  },
});
