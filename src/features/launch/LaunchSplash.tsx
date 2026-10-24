import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AuraCoin } from '../../components/AuraIcon';
import { ru } from '../../i18n/ru';
import { NATIVE, SPRING } from '../../motion/springs';
import { useReducedMotion } from '../../motion/useReducedMotion';
import { fontFamilies } from '../../theme';

/** How long the loading bar takes to fill, at the least. */
export const SPLASH_MS = 1700;
const FADE_MS = 280;

type LaunchSplashProps = Readonly<{
  /** The app is ready to be shown (fonts loaded). The bar finishes first if it is not full yet. */
  ready: boolean;
  /** Called after the splash has faded out. */
  onDone: () => void;
}>;

/**
 * The launch screen: the coin springs in, the word and the tagline rise, the thin bar fills. When the
 * bar is full and the app is ready everything fades and `onDone` is called.
 */
export function LaunchSplash({ ready, onDone }: LaunchSplashProps) {
  const reduced = useReducedMotion();
  const [enter] = useState(() => new Animated.Value(0));
  const [bar] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (reduced) {
      enter.setValue(1);
      bar.setValue(1);
      return;
    }
    Animated.spring(enter, { toValue: 1, useNativeDriver: NATIVE, ...SPRING.pop }).start();
    Animated.timing(bar, {
      toValue: 1,
      duration: SPLASH_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => finished && setFull(true));
  }, [reduced, enter, bar]);

  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      onDone();
      return;
    }
    if (!full) return;
    Animated.timing(fade, { toValue: 0, duration: FADE_MS, useNativeDriver: NATIVE }).start(
      ({ finished }) => finished && onDone(),
    );
  }, [full, ready, reduced, fade, onDone]);

  const coinScale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const width = bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View testID="launch-splash" style={[styles.page, { opacity: fade }]}>
      <View pointerEvents="none" style={styles.glow}>
        <Svg width={460} height={460} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="launchGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#D7DAE0" stopOpacity={0.16} />
              <Stop offset="1" stopColor="#D7DAE0" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill="url(#launchGlow)" />
        </Svg>
      </View>
      <Animated.View style={{ opacity: enter, transform: [{ scale: coinScale }] }}>
        <AuraCoin size={96} tone="light" />
      </Animated.View>
      <Animated.View style={[styles.texts, { opacity: enter, transform: [{ translateY: rise }] }]}>
        <Text style={styles.word}>aura</Text>
        <Text style={styles.tagline}>{ru.brand.tagline}</Text>
      </Animated.View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={ru.brand.loading}
        style={styles.track}
      >
        <Animated.View style={[styles.fill, { width }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    backgroundColor: '#1A1A1A',
  },
  glow: { position: 'absolute', alignSelf: 'center', top: '50%', marginTop: -253 },
  texts: { alignItems: 'center', gap: 18 },
  word: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 44,
    letterSpacing: -1.5,
    color: '#FFFFFF',
  },
  tagline: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    letterSpacing: 0.4,
    color: '#B5AC9D',
  },
  track: {
    position: 'absolute',
    bottom: 60,
    width: 120,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  fill: { height: 4, borderRadius: 2, backgroundColor: '#D7DAE0' },
});
