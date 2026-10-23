import Svg, { Circle, Path } from 'react-native-svg';

import { silver, useScheme } from '../theme';

type Tone = 'dark' | 'light' | 'auto';

type AuraCoinProps = Readonly<{
  size?: number;
  /**
   * `dark` is a black coin with a white «a» (on a light page); `light` is a grey coin with a black «a»;
   * `auto` (the default) picks the one that stands out on the page of the phone's theme.
   */
  tone?: Tone;
  testID?: string;
}>;

const COIN = {
  dark: { disc: '#1A1A1A', glyph: '#FFFFFF', dot: silver.coin },
  light: { disc: silver.coin, glyph: '#1A1A1A', dot: '#FFFFFF' },
} as const;

/** The Aura coin: a round «a» (a ring with a stem) and a small spark. Decorative; the text beside it says «Аура». */
export function AuraCoin({ size = 20, tone = 'auto', testID }: AuraCoinProps) {
  const scheme = useScheme();
  const { disc, glyph, dot } =
    COIN[tone === 'auto' ? (scheme === 'dark' ? 'light' : 'dark') : tone];
  return (
    <Svg
      testID={testID}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Circle cx="12" cy="12" r="11" fill={disc} />
      <Circle cx="10.6" cy="13" r="4.3" fill="none" stroke={glyph} strokeWidth="2.5" />
      <Path d="M14.9 8.6v8.7" stroke={glyph} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="17.8" cy="6.4" r="1.7" fill={dot} />
    </Svg>
  );
}

type AuraGlyphProps = Readonly<{ size?: number; color: string; testID?: string }>;

/** The «a» of the coin without the disc: for round buttons and big faded drawings. */
export function AuraGlyph({ size = 24, color, testID }: AuraGlyphProps) {
  return (
    <Svg
      testID={testID}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Circle cx="10.4" cy="13.2" r="5.2" fill="none" stroke={color} strokeWidth="2.8" />
      <Path d="M15.6 7.6v11" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      <Circle cx="19" cy="5" r="2" fill={color} />
    </Svg>
  );
}
