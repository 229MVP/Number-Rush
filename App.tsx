import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Orbitron_400Regular,
  Orbitron_500Medium,
  Orbitron_600SemiBold,
  Orbitron_700Bold,
  Orbitron_800ExtraBold,
  Orbitron_900Black,
} from '@expo-google-fonts/orbitron';
import {
  Rajdhani_400Regular,
  Rajdhani_500Medium,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AnalyticsProvider } from './src/analytics/AnalyticsProvider';
import { AuthProvider } from './src/auth/AuthProvider';
import { AdsProvider } from './src/ads/AdsProvider';
import { ConsentProvider } from './src/consent/ConsentProvider';
import { PurchasesProvider } from './src/purchases/PurchasesProvider';
import { BetaBadge } from './src/components/BetaBadge';
import { validateEnvironment } from './src/config/validateEnvironment';
import { AppErrorBoundary } from './src/errors/AppErrorBoundary';
import { logger } from './src/logging/logger';
import { NetworkProvider } from './src/network/NetworkProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SettingsProvider } from './src/settings/SettingsProvider';
import { AudioProvider } from './src/audio/AudioProvider';
import { HapticsProvider } from './src/haptics/HapticsProvider';
import { GameThemeProvider } from './src/themes/GameThemeProvider';
import { CloudSyncProvider } from './src/sync/CloudSyncProvider';
import { SubmissionProvider } from './src/submissions/SubmissionProvider';
import { colors, fontFamilies } from './src/theme';

/** Optional init must not block startup forever. */
const FONT_FALLBACK_MS = 8_000;

export default function App() {
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_500Medium,
    Orbitron_600SemiBold,
    Orbitron_700Bold,
    Orbitron_800ExtraBold,
    Orbitron_900Black,
    Rajdhani_400Regular,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [fontTimedOut, setFontTimedOut] = useState(false);
  const navKey = useRef(0);
  const [boundaryKey, setBoundaryKey] = useState(0);

  useEffect(() => {
    const result = validateEnvironment();
    if (!result.ok) {
      logger.warn('Environment validation issues', {
        errors: result.errors,
        warnings: result.warnings,
      });
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) return;
    const t = setTimeout(() => {
      setFontTimedOut(true);
      logger.warn('Font load timed out; continuing with fallback fonts');
    }, FONT_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [fontsLoaded]);

  if (!fontsLoaded && !fontTimedOut) {
    return (
      <View style={styles.loading} testID="app-loading">
        <StatusBar style="light" />
        <Text style={styles.loadingBrand}>NUMBER RUSH</Text>
        <ActivityIndicator size="large" color={colors.neonPink} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary
        key={boundaryKey}
        onReset={() => setBoundaryKey((k) => k + 1)}
        onReturnHome={() => {
          navKey.current += 1;
          setBoundaryKey((k) => k + 1);
        }}
      >
        <NetworkProvider>
          <AuthProvider>
            <ConsentProvider>
              <AdsProvider>
                <PurchasesProvider>
                  <SettingsProvider>
                    <AudioProvider>
                      <HapticsProvider>
                        <GameThemeProvider>
                          <CloudSyncProvider>
                            <SubmissionProvider>
                              <AnalyticsProvider>
                                <StatusBar style="light" />
                                <AppNavigator key={navKey.current} />
                                <BetaBadge />
                              </AnalyticsProvider>
                            </SubmissionProvider>
                          </CloudSyncProvider>
                        </GameThemeProvider>
                      </HapticsProvider>
                    </AudioProvider>
                  </SettingsProvider>
                </PurchasesProvider>
              </AdsProvider>
            </ConsentProvider>
          </AuthProvider>
        </NetworkProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingBrand: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 22,
    letterSpacing: 2,
    color: colors.neonPink,
  },
});
