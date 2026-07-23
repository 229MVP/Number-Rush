import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Settings } from 'lucide-react-native';
import { ComingSoonScreen } from './ComingSoonScreen';
import type { RootStackParamList } from '../navigation/navigationTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  return (
    <ComingSoonScreen
      navigation={navigation}
      config={{
        title: 'SETTINGS',
        accent: '#5B7FBF',
        description: 'Audio, haptics, notifications, and account options are on the way.',
        Icon: Settings,
      }}
    />
  );
}
