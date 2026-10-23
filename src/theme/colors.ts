/**
 * Aura palette, taken from the Prufbase design system (docs/design-system): dark, flat, one neutral
 * accent. Colour never says "good" or "bad": growth is light, a fall is muted, both carry an arrow.
 * Every text pair is checked for WCAG AA contrast in __tests__/theme/contrast.test.ts.
 */
export const colors = {
  // Surfaces
  background: '#08090A',
  surface: '#0F1011',
  surfaceMuted: '#141516',
  /** Same as `surfaceMuted`; the older name still used by a few components. */
  surfaceRaised: '#141516',
  /** A pressed row. */
  hover: 'rgba(255, 255, 255, 0.05)',
  /** Every line and card edge: white at 8%. */
  border: 'rgba(255, 255, 255, 0.08)',
  /** The edge of an input field (3:1 against the page). */
  fieldBorder: '#62666D',

  // Text and icons
  text: '#F7F8F8',
  textSecondary: '#D0D6E0',
  textMuted: '#9CA1AB',
  iconInactive: '#9CA1AB',
  /** Accent captions («01», eyebrow). */
  accentText: '#D0D6E0',

  // The one accent: almost white on dark. `primary` is the fill of the main button.
  accent: '#E5E5E6',
  onAccent: '#08090A',
  accentSoft: 'rgba(229, 229, 230, 0.12)',
  accentSoftText: '#E5E5E6',
  spark: '#E5E5E6',
  primary: '#E5E5E6',
  primaryPressed: '#FFFFFF',
  onPrimary: '#08090A',
  primaryText: '#D0D6E0',
  /** Bars of the trend charts: 3:1 against a card. */
  chartBar: '#62666D',

  // Meaning without hue: growth is light, a fall is muted.
  positive: '#E5E5E6',
  negative: '#9CA1AB',
  positiveSoft: 'rgba(255, 255, 255, 0.08)',
  negativeSoft: 'rgba(255, 255, 255, 0.04)',
  like: '#F7F8F8',
  /** Errors and destructive actions only. */
  destructive: '#FF6467',

  // Glass panels (tab bar): the fill that tints the blur behind them
  glassFill: 'rgba(15, 16, 17, 0.88)',

  // Layers over video
  overlay: 'rgba(8, 9, 10, 0.55)',
  scrimClear: 'rgba(8, 9, 10, 0)',
  scrimMid: 'rgba(8, 9, 10, 0.55)',
  scrimTop: 'rgba(8, 9, 10, 0.55)',
  scrimBottom: 'rgba(8, 9, 10, 0.88)',
  textShadow: 'rgba(8, 9, 10, 0.6)',
} as const;
