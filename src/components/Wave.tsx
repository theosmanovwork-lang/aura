import Svg, { Path } from 'react-native-svg';

/** The wave in the top right corner of a coloured plate (v1.1 of the design). */
const WAVE_PATH = 'M100 0 V84 C86 86 73 77 68 62 C63 46 50 43 40 33 C31 24 30 11 33 0 Z';

export const WAVE_FILL = {
  onDark: 'rgba(255,255,255,0.08)',
  onChrome: 'rgba(255,255,255,0.6)',
  onUltramarine: '#2F33B8',
  onSand: '#DCD3C1',
} as const;

type WaveProps = Readonly<{
  fill?: string;
  size?: number;
}>;

/** Decorative: it sits behind the content of the plate and is hidden from screen readers. */
export function Wave({ fill = WAVE_FILL.onDark, size = 150 }: WaveProps) {
  return (
    <Svg
      pointerEvents="none"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', right: 0, top: 0 }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path d={WAVE_PATH} fill={fill} />
    </Svg>
  );
}
