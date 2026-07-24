import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, Pause, Shield, Zap } from 'lucide-react-native';
import { colors, fontFamilies, neonGlow, withAlpha } from '../../theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type Props = {
  score: number;
  comboMultiplier: number;
  strikesRemaining: number;
  scorePulseKey: number;
  comboPulseKey: number;
  onPause: () => void;
  pauseDisabled?: boolean;
  modeBadge?: string | null;
  attemptLabel?: string | null;
  tilesRemaining?: number | null;
  shieldArmed?: boolean;
  reducedMotion?: boolean;
};

export function GameplayHUD({
  score,
  comboMultiplier,
  strikesRemaining,
  scorePulseKey,
  comboPulseKey,
  onPause,
  pauseDisabled = false,
  modeBadge = null,
  attemptLabel = null,
  tilesRemaining = null,
  shieldArmed = false,
  reducedMotion = false,
}: Props) {
  const scoreScale = useRef(new Animated.Value(1)).current;
  const comboScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (scorePulseKey === 0) return;
    scoreScale.setValue(1);
    Animated.sequence([
      Animated.timing(scoreScale, {
        toValue: 1.15,
        duration: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(scoreScale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [scorePulseKey, scoreScale]);

  useEffect(() => {
    if (comboPulseKey === 0) return;
    comboScale.setValue(1);
    Animated.sequence([
      Animated.timing(comboScale, {
        toValue: 1.3,
        duration: 140,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(comboScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [comboPulseKey, comboScale]);

  const comboColor = comboMultiplier >= 4 ? colors.yellow : colors.orange;

  return (
    <View>
      {(modeBadge || attemptLabel || tilesRemaining != null) && (
        <View style={styles.modeRow}>
          {modeBadge ? (
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>{modeBadge}</Text>
            </View>
          ) : null}
          {attemptLabel ? (
            <Text style={styles.attemptLabel}>{attemptLabel}</Text>
          ) : null}
          {tilesRemaining != null ? (
            <Text style={styles.tilesLeft}>TILES LEFT: {tilesRemaining}</Text>
          ) : null}
        </View>
      )}
      <View style={styles.hud} testID="gameplay-hud">
      <Pressable
        testID="gameplay-pause"
        accessibilityRole="button"
        accessibilityLabel="Pause game"
        accessibilityState={{ disabled: pauseDisabled }}
        disabled={pauseDisabled}
        hitSlop={8}
        onPress={onPause}
        style={[styles.pauseBtn, neonGlow(colors.neonPink, 8), pauseDisabled && styles.disabled]}
      >
        <Pause size={18} color={colors.neonPink} />
      </Pressable>

      <View style={styles.stat}>
        <Text style={styles.label}>SCORE</Text>
        <Animated.Text
          style={[
            styles.score,
            neonGlow(colors.electricBlue, 5),
            { transform: [{ scale: scoreScale }] },
          ]}
        >
          {score.toLocaleString()}
        </Animated.Text>
      </View>

      <View style={styles.stat}>
        <Text style={styles.label}>COMBO</Text>
        <Animated.View
          style={[styles.comboRow, { transform: [{ scale: comboScale }] }]}
        >
          {comboMultiplier >= 3 ? <Zap size={13} color={comboColor} /> : null}
          <Text style={[styles.combo, { color: comboColor }, neonGlow(comboColor, comboMultiplier >= 4 ? 8 : 5)]}>
            x{comboMultiplier}
          </Text>
        </Animated.View>
      </View>

      <View
        style={styles.stat}
        accessible
        accessibilityLabel={`${strikesRemaining} strikes remaining${
          shieldArmed ? ', shield armed' : ''
        }`}
      >
        <Text style={[styles.label, { marginBottom: 2 }]} importantForAccessibility="no">
          STRIKES
        </Text>
        <View style={styles.strikesRow}>
          <StrikeHearts remaining={strikesRemaining} reducedMotion={reducedMotion} />
          {shieldArmed ? (
            <View
              style={[styles.shieldHud, neonGlow(colors.electricBlue, 6)]}
              accessibilityLabel="Shield armed"
            >
              <Shield size={14} color={colors.electricBlue} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
    </View>
  );
}

function StrikeHearts({
  remaining,
  reducedMotion = false,
}: {
  remaining: number;
  reducedMotion?: boolean;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const isLast = remaining === 1;

  useEffect(() => {
    if (!isLast || reducedMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.25,
          duration: 450,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isLast, pulse, reducedMotion]);

  return (
    <View style={styles.hearts}>
      {[0, 1, 2].map((i) => {
        const filled = i < remaining;
        const wrap = (
          <Heart
            size={17}
            fill={filled ? colors.neonPink : 'none'}
            color={filled ? colors.neonPink : withAlpha(colors.muted, 0.4)}
            strokeWidth={2}
          />
        );
        if (filled && isLast && i === 0) {
          return (
            <Animated.View key={i} style={{ transform: [{ scale: pulse }] }}>
              {wrap}
            </Animated.View>
          );
        }
        return (
          <View key={i} style={!filled ? { opacity: 0.35 } : undefined}>
            {wrap}
          </View>
        );
      })}
    </View>
  );
}

export function StrikeDisplay({ remaining }: { remaining: number }) {
  return <StrikeHearts remaining={remaining} />;
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: withAlpha(colors.backgroundSecondary, 0.9),
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(colors.electricBlue, 0.06),
    zIndex: 10,
  },
  modeBadge: {
    backgroundColor: withAlpha(colors.orange, 0.18),
    borderWidth: 1,
    borderColor: withAlpha(colors.orange, 0.55),
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modeBadgeText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 10,
    color: colors.orange,
    letterSpacing: 1.5,
  },
  attemptLabel: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 11,
    color: colors.cyan,
    letterSpacing: 1,
  },
  tilesLeft: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 11,
    color: colors.yellow,
    letterSpacing: 1,
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: withAlpha(colors.backgroundSecondary, 0.8),
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(colors.electricBlue, 0.09),
    zIndex: 10,
    gap: 8,
  },
  pauseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: withAlpha(colors.neonPink, 0.53),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  stat: {
    alignItems: 'center',
    minWidth: 56,
  },
  label: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.5,
  },
  score: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 19,
    color: colors.white,
  },
  comboRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  combo: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 17,
  },
  strikesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shieldHud: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.electricBlue,
    backgroundColor: withAlpha(colors.electricBlue, 0.18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hearts: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
});
