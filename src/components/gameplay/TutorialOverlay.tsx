import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TutorialTargetRect } from '../../utils/measureTutorialTarget';
import { expandRect } from '../../utils/measureTutorialTarget';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';
import { NeonButton } from '../NeonButton';

export type TutorialStep = 1 | 2 | 3;

type Props = {
  visible: boolean;
  step: TutorialStep;
  targetRect: TutorialTargetRect | null;
  /** Gameplay root layout size — dim panels fill this, not the browser window. */
  bounds: { width: number; height: number };
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
};

const STEPS = [
  {
    title: 'This is your current number.',
    hint: 'Watch the glowing purple tile — that value is what you place next.',
  },
  {
    title: 'Tap a lane to add the number.',
    hint: 'Each lane stacks totals. Pick carefully so you do not go over.',
  },
  {
    title: 'Reach exactly 21 to clear the lane!',
    hint: 'Perfect clears build your combo. Busts cost a strike.',
  },
] as const;

const STEP_PADDING: Record<TutorialStep, number> = {
  1: 12,
  2: 10,
  3: 10,
};

const STEP_RADIUS: Record<TutorialStep, number> = {
  1: 20,
  2: 18,
  3: 14,
};

const DIM = withAlpha(colors.background, 0.82);

export function TutorialOverlay({
  visible,
  step,
  targetRect,
  bounds,
  onNext,
  onSkip,
  onComplete,
}: Props) {
  const insets = useSafeAreaInsets();
  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const animW = useRef(new Animated.Value(0)).current;
  const animH = useRef(new Animated.Value(0)).current;
  const borderOpacity = useRef(new Animated.Value(0)).current;
  const hasRect = useRef(false);

  const overlayW = bounds.width > 0 ? bounds.width : 390;
  const overlayH = bounds.height > 0 ? bounds.height : 844;

  const spotlight = useMemo(() => {
    if (!targetRect) return null;
    return expandRect(targetRect, STEP_PADDING[step], {
      width: overlayW,
      height: overlayH,
    });
  }, [targetRect, step, overlayW, overlayH]);

  useEffect(() => {
    if (!visible || !spotlight) {
      borderOpacity.setValue(0);
      hasRect.current = false;
      return;
    }

    const next = spotlight;
    if (!hasRect.current) {
      animX.setValue(next.x);
      animY.setValue(next.y);
      animW.setValue(next.width);
      animH.setValue(next.height);
      hasRect.current = true;
      Animated.timing(borderOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }).start();
      return;
    }

    Animated.parallel([
      Animated.timing(animX, {
        toValue: next.x,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animY, {
        toValue: next.y,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animW, {
        toValue: next.width,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animH, {
        toValue: next.height,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(borderOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [visible, spotlight, animX, animY, animW, animH, borderOpacity]);

  if (!visible) return null;

  const stepIndex = step - 1;
  const current = STEPS[stepIndex];
  const isLast = step === 3;

  const sx = spotlight?.x ?? 0;
  const sy = spotlight?.y ?? 0;
  const sw = spotlight?.width ?? 0;
  const sh = spotlight?.height ?? 0;

  const topH = Math.max(0, sy);
  const leftW = Math.max(0, sx);
  const rightW = Math.max(0, overlayW - (sx + sw));
  const bottomH = Math.max(0, overlayH - (sy + sh));

  return (
    <View style={[styles.root, { pointerEvents: 'auto' }]}>
      {/* Four-panel dim mask — true hole over the measured target */}
      <View style={[styles.dimLayer, { pointerEvents: 'none' }]}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: overlayW,
            height: topH,
            backgroundColor: DIM,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: sy,
            width: leftW,
            height: Math.max(0, sh),
            backgroundColor: DIM,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: sx + sw,
            top: sy,
            width: rightW,
            height: Math.max(0, sh),
            backgroundColor: DIM,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: sy + sh,
            width: overlayW,
            height: bottomH,
            backgroundColor: DIM,
          }}
        />
      </View>

      {spotlight ? (
        <Animated.View
          testID="tutorial-spotlight"
          accessibilityLabel="tutorial-spotlight"
          style={[
            styles.spotlight,
            {
              left: animX,
              top: animY,
              width: animW,
              height: animH,
              borderRadius: STEP_RADIUS[step],
              opacity: borderOpacity,
              pointerEvents: 'none',
            },
            neonGlow(colors.cyan, 14),
          ]}
        />
      ) : null}

      <View
        style={[
          styles.card,
          {
            marginBottom: Math.max(insets.bottom, 8) + 24,
            marginHorizontal: 22,
            maxWidth: 420,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
      >
        <Text style={styles.stepLabel}>
          STEP {step} OF {STEPS.length}
        </Text>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === stepIndex ? colors.cyan : withAlpha(colors.muted, 0.35),
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.title, neonGlow(colors.cyan, 6)]}>{current.title}</Text>
        <Text style={styles.hint}>{current.hint}</Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip tutorial"
            onPress={onSkip}
            hitSlop={8}
          >
            <Text style={styles.skip}>SKIP</Text>
          </Pressable>
          <View style={styles.cta}>
            <NeonButton
              label={isLast ? 'GOT IT' : 'NEXT'}
              color={colors.cyan}
              size="small"
              fullWidth={false}
              onPress={() => {
                if (isLast) onComplete();
                else onNext();
              }}
              style={{ minWidth: 120 }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 90,
    justifyContent: 'flex-end',
  },
  dimLayer: {
    ...StyleSheet.absoluteFill,
  },
  spotlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: withAlpha(colors.cyan, 0.85),
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.modal,
    borderWidth: 1.5,
    borderColor: withAlpha(colors.cyan, 0.45),
    padding: 20,
    gap: 10,
    zIndex: 2,
  },
  stepLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.cyan,
    letterSpacing: 2,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  hint: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  skip: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1,
  },
  cta: {
    alignItems: 'flex-end',
  },
});
