import { useEffect, useState } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from './useReducedMotion';

type GrowBarProps = Readonly<{
  /** 0 to 1: how much of the track is filled. */
  ratio: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

/** A progress fill that grows from empty to its width when it appears and follows later changes. */
export function GrowBar({ ratio, style, testID }: GrowBarProps) {
  const reduced = useReducedMotion();
  const [value] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced) {
      value.setValue(ratio);
      return;
    }
    Animated.timing(value, {
      toValue: ratio,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ratio, reduced, value]);

  const width = value.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return <Animated.View testID={testID} style={[style, { width }]} />;
}
