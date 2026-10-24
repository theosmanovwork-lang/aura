import { useEffect, useState } from 'react';
import { Animated, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles } from '../theme';

const SHIMMER_MS = 1200;

type SkeletonProps = Readonly<{
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}>;

/** A grey stand-in for content that is still loading; it pulses once per 1.2 s. Hidden from screen readers. */
export function Skeleton({ width = '100%', height, radius = 6, style }: SkeletonProps) {
  const styles = useStyles();
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: SHIMMER_MS / 2, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: SHIMMER_MS / 2, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] });
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
}

const useStyles = makeStyles((colors) => ({
  block: { backgroundColor: colors.border },
}));
