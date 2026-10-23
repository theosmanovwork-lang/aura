import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '../theme';

const BLUR_INTENSITY = 60;

/** True when the user asked the phone for less transparency (iOS setting). */
function useReduceTransparency(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Only iOS has this setting; the web and Android versions of AccessibilityInfo do not offer it.
    if (typeof AccessibilityInfo.isReduceTransparencyEnabled !== 'function') return;
    let cancelled = false;
    AccessibilityInfo.isReduceTransparencyEnabled().then(
      (value) => !cancelled && setReduced(value),
      () => undefined, // not readable: keep the glass, the tint behind the text keeps it readable
    );
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduced,
    );
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return reduced;
}

type GlassSurfaceProps = ViewProps & Readonly<{ children?: ReactNode }>;

/**
 * A frosted panel. iOS 26 gets Liquid Glass, other iPhones and the web get a blur, Android (where a
 * blur needs extra setup) and anyone who asked for less transparency get a plain solid surface.
 */
export function GlassSurface({ style, children, ...rest }: GlassSurfaceProps) {
  const reduced = useReduceTransparency();
  const solid = reduced || Platform.OS === 'android';

  if (solid) {
    return (
      <View {...rest} style={[styles.clip, styles.solid, style]}>
        {children}
      </View>
    );
  }
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView
        {...rest}
        glassEffectStyle="regular"
        colorScheme="dark"
        style={[styles.clip, style]}
      >
        {children}
      </GlassView>
    );
  }
  return (
    <BlurView {...rest} intensity={BLUR_INTENSITY} tint="dark" style={[styles.clip, style]}>
      {/* A child, not a style: the web blur overwrites its own background colour. */}
      <View pointerEvents="none" style={styles.fill} />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  solid: { backgroundColor: colors.surface },
  fill: { ...StyleSheet.absoluteFill, backgroundColor: colors.glassFill },
});
