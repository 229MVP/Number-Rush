import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSupabaseClient } from '../../backend/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import type { RootStackParamList } from '../../navigation/navigationTypes';
import { colors, fontFamilies } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthCallback'>;

type CallbackState = 'working' | 'success' | 'error';

function parseAuthParams(url: string): {
  code?: string;
  accessToken?: string;
  refreshToken?: string;
} {
  const parsed = Linking.parse(url);
  const query = parsed.queryParams ?? {};
  const code =
    typeof query.code === 'string'
      ? query.code
      : typeof query.token_hash === 'string'
        ? query.token_hash
        : undefined;

  let accessToken =
    typeof query.access_token === 'string' ? query.access_token : undefined;
  let refreshToken =
    typeof query.refresh_token === 'string' ? query.refresh_token : undefined;

  const hashIdx = url.indexOf('#');
  if (hashIdx >= 0) {
    const hash = url.slice(hashIdx + 1);
    hash.split('&').forEach((pair) => {
      const [k, v] = pair.split('=');
      if (!k || !v) return;
      const decoded = decodeURIComponent(v);
      if (k === 'access_token') accessToken = decoded;
      if (k === 'refresh_token') refreshToken = decoded;
    });
  }

  return { code, accessToken, refreshToken };
}

async function completeAuthFromUrl(url: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !url) return false;

  const { code, accessToken, refreshToken } = parseAuthParams(url);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return !error;
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error;
  }

  const { data, error } = await supabase.auth.getSession();
  return !error && data.session != null;
}

export function AuthCallbackScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { refreshSession } = useAuth();
  const [state, setState] = useState<CallbackState>('working');
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    let cancelled = false;

    async function run(initialUrl?: string | null) {
      const url =
        route.params?.url ??
        initialUrl ??
        (await Linking.getInitialURL());

      if (!url) {
        const ok = await completeAuthFromUrl('');
        if (cancelled) return;
        if (ok) {
          await refreshSession();
          setState('success');
          navigation.replace('MainMenu');
          return;
        }
        setState('error');
        setMessage('Missing auth callback URL.');
        return;
      }

      const ok = await completeAuthFromUrl(url);
      if (cancelled) return;
      if (ok) {
        await refreshSession();
        setState('success');
        navigation.replace('MainMenu');
      } else {
        setState('error');
        setMessage('Could not verify your sign-in link. Request a new magic link.');
      }
    }

    void run(route.params?.url);

    const sub = Linking.addEventListener('url', (event) => {
      void run(event.url);
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [navigation, refreshSession, route.params?.url]);

  return (
    <View
      style={[styles.root, { paddingTop: insets.top }]}
      testID="screen-auth-callback"
    >
      {state === 'working' ? (
        <ActivityIndicator size="large" color={colors.neonPink} />
      ) : null}
      <Text style={styles.text}>{message}</Text>
      {state === 'error' ? (
        <Text
          style={styles.link}
          onPress={() => navigation.replace('SignIn')}
        >
          Back to sign in
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  text: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
  },
  link: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 14,
    color: colors.cyan,
  },
});
