import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { NATIVE, SPRING } from './springs';
import { useReducedMotion } from './useReducedMotion';

type PopProps = Readonly<{
  /** Every time this changes the child jumps up and settles. */
  trigger: unknown;
  /** The size it reaches at the top of the jump. */
  peak?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

/** Squash and stretch: the child grows past its size and springs back (a tab icon, a badge, a coin). */
export function Pop({ trigger, peak = 1.3, children, style }: PopProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const previous = useRef(trigger);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (Object.is(previous.current, trigger)) return;
    previous.current = trigger;
    if (reduced) return;
    scale.setValue(peak);
    Animated.spring(scale, { toValue: 1, useNativeDriver: NATIVE, ...SPRING.pop }).start();
  }, [trigger, peak, reduced, scale]);

  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
}
