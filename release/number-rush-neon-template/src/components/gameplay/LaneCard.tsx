import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Snowflake } from 'lucide-react-native';
import { TARGET_VALUE } from '../../game/gameConstants';
import type { LaneState } from '../../game/gameTypes';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../../theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type Props = {
  lane: LaneState;
  target?: number;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  swapSelected?: boolean;
  reducedMotion?: boolean;
  bombHighlight?: boolean;
  testID?: string;
};

export function LaneCard({
  lane,
  target = TARGET_VALUE,
  onPress,
  disabled = false,
  selected = false,
  swapSelected = false,
  reducedMotion = false,
  bombHighlight = false,
  testID,
}: Props) {
  const shake = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (lane.status !== 'bust' || reducedMotion) {
      shake.setValue(0);
      return;
    }
    Animated.sequence([
      Animated.timing(shake, { toValue: -6, duration: 50, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shake, { toValue: 6, duration: 50, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shake, { toValue: -4, duration: 50, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shake, { toValue: 4, duration: 50, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, [lane.status, shake, reducedMotion]);

  useEffect(() => {
    if (
      reducedMotion ||
      (lane.status !== 'perfect' && lane.status !== 'receiving')
    ) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 400,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 400,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lane.status, pulse, reducedMotion]);

  const border = bombHighlight
    ? colors.red
    : borderColor(lane, selected, swapSelected);
  const totalColor = totalTextColor(lane);
  const progressColor = progressBarColor(lane);
  const pct = Math.min((lane.total / target) * 100, 100);
  const need = Math.max(0, target - lane.total);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Lane ${lane.id}, total ${lane.total}, needs ${need} to reach ${target}`}
      accessibilityState={{ disabled, selected: selected || swapSelected }}
      disabled={disabled}
      onPress={onPress}
      style={{ flex: 1, minWidth: 0 }}
    >
      <Animated.View
        style={[
          styles.card,
          {
            borderColor: border,
            transform: [
              { translateX: shake },
              { scale: selected || swapSelected ? 1.04 : pulse },
            ],
          },
          neonGlow(border, lane.status === 'perfect' || lane.status === 'bust' || bombHighlight ? 14 : 6),
        ]}
      >
        {lane.status === 'frozen' ? (
          <View style={[styles.frozen, { pointerEvents: 'none' }]}>
            <Snowflake size={28} color={colors.cyan} />
          </View>
        ) : null}

        <View
          style={[
            styles.badge,
            {
              backgroundColor: withAlpha(border, 0.2),
              borderColor: withAlpha(border, 0.35),
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: border }]}>LANE {lane.id}</Text>
        </View>

        <Text style={[styles.total, { color: totalColor }, lane.status !== 'default' && lane.status !== 'receiving' ? neonGlow(border, 8) : null]}>
          {lane.total}
        </Text>

        {lane.status !== 'perfect' && lane.status !== 'bust' ? (
          <Text style={styles.need}>need {need}</Text>
        ) : null}

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${pct}%`, backgroundColor: progressColor },
            ]}
          />
        </View>

        {lane.status === 'perfect' ? (
          <Text style={[styles.stateLabel, { color: colors.orange }, neonGlow(colors.orange, 4)]}>
            PERFECT!
          </Text>
        ) : null}
        {lane.status === 'bust' ? (
          <Text style={[styles.stateLabel, { color: colors.red }, neonGlow(colors.red, 4)]}>
            BUST!
          </Text>
        ) : null}
        {lane.status === 'frozen' ? (
          <Text style={[styles.stateLabel, { color: colors.cyan }]}>FROZEN</Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

function borderColor(
  lane: LaneState,
  selected: boolean,
  swapSelected: boolean,
): string {
  if (lane.status === 'perfect') return colors.orange;
  if (lane.status === 'bust') return colors.red;
  if (lane.status === 'frozen') return colors.cyan;
  if (swapSelected || lane.status === 'selected') return colors.electricBlue;
  if (selected || lane.status === 'receiving') return colors.neonPink;
  return withAlpha(colors.purple, 0.4);
}

function totalTextColor(lane: LaneState): string {
  if (lane.status === 'perfect') return colors.orange;
  if (lane.status === 'bust') return colors.red;
  if (lane.status === 'frozen') return colors.cyan;
  return colors.white;
}

function progressBarColor(lane: LaneState): string {
  if (lane.status === 'bust') return colors.red;
  if (lane.status === 'frozen') return colors.cyan;
  if (lane.status === 'perfect') return colors.orange;
  return colors.neonPink;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: radii.card,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 7,
    paddingHorizontal: 3,
    gap: 4,
    overflow: 'hidden',
    minHeight: 160,
  },
  frozen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: withAlpha(colors.cyan, 0.07),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radii.small,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 9,
  },
  total: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 28,
    lineHeight: 30,
  },
  need: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 9,
    color: colors.muted,
  },
  track: {
    width: '100%',
    height: 5,
    marginTop: 'auto',
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  stateLabel: {
    fontFamily: fontFamilies.orbitronExtraBold,
    fontSize: 8,
    letterSpacing: 0.5,
  },
});
