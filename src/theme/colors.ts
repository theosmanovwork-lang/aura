/**
 * Two palettes in the manner of Instagram, X and Giggles: flat, plain white or black, one blue
 * accent, green for growth and red for a fall. A phone set to dark gets `darkColors`, any other
 * `lightColors`. The feed with its video is always dark. Every text pair is checked for WCAG AA
 * contrast in __tests__/theme/contrast.test.ts.
 */
export type Palette = Readonly<{
  // Surfaces
  background: string;
  surface: string;
  surfaceMuted: string;
  /** Same as `surfaceMuted`; the older name still used by a few components. */
  surfaceRaised: string;
  /** A pressed row. */
  hover: string;
  /** Every line and card edge. */
  border: string;
  /** The edge of an input field (3:1 against the page). */
  fieldBorder: string;

  // Text and icons
  text: string;
  textSecondary: string;
  textMuted: string;
  iconInactive: string;
  /** Accent captions and links. */
  accentText: string;

  // The accent: selected states, links, the like. `primary` is the fill of the main button.
  accent: string;
  onAccent: string;
  accentSoft: string;
  accentSoftText: string;
  spark: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primaryText: string;
  /** Bars of the trend charts: 3:1 against a card. */
  chartBar: string;

  // Growth is green, a fall is red; the arrow carries the meaning too.
  positive: string;
  negative: string;
  positiveSoft: string;
  negativeSoft: string;
  like: string;
  /** Errors and destructive actions only. */
  destructive: string;

  // Layers over video (the same in both palettes)
  overlay: string;
  scrimClear: string;
  scrimMid: string;
  scrimTop: string;
  scrimBottom: string;
  textShadow: string;
  /** Text and icons drawn over a video: always white. */
  onVideo: string;
  /** A soft plate over a video (the Aura chip). */
  onVideoPlate: string;
}>;

const overVideo = {
  overlay: 'rgba(0, 0, 0, 0.55)',
  scrimClear: 'rgba(0, 0, 0, 0)',
  scrimMid: 'rgba(0, 0, 0, 0.4)',
  scrimTop: 'rgba(0, 0, 0, 0.45)',
  scrimBottom: 'rgba(0, 0, 0, 0.8)',
  textShadow: 'rgba(0, 0, 0, 0.6)',
  onVideo: '#FFFFFF',
  onVideoPlate: 'rgba(255, 255, 255, 0.18)',
} as const;

export const darkColors: Palette = {
  background: '#000000',
  surface: '#0D0E10',
  surfaceMuted: '#16181C',
  surfaceRaised: '#16181C',
  hover: 'rgba(255, 255, 255, 0.06)',
  border: '#25282D',
  fieldBorder: '#5B616B',

  text: '#F4F5F7',
  textSecondary: '#C9CDD4',
  textMuted: '#8B919A',
  iconInactive: '#8B919A',
  accentText: '#7D9DFF',

  accent: '#5B86FF',
  onAccent: '#000000',
  accentSoft: 'rgba(91, 134, 255, 0.16)',
  accentSoftText: '#9DB6FF',
  spark: '#F4F5F7',
  primary: '#3A66F5',
  primaryPressed: '#2F55D6',
  onPrimary: '#FFFFFF',
  primaryText: '#9DB6FF',
  chartBar: '#5B616B',

  positive: '#2BD06F',
  negative: '#FF5468',
  positiveSoft: 'rgba(43, 208, 111, 0.14)',
  negativeSoft: 'rgba(255, 84, 104, 0.14)',
  like: '#F4F5F7',
  destructive: '#FF6467',
  ...overVideo,
};

export const lightColors: Palette = {
  background: '#FFFFFF',
  surface: '#F7F8FA',
  surfaceMuted: '#F0F2F5',
  surfaceRaised: '#F0F2F5',
  hover: 'rgba(15, 20, 25, 0.05)',
  border: '#E8EAEE',
  fieldBorder: '#8A9099',

  text: '#0F1419',
  textSecondary: '#3A414A',
  textMuted: '#5B6372',
  iconInactive: '#5B6372',
  accentText: '#1A4DFF',

  accent: '#1A4DFF',
  onAccent: '#FFFFFF',
  accentSoft: 'rgba(26, 77, 255, 0.10)',
  accentSoftText: '#1239C4',
  spark: '#0F1419',
  primary: '#1A4DFF',
  primaryPressed: '#1239C4',
  onPrimary: '#FFFFFF',
  primaryText: '#1239C4',
  chartBar: '#8A9099',

  positive: '#07722F',
  negative: '#C21F36',
  positiveSoft: 'rgba(7, 114, 47, 0.09)',
  negativeSoft: 'rgba(194, 31, 54, 0.09)',
  like: '#0F1419',
  destructive: '#C21F36',
  ...overVideo,
};

export type ColorScheme = 'light' | 'dark';

export const palettes: Readonly<Record<ColorScheme, Palette>> = {
  light: lightColors,
  dark: darkColors,
};
