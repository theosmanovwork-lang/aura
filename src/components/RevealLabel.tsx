import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, type StyleProp, type TextStyle } from 'react-native';

const FADE_MS = 180;
const MAX_FONT_SCALE = 1.2;

type RevealLabelProps = Readonly<{ text: string; testID: string; style?: StyleProp<TextStyle> }>;

/** A short name that appears next to an icon when its tab opens; it fades in unless motion is reduced. */
export function RevealLabel({ text, testID, style }: RevealLabelProps) {
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    const start = (reduceMotion: boolean) => {
      if (cancelled) return;
      if (reduceMotion) opacity.setValue(1);
      else
        Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
    };
    AccessibilityInfo.isReduceMotionEnabled().then(start, () => start(false));
    return () => {
      cancelled = true;
      opacity.stopAnimation();
    };
  }, [opacity]);

  return (
    <Animated.Text
      testID={testID}
      numberOfLines={1}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={[style, { opacity }]}
    >
      {text}
    </Animated.Text>
  );
}
