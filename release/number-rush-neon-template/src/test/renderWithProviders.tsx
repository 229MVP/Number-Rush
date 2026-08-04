import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, type RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnalyticsProvider } from '../analytics/AnalyticsProvider';
import { AuthProvider } from '../auth/AuthProvider';
import { AudioProvider } from '../audio/AudioProvider';
import { HapticsProvider } from '../haptics/HapticsProvider';
import { NetworkProvider } from '../network/NetworkProvider';
import { SettingsProvider } from '../settings/SettingsProvider';
import { GameThemeProvider } from '../themes/GameThemeProvider';
import { CloudSyncProvider } from '../sync/CloudSyncProvider';

type Options = RenderOptions & {
  withNavigation?: boolean;
};

export async function renderWithProviders(
  ui: React.ReactElement,
  options: Options = {},
) {
  const { withNavigation = true, ...rest } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const body = (
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <SettingsProvider>
              <AudioProvider>
                <HapticsProvider>
                  <GameThemeProvider>
                    <CloudSyncProvider>
                      <AnalyticsProvider>{children}</AnalyticsProvider>
                    </CloudSyncProvider>
                  </GameThemeProvider>
                </HapticsProvider>
              </AudioProvider>
            </SettingsProvider>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    );
    if (!withNavigation) return body;
    return <NavigationContainer>{body}</NavigationContainer>;
  };

  return render(ui, { wrapper: Wrapper, ...rest });
}
