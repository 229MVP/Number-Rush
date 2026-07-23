import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Trophy } from 'lucide-react-native';
import { ComingSoonScreen } from './ComingSoonScreen';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

export function LeaderboardScreen({ navigation }: Props) {
  return (
    <ComingSoonScreen
      navigation={navigation}
      config={{
        title: 'RANKS',
        accent: colors.yellow,
        description: 'Daily, weekly, global, and friends leaderboards are coming soon.',
        Icon: Trophy,
      }}
    />
  );
}
