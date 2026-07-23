import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Target } from 'lucide-react-native';
import { ComingSoonScreen } from './ComingSoonScreen';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Missions'>;

export function MissionsScreen({ navigation }: Props) {
  return (
    <ComingSoonScreen
      navigation={navigation}
      config={{
        title: 'MISSIONS',
        accent: colors.neonPink,
        description: 'Daily and weekly challenges with coin and gem rewards.',
        Icon: Target,
      }}
    />
  );
}
