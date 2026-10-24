import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AuraCoin } from '../components/AuraIcon';
import { NATIVE } from './springs';
import { useReducedMotion } from './useReducedMotion';

const COINS = 7;
const BIG_SIZE = 84;
const SMALL_SIZE = 22;
const DURATION_MS = 820;

export type BurstPoint = Readonly<{ id: number; x: number; y: number }>;

type CoinBurstProps = Readonly<{ at: BurstPoint; onDone: (id: number) => void }>;

/** Where each small coin flies: spread over the upper half-circle, a different distance for each. */
const FLIGHTS = Array.from({ length: COINS }, (_, i) => {
  const angle = (Math.PI * (i + 0.5)) / COINS + Math.PI; // from left over the top to the right
  const distance = 70 + (i % 3) * 28;
  return {
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance - 30,
    spin: (i % 2 ? 1 : -1) * 220,
  };
});

/**
 * The double-tap burst of the feed: a big coin pops under the finger, small ones fly out and fade.
 * It removes itself when it is over.
 */
export function CoinBurst({ at, onDone }: CoinBurstProps) {
  const reduced = useReducedMotion();
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced) {
      onDone(at.id);
      return;
    }
    Animated.timing(t, { toValue: 1, duration: DURATION_MS, useNativeDriver: NATIVE }).start(
      ({ finished }) => finished && onDone(at.id),
    );
  }, [at.id, onDone, reduced, t]);

  const bigScale = t.interpolate({
    inputRange: [0, 0.18, 0.35, 1],
    outputRange: [0.2, 1.25, 1, 1.1],
  });
  const bigOpacity = t.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 1, 1, 0] });

  return (
    <View pointerEvents="none" style={[styles.origin, { left: at.x, top: at.y }]}>
      <Animated.View
        style={[styles.big, { opacity: bigOpacity, transform: [{ scale: bigScale }] }]}
      >
        <AuraCoin size={BIG_SIZE} tone="light" />
      </Animated.View>
      {FLIGHTS.map((flight, i) => (
        <Animated.View
          key={i}
          style={[
            styles.small,
            {
              opacity: t.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, flight.dx] }) },
                { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, flight.dy] }) },
                {
                  rotate: t.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${flight.spin}deg`],
                  }),
                },
                { scale: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1, 0.7] }) },
              ],
            },
          ]}
        >
          <AuraCoin size={SMALL_SIZE} tone="light" />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  origin: { position: 'absolute', width: 0, height: 0 },
  big: { position: 'absolute', left: -BIG_SIZE / 2, top: -BIG_SIZE / 2 },
  small: { position: 'absolute', left: -SMALL_SIZE / 2, top: -SMALL_SIZE / 2 },
});
