import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User } from 'lucide-react-native';
import { ComingSoonScreen } from './ComingSoonScreen';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  return (
    <ComingSoonScreen
      navigation={navigation}
      config={{
        title: 'PROFILE',
        accent: colors.cyan,
        description: 'Stats, themes, XP progress, and active missions will live here.',
        Icon: User,
      }}
    />
  );
}
