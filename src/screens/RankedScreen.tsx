import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Trophy } from 'lucide-react-native';
import { ComingSoonScreen } from './ComingSoonScreen';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranked'>;

export function RankedScreen({ navigation }: Props) {
  return (
    <ComingSoonScreen
      navigation={navigation}
      config={{
        title: 'RANKED',
        accent: colors.electricBlue,
        description: 'Climb divisions from Bronze to Blaze with season points.',
        Icon: Trophy,
      }}
    />
  );
}
