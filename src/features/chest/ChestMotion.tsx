import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing } from 'react-native';

import { success } from '../../motion/haptics';
import { NATIVE, SPRING } from '../../motion/springs';
import { useReducedMotion } from '../../motion/useReducedMotion';
import { FLASH_MS } from './timing';

type Stage = 'closed' | 'flash' | 'reward';

/** The golden glow behind the chest: calm at first, it swells to the flash and settles once the card is out. */
export function GlowPulse({ stage, children }: Readonly<{ stage: Stage; children: ReactNode }>) {
  const reduced = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduced) {
      scale.setValue(1);
      return;
    }
    if (stage === 'flash') {
      Animated.timing(scale, {
        toValue: 2.1,
        duration: FLASH_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: NATIVE,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: stage === 'reward' ? 1.25 : 1,
        useNativeDriver: NATIVE,
        ...SPRING.pop,
      }).start();
    }
  }, [stage, reduced, scale]);

  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}

/**
 * The chest breathes while it waits (a slow rise and fall); once it is opening it winds up, squashes
 * and shakes harder and harder: anticipation before the flash.
 */
export function ShakingChest({
  shaking,
  children,
}: Readonly<{ shaking: boolean; children: ReactNode }>) {
  const reduced = useReducedMotion();
  const [wave] = useState(() => new Animated.Value(0));
  const [squash] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduced) return;
    if (!shaking) {
      const idle = Animated.loop(
        Animated.sequence([
          Animated.timing(wave, { toValue: 1, duration: 1400, useNativeDriver: NATIVE }),
          Animated.timing(wave, { toValue: 0, duration: 1400, useNativeDriver: NATIVE }),
        ]),
      );
      idle.start();
      return () => idle.stop();
    }
    wave.setValue(0);
    const shake = Animated.sequence([
      Animated.timing(wave, { toValue: -1, duration: 70, useNativeDriver: NATIVE }),
      Animated.timing(wave, { toValue: 1, duration: 90, useNativeDriver: NATIVE }),
      Animated.timing(wave, { toValue: -1.6, duration: 90, useNativeDriver: NATIVE }),
      Animated.timing(wave, { toValue: 1.6, duration: 90, useNativeDriver: NATIVE }),
      Animated.timing(wave, { toValue: -2.2, duration: 80, useNativeDriver: NATIVE }),
      Animated.timing(wave, { toValue: 2.2, duration: 80, useNativeDriver: NATIVE }),
      Animated.timing(wave, { toValue: 0, duration: 60, useNativeDriver: NATIVE }),
    ]);
    const squashDown = Animated.sequence([
      Animated.timing(squash, { toValue: 0.88, duration: 160, useNativeDriver: NATIVE }),
      Animated.spring(squash, { toValue: 1.18, useNativeDriver: NATIVE, ...SPRING.pop }),
    ]);
    const both = Animated.parallel([shake, squashDown]);
    both.start();
    return () => both.stop();
  }, [shaking, reduced, wave, squash]);

  const rotate = wave.interpolate({ inputRange: [-2.2, 2.2], outputRange: ['-9deg', '9deg'] });
  const lift = wave.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  return (
    <Animated.View
      style={{
        transform: [
          { translateY: shaking ? 0 : lift },
          { rotate: shaking ? rotate : '0deg' },
          {
            scaleX: shaking
              ? squash.interpolate({ inputRange: [0.88, 1.18], outputRange: [1.12, 0.94] })
              : 1,
          },
          { scaleY: shaking ? squash : 1 },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** The card flies in small and tilted, overshoots its size and settles: the moment of the prize. */
export function CardReveal({ children }: Readonly<{ children: ReactNode }>) {
  const reduced = useReducedMotion();
  const [t] = useState(() => new Animated.Value(reduced ? 1 : 0));

  useEffect(() => {
    success();
    if (reduced) return;
    Animated.spring(t, { toValue: 1, useNativeDriver: NATIVE, speed: 9, bounciness: 14 }).start();
  }, [reduced, t]);

  return (
    <Animated.View
      style={{
        opacity: t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 1] }),
        transform: [
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['-28deg', '0deg'] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
