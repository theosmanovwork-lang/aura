import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { Icon } from '../../components/Icon';
import { useReduceMotion } from '../../components/useReduceMotion';
import { colors, iconSizes, radii } from '../../theme';

const SIZE = 40;
const SPIN_MS = 6000;

/** The turning record in the corner. Decoration only: hidden from screen readers, still when motion is reduced. */
export function MusicDisc() {
  const reduced = useReduceMotion();
  const [turn] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduced !== false) return;
    const loop = Animated.loop(
      Animated.timing(turn, {
        toValue: 1,
        duration: SPIN_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, turn]);

  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View
      testID="music-disc"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.disc, reduced === false && { transform: [{ rotate }] }]}
    >
      <Icon name="musical-notes" size={iconSizes.sm} color={colors.text} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: radii.pill,
    borderWidth: 6,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
});
