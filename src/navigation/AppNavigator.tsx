import React from 'react';
import * as Linking from 'expo-linking';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { GameplayScreen } from '../screens/GameplayScreen';
import { GameOverScreen } from '../screens/GameOverScreen';
import { TournamentScreen } from '../screens/TournamentScreen';
import { RankedScreen } from '../screens/RankedScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MissionsScreen } from '../screens/MissionsScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PowerUpsScreen } from '../screens/PowerUpsScreen';
import { DailyResultsScreen } from '../screens/DailyResultsScreen';
import { BetaFeedbackScreen } from '../screens/BetaFeedbackScreen';
import { LegalInfoScreen } from '../screens/LegalInfoScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { MagicLinkSentScreen } from '../screens/auth/MagicLinkSentScreen';
import { AccountScreen } from '../screens/auth/AccountScreen';
import { CloudSyncScreen } from '../screens/auth/CloudSyncScreen';
import { AuthCallbackScreen } from '../screens/auth/AuthCallbackScreen';
import { ReportAdScreen } from '../screens/ReportAdScreen';
import { SyncConflictScreen } from '../screens/SyncConflictScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { MaintenanceScreen } from '../screens/MaintenanceScreen';
import { UpdateRequiredScreen } from '../screens/UpdateRequiredScreen';
import { colors } from '../theme';
import type { RootStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.white,
    border: colors.backgroundSecondary,
    primary: colors.neonPink,
  },
};

const linking = {
  prefixes: [Linking.createURL('/'), 'numberrush://'],
  config: {
    screens: {
      AuthCallback: 'auth/callback',
    },
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="Gameplay" component={GameplayScreen} />
        <Stack.Screen name="GameOver" component={GameOverScreen} />
        <Stack.Screen name="DailyResults" component={DailyResultsScreen} />
        <Stack.Screen name="Tournament" component={TournamentScreen} />
        <Stack.Screen name="Ranked" component={RankedScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="PowerUps" component={PowerUpsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ReportAd" component={ReportAdScreen} />
        <Stack.Screen name="BetaFeedback" component={BetaFeedbackScreen} />
        <Stack.Screen name="LegalInfo" component={LegalInfoScreen} />
        <Stack.Screen name="Missions" component={MissionsScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="MagicLinkSent" component={MagicLinkSentScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="CloudSync" component={CloudSyncScreen} />
        <Stack.Screen name="SyncConflict" component={SyncConflictScreen} />
        <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="News" component={NewsScreen} />
        <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
        <Stack.Screen name="UpdateRequired" component={UpdateRequiredScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
