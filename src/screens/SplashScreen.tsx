import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Zap } from 'lucide-react-native';
import { GridBackground } from '../components/GridBackground';
import { NumberRushLogo } from '../components/NumberRushLogo';
import { PerspectiveGrid } from '../components/PerspectiveGrid';
import type { RootStackParamList } from '../navigation/navigationTypes';
import { colors, neonGlow, typography, withAlpha } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const DOTS = [
  { x: 0.12, y: 0.18, c: colors.neonPink, sz: 4 },
  { x: 0.84, y: 0.16, c: colors.electricBlue, sz: 2 },
  { x: 0.06, y: 0.5, c: colors.purple, sz: 2 },
  { x: 0.92, y: 0.46, c: colors.cyan, sz: 4 },
  { x: 0.22, y: 0.75, c: colors.orange, sz: 2 },
  { x: 0.78, y: 0.72, c: colors.neonPink, sz: 2 },
  { x: 0.5, y: 0.1, c: colors.yellow, sz: 4 },
  { x: 0.38, y: 0.82, c: colors.electricBlue, sz: 2 },
  { x: 0.65, y: 0.3, c: colors.green, sz: 2 },
] as const;

export function SplashScreen({ navigation }: Props) {
  const navigating = useRef(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.25, duration: 375, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 375, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const start = () => {
    if (navigating.current) return;
    navigating.current = true;
    navigation.replace('MainMenu');
  };

  return (
    <Pressable style={styles.root} onPress={start} accessibilityRole="button" accessibilityLabel="Tap to start">
      <View style={styles.glowBlob} />
      <GridBackground opacity={0.05} />
      <PerspectiveGrid />

      {DOTS.map((d, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.dot,
            {
              left: `${d.x * 100}%`,
              top: `${d.y * 100}%`,
              width: d.sz,
              height: d.sz,
              borderRadius: d.sz,
              backgroundColor: d.c,
              ...neonGlow(d.c, 6),
            },
          ]}
        />
      ))}

      {Array.from({ length: 7 }).map((_, i) => (
        <LinearGradient
          key={`spark-${i}`}
          colors={[i % 2 === 0 ? colors.neonPink : colors.cyan, 'transparent']}
          style={[
            styles.spark,
            {
              left: `${8 + i * 13}%`,
              top: `${28 + (i % 4) * 8}%`,
              height: 10 + (i % 3) * 7,
              transform: [{ rotate: `${-25 + i * 8}deg` }],
            },
          ]}
          pointerEvents="none"
        />
      ))}

      <View style={styles.center}>
        <View style={styles.zapWrap}>
          <Zap size={30} color={colors.yellow} />
        </View>
        <NumberRushLogo />
        <Text style={[typography.splashSubtitle, styles.subtitle]}>
          PLACE. STACK. HIT THE TARGET.
        </Text>
      </View>

      <LinearGradient
        colors={['transparent', withAlpha(colors.neonPink, 0.53), withAlpha(colors.electricBlue, 0.53), 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.platform, neonGlow(colors.neonPink, 8)]}
        pointerEvents="none"
      />

      <Animated.Text style={[typography.tapToStart, styles.tap, { opacity: pulse }, neonGlow(colors.neonPink, 5)]}>
        TAP TO START
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    top: '18%',
    height: '40%',
    borderRadius: 999,
    backgroundColor: withAlpha(colors.purple, 0.16),
  },
  dot: {
    position: 'absolute',
    marginLeft: -2,
    marginTop: -2,
  },
  spark: {
    position: 'absolute',
    width: 1.5,
    opacity: 0.65,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  zapWrap: {
    marginBottom: 14,
    ...neonGlow(colors.yellow, 8),
  },
  subtitle: {
    marginTop: 18,
    textAlign: 'center',
  },
  platform: {
    position: 'absolute',
    bottom: 128,
    alignSelf: 'center',
    width: 200,
    height: 8,
    borderRadius: 999,
  },
  tap: {
    position: 'absolute',
    bottom: 62,
    alignSelf: 'center',
    textAlign: 'center',
  },
});
