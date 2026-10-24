import { useState } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { tick } from './haptics';
import { NATIVE, PRESS_SCALE, SPRING } from './springs';
import { useReducedMotion } from './useReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, 'style'> &
  Readonly<{
    style?: StyleProp<ViewStyle>;
    /** How small it gets while pressed. */
    scaleTo?: number;
    /** A tick of the phone on press. */
    haptic?: boolean;
  }>;

/**
 * A drop-in `Pressable` that squashes when you press it and springs back with a little overshoot.
 * The scale sits on the pressable itself, so its layout (flex, position) stays exactly as before.
 */
export function PressableScale({
  style,
  scaleTo = PRESS_SCALE,
  haptic = false,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const reduced = useReducedMotion();

  const to = (value: number) => {
    if (reduced || disabled) return;
    Animated.spring(scale, { toValue: value, useNativeDriver: NATIVE, ...SPRING.press }).start();
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      style={[style, { transform: [{ scale }] }]}
      onPressIn={(event) => {
        to(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        to(1);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (haptic) tick();
        onPress?.(event);
      }}
    />
  );
}
