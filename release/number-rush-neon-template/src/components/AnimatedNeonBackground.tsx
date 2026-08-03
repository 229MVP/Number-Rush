import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, withAlpha } from '../theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type Props = {
  /** denser motion for splash; quieter for menu */
  intensity?: 'splash' | 'menu';
  /** When true, render a calm static ambience with no shooting stars. */
  reducedMotion?: boolean;
};

type StarConfig = {
  left: number;
  top: number;
  color: string;
  duration: number;
  delay: number;
  travelX: number;
  travelY: number;
  rotate: string;
  length: number;
};

type DotConfig = {
  left: number;
  top: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
};

const STAR_COLORS = [
  colors.neonPink,
  colors.electricBlue,
  colors.cyan,
  colors.purple,
  colors.orange,
];

function makeStars(count: number, width: number, height: number): StarConfig[] {
  return Array.from({ length: count }).map((_, i) => ({
    left: (width * ((i * 17 + 11) % 80)) / 100 + 20,
    top: (height * ((i * 23 + 7) % 55)) / 100 + 20,
    color: STAR_COLORS[i % STAR_COLORS.length],
    duration: 2200 + (i % 5) * 550,
    delay: i * 420,
    travelX: 35 + (i % 4) * 12,
    travelY: 90 + (i % 5) * 18,
    rotate: `${18 + (i % 5) * 8}deg`,
    length: 28 + (i % 4) * 10,
  }));
}

function makeDots(count: number, width: number, height: number): DotConfig[] {
  const palette = [colors.neonPink, colors.electricBlue, colors.cyan, colors.purple, colors.yellow, colors.green];
  return Array.from({ length: count }).map((_, i) => ({
    left: (width * ((i * 13 + 5) % 92)) / 100,
    top: (height * ((i * 19 + 9) % 88)) / 100,
    color: palette[i % palette.length],
    size: i % 3 === 0 ? 3.5 : 2,
    duration: 3200 + (i % 6) * 700,
    delay: i * 180,
    driftX: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 3),
    driftY: (i % 2 === 0 ? -1 : 1) * (10 + (i % 5) * 4),
  }));
}

function ShootingStar({ config }: { config: StarConfig }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(900 + (config.delay % 700)),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [config, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, config.travelX],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, config.travelY],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 0.55, 1],
    outputRange: [0, 0.55, 0.35, 0],
  });

  return (
    <Animated.View
      style={[
        styles.star,
        { pointerEvents: 'none' },
        {
          left: config.left,
          top: config.top,
          width: config.length,
          backgroundColor: config.color,
          opacity,
          transform: [{ translateX }, { translateY }, { rotate: config.rotate }],
        },
      ]}
    />
  );
}

function FloatingDot({ config }: { config: DotConfig }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [config, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, config.driftX],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, config.driftY],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.75, 0.25],
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { pointerEvents: 'none' },
        {
          left: config.left,
          top: config.top,
          width: config.size,
          height: config.size,
          borderRadius: config.size,
          backgroundColor: config.color,
          opacity,
          transform: [{ translateX }, { translateY }],
          shadowColor: config.color,
        },
      ]}
    />
  );
}

/**
 * Decorative neon ambience. Never intercepts touches.
 */
export function AnimatedNeonBackground({
  intensity = 'splash',
  reducedMotion = false,
}: Props) {
  const { width, height } = useWindowDimensions();
  const starCount = reducedMotion ? 0 : intensity === 'splash' ? 5 : 3;
  const dotCount = reducedMotion ? 0 : intensity === 'splash' ? 8 : 5;

  const stars = useMemo(
    () => makeStars(starCount, width, height),
    [starCount, width, height],
  );
  const dots = useMemo(
    () => makeDots(dotCount, width, height),
    [dotCount, width, height],
  );

  const ambience = useRef(new Animated.Value(reducedMotion ? 0.5 : 0)).current;
  useEffect(() => {
    if (reducedMotion) {
      ambience.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ambience, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(ambience, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [ambience, reducedMotion]);

  const glowOpacity = ambience.interpolate({
    inputRange: [0, 1],
    outputRange: intensity === 'splash' ? [0.1, 0.22] : [0.06, 0.14],
  });

  return (
    <View
      style={[styles.fill, { pointerEvents: 'none' }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <Animated.View
        style={[
          styles.ambience,
          { pointerEvents: 'none' },
          {
            opacity: glowOpacity,
            backgroundColor: withAlpha(colors.purple, intensity === 'splash' ? 0.28 : 0.18),
          },
        ]}
      />
      {dots.map((d, i) => (
        <FloatingDot key={`dot-${i}`} config={d} />
      ))}
      {stars.map((s, i) => (
        <ShootingStar key={`star-${i}`} config={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  ambience: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '16%',
    height: '42%',
    borderRadius: 999,
  },
  star: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 2,
  },
  dot: {
    position: 'absolute',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
