/**
 * Aura palette: deep indigo is the main color, warm gold is the accent.
 * Every text pair is checked for WCAG AA contrast in __tests__/theme/contrast.test.ts.
 */
export const colors = {
  // Surfaces (night indigo)
  background: '#0E0B1A',
  surface: '#1B1730',
  surfaceRaised: '#241F3D',
  border: '#2B2547',

  // Text and icons
  text: '#F5F3FF',
  textMuted: '#A8A3C7',
  iconInactive: '#8B86AD',

  // Main color: indigo. Use `primary` for fills with light text, `primaryText` for indigo text.
  primary: '#4F46E5',
  primaryPressed: '#4338CA',
  primaryText: '#A5B4FC',

  // Accent: gold. Highlights, the active tab, key numbers and the sparks currency.
  accent: '#FBBF24',
  onAccent: '#0E0B1A',
  accentSoft: 'rgba(251, 191, 36, 0.16)',
  spark: '#FBBF24',

  // Meaning
  positive: '#34D399',
  negative: '#FB7185',
  like: '#F472B6',

  // Layers over video
  overlay: 'rgba(14, 11, 26, 0.55)',
  scrimClear: 'rgba(14, 11, 26, 0)',
  scrimMid: 'rgba(14, 11, 26, 0.55)',
  scrimTop: 'rgba(14, 11, 26, 0.55)',
  scrimBottom: 'rgba(14, 11, 26, 0.88)',
  textShadow: 'rgba(14, 11, 26, 0.6)',
} as const;
