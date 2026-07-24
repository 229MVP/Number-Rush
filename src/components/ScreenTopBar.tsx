import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { NeonIconButton } from './NeonIconButton';
import { colors, fontFamilies, withAlpha } from '../theme';

type Props = {
  title: string;
  onBack?: () => void;
  accent?: string;
  right?: React.ReactNode;
};

export function ScreenTopBar({
  title,
  onBack,
  accent = colors.electricBlue,
  right,
}: Props) {
  return (
    <View style={styles.topBar}>
      {onBack ? (
        <NeonIconButton accessibilityLabel="Back" color={accent} onPress={onBack}>
          <ArrowLeft size={17} color={accent} />
        </NeonIconButton>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text
        style={[styles.topTitle, { textShadowColor: withAlpha(accent, 0.55) }]}
      >
        {title}
      </Text>
      {right ? <View style={styles.right}>{right}</View> : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(colors.electricBlue, 0.09),
    zIndex: 10,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.white,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  spacer: { width: 36 },
  right: {
    minWidth: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
