import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text } from 'react-native';
import { SCORE_POPUP_DURATION } from '../../game/gameConstants';
import type { FloatingPopup as FloatingPopupModel } from '../../game/gameTypes';
import { colors, fontFamilies, neonGlow } from '../../theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type Props = {
  popup: FloatingPopupModel;
  /** Approximate horizontal center of the lane as a percentage of screen width. */
  xPercent: number;
};

export function FloatingScorePopup({ popup, xPercent }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: SCORE_POPUP_DURATION,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -56],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 0.75, 1],
    outputRange: [0, 1, 0.85, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.9, 1.1, 0.95],
  });

  const color =
    popup.kind === 'bust'
      ? colors.red
      : popup.kind === 'perfect'
        ? colors.orange
        : colors.yellow;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          left: `${xPercent}%`,
          opacity,
          transform: [{ translateY }, { scale }, { translateX: -40 }],
          pointerEvents: 'none',
        },
      ]}
    >
      <Text style={[styles.text, { color }, neonGlow(color, 6)]}>{popup.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '36%',
    zIndex: 50,
    width: 80,
    alignItems: 'center',
  },
  text: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
