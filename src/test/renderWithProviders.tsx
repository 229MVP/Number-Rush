import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, type RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnalyticsProvider } from '../analytics/AnalyticsProvider';
import { AudioProvider } from '../audio/AudioProvider';
import { HapticsProvider } from '../haptics/HapticsProvider';
import { SettingsProvider } from '../settings/SettingsProvider';
import { GameThemeProvider } from '../themes/GameThemeProvider';

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
        <SettingsProvider>
          <AudioProvider>
            <HapticsProvider>
              <GameThemeProvider>
                <AnalyticsProvider>{children}</AnalyticsProvider>
              </GameThemeProvider>
            </HapticsProvider>
          </AudioProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    );
    if (!withNavigation) return body;
    return <NavigationContainer>{body}</NavigationContainer>;
  };

  return render(ui, { wrapper: Wrapper, ...rest });
}
