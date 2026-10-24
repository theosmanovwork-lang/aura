import { useEffect, useState, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { NATIVE, SPRING, STAGGER_CAP, STAGGER_MS } from './springs';
import { useReducedMotion } from './useReducedMotion';

type EntranceProps = Readonly<{
  /** The place in a list: later rows come a little later. */
  index?: number;
  /** How far it rises while it appears. */
  rise?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

/** A row that fades in and rises into place with a spring, one after another down a list. */
export function Entrance({ index = 0, rise = 14, children, style, testID }: EntranceProps) {
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const delay = Math.min(index, STAGGER_CAP) * STAGGER_MS;
    const run = Animated.sequence([
      Animated.delay(delay),
      Animated.spring(progress, { toValue: 1, useNativeDriver: NATIVE, ...SPRING.enter }),
    ]);
    run.start();
    return () => run.stop();
  }, [index, progress, reduced]);

  return (
    <Animated.View
      testID={testID}
      style={[
        style,
        {
          opacity: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }),
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
