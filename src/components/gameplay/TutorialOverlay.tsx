import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamilies, neonGlow, radii, spacing, withAlpha } from '../../theme';
import { NeonButton } from '../NeonButton';

type Props = {
  visible: boolean;
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

export function TutorialOverlay({ visible, onComplete }: Props) {
  const [step, setStep] = useState(0);
  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step >= STEPS.length - 1;

  return (
    <View style={[styles.root, { pointerEvents: 'box-none' }]}>
      <View style={[styles.dim, { pointerEvents: 'none' }]} />
      <View
        style={[
          styles.spotlight,
          step === 0
            ? styles.spotTile
            : step === 1
              ? styles.spotLanes
              : styles.spotTarget,
          { pointerEvents: 'none' },
          neonGlow(colors.cyan, 16),
        ]}
      />

      <View style={styles.card}>
        <Text style={styles.stepLabel}>
          STEP {step + 1} OF {STEPS.length}
        </Text>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === step ? colors.cyan : withAlpha(colors.muted, 0.35),
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
            onPress={onComplete}
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
                else setStep((s) => s + 1);
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
    paddingBottom: 48,
    paddingHorizontal: spacing.lg,
  },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: withAlpha(colors.background, 0.72),
  },
  spotlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: withAlpha(colors.cyan, 0.7),
    alignSelf: 'center',
  },
  spotTile: {
    top: '52%',
    width: 100,
    height: 100,
    borderRadius: 20,
    marginLeft: -50,
    left: '50%',
  },
  spotLanes: {
    top: '24%',
    width: '88%',
    height: 200,
    borderRadius: 18,
    left: '6%',
  },
  spotTarget: {
    top: '14%',
    width: 200,
    height: 52,
    borderRadius: 14,
    marginLeft: -100,
    left: '50%',
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
