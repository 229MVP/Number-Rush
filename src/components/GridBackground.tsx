import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { colors, withAlpha } from '../theme';

type Props = {
  opacity?: number;
  cellSize?: number;
  style?: ViewStyle;
};

export function GridBackground({ opacity = 0.05, cellSize = 32, style }: Props) {
  const { width, height } = useWindowDimensions();
  const stroke = withAlpha(colors.electricBlue, opacity);

  const lines = useMemo(() => {
    const vertical: number[] = [];
    const horizontal: number[] = [];
    for (let x = 0; x <= width; x += cellSize) vertical.push(x);
    for (let y = 0; y <= height; y += cellSize) horizontal.push(y);
    return { vertical, horizontal };
  }, [width, height, cellSize]);

  return (
    <View pointerEvents="none" style={[styles.fill, style]}>
      <Svg style={{ pointerEvents: "none" }} width={width} height={height}>
        {lines.vertical.map((x) => (
          <Line key={`v-${x}`} x1={x} y1={0} x2={x} y2={height} stroke={stroke} strokeWidth={1} />
        ))}
        {lines.horizontal.map((y) => (
          <Line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke={stroke} strokeWidth={1} />
        ))}
      </Svg>
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
    zIndex: 0,
  },
});
