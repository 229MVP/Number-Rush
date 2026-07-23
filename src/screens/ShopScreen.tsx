import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShoppingBag } from 'lucide-react-native';
import { ComingSoonScreen } from './ComingSoonScreen';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;

export function ShopScreen({ navigation }: Props) {
  return (
    <ComingSoonScreen
      navigation={navigation}
      config={{
        title: 'SHOP',
        accent: colors.purple,
        description: 'Power-ups, themes, coins, and gems will land here soon.',
        Icon: ShoppingBag,
      }}
    />
  );
}
