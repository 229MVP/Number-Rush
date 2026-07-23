import React from 'react';
import { StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { colors, withAlpha } from '../theme';

type Props = {
  height?: number;
  style?: ViewStyle;
};

export function PerspectiveGrid({ height = 180, style }: Props) {
  const { width } = useWindowDimensions();
  const cx = width * 0.5;

  return (
    <View pointerEvents="none" style={[styles.wrap, { height }, style]}>
      <Svg style={{ pointerEvents: "none" }} width={width} height={height}>
        {Array.from({ length: 10 }).map((_, i) => {
          const t = i / 9;
          const y = t * height;
          const spread = cx * t * 1.9;
          const alpha = 0.08 + t * 0.12;
          return (
            <Line
              key={`h-${i}`}
              x1={cx - spread}
              y1={y}
              x2={cx + spread}
              y2={y}
              stroke={withAlpha(colors.electricBlue, alpha)}
              strokeWidth={0.8}
            />
          );
        })}
        {Array.from({ length: 9 }).map((_, i) => {
          const x2 = ((i + 1) / 10) * width;
          return (
            <Line
              key={`r-${i}`}
              x1={cx}
              y1={0}
              x2={x2}
              y2={height}
              stroke={withAlpha(colors.electricBlue, 0.08)}
              strokeWidth={0.8}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
});
