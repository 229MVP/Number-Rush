import React from 'react';
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
import { CompetitiveResultsScreen } from '../screens/CompetitiveResultsScreen';
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

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
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
        <Stack.Screen
          name="CompetitiveResults"
          component={CompetitiveResultsScreen}
        />
        <Stack.Screen name="Tournament" component={TournamentScreen} />
        <Stack.Screen name="Ranked" component={RankedScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Missions" component={MissionsScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
