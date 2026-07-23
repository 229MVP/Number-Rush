import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Star } from 'lucide-react-native';
import { ComingSoonScreen } from './ComingSoonScreen';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Tournament'>;

export function TournamentScreen({ navigation }: Props) {
  return (
    <ComingSoonScreen
      navigation={navigation}
      config={{
        title: 'DAILY TOURNAMENT',
        accent: colors.orange,
        description: 'Compete on today’s shared tile sequence and climb the daily board.',
        Icon: Star,
      }}
    />
  );
}
