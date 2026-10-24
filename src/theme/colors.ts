/**
 * Two palettes from the design of the owner (Claude Design): a warm cream page with white cards and
 * black ink in the light scheme, a warm dark page in the dark one. A phone set to dark gets
 * `darkColors`, any other `lightColors`. The feed with its video is always dark. Every text pair is
 * checked for WCAG AA contrast in __tests__/theme/contrast.test.ts.
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
  /** The bottom tab bar and the line on top of it. */
  tabBar: string;
  tabBarBorder: string;

  // Text and icons
  text: string;
  textSecondary: string;
  textMuted: string;
  iconInactive: string;
  /** Accent captions and links. */
  accentText: string;

  // The main button and the selected states are the ink colour; `brand` is the avatar colour.
  accent: string;
  onAccent: string;
  accentSoft: string;
  accentSoftText: string;
  spark: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primaryText: string;
  brand: string;
  onBrand: string;
  /** Bars of the trend charts: 3:1 against a card. */
  chartBar: string;
  /** The green dot of somebody who is online. */
  online: string;
  /** A dark card in the page (referral, balance, chat): black in the light scheme, a lifted warm dark in the dark one. */
  heroCard: string;
  onHeroCard: string;
  heroMuted: string;
  heroLine: string;

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
  /** A soft plate over a video (round buttons, the pool chip). */
  onVideoPlate: string;
}>;

const overVideo = {
  overlay: 'rgba(0, 0, 0, 0.55)',
  scrimClear: 'rgba(0, 0, 0, 0)',
  scrimMid: 'rgba(0, 0, 0, 0.36)',
  scrimTop: 'rgba(0, 0, 0, 0.45)',
  scrimBottom: 'rgba(0, 0, 0, 0.72)',
  textShadow: 'rgba(0, 0, 0, 0.6)',
  onVideo: '#FFFFFF',
  onVideoPlate: 'rgba(255, 255, 255, 0.16)',
} as const;

export const lightColors: Palette = {
  background: '#F4F3F0',
  surface: '#FFFFFF',
  surfaceMuted: '#ECEDEF',
  surfaceRaised: '#ECEDEF',
  hover: 'rgba(26, 26, 26, 0.05)',
  border: '#ECEBE7',
  fieldBorder: '#8E8578',
  tabBar: '#FFFFFF',
  tabBarBorder: 'rgba(0, 0, 0, 0)',

  text: '#1A1A1A',
  textSecondary: '#4A4F57',
  textMuted: '#6B6459',
  iconInactive: '#6B6459',
  accentText: '#3A3FD4',

  accent: '#1A1A1A',
  onAccent: '#FFFFFF',
  accentSoft: 'rgba(58, 63, 212, 0.10)',
  accentSoftText: '#2A2EA8',
  spark: '#1A1A1A',
  primary: '#1A1A1A',
  primaryPressed: '#000000',
  onPrimary: '#FFFFFF',
  primaryText: '#1A1A1A',
  brand: '#3A3FD4',
  onBrand: '#FFFFFF',
  chartBar: '#8E8578',
  online: '#1DB954',
  heroCard: '#1A1A1A',
  onHeroCard: '#FFFFFF',
  heroMuted: '#B5AC9D',
  heroLine: '#4A443B',

  positive: '#0A7258',
  negative: '#C2382B',
  positiveSoft: 'rgba(10, 114, 88, 0.10)',
  negativeSoft: 'rgba(194, 56, 43, 0.10)',
  like: '#1A1A1A',
  destructive: '#C2382B',
  ...overVideo,
};

export const darkColors: Palette = {
  background: '#121110',
  surface: '#1C1A17',
  surfaceMuted: '#26231F',
  surfaceRaised: '#26231F',
  hover: 'rgba(245, 241, 232, 0.06)',
  border: '#2E2A24',
  fieldBorder: '#6B6459',
  tabBar: '#1A1A1A',
  tabBarBorder: '#2A2622',

  text: '#F5F1E8',
  textSecondary: '#CFC6B6',
  textMuted: '#A39A8B',
  iconInactive: '#8E8578',
  accentText: '#9A9EF7',

  accent: '#F5F1E8',
  onAccent: '#1A1A1A',
  accentSoft: 'rgba(154, 158, 247, 0.16)',
  accentSoftText: '#B9BCFA',
  spark: '#F5F1E8',
  primary: '#F5F1E8',
  primaryPressed: '#FFFFFF',
  onPrimary: '#1A1A1A',
  primaryText: '#F5F1E8',
  brand: '#4A4FDC',
  onBrand: '#FFFFFF',
  chartBar: '#8E8578',
  online: '#1DB954',
  heroCard: '#2A2621',
  onHeroCard: '#F5F1E8',
  heroMuted: '#B5AC9D',
  heroLine: '#5A5246',

  positive: '#3DD6A4',
  negative: '#FF7A6B',
  positiveSoft: 'rgba(61, 214, 164, 0.14)',
  negativeSoft: 'rgba(255, 122, 107, 0.14)',
  like: '#F5F1E8',
  destructive: '#FF7A6B',
  ...overVideo,
};

export type ColorScheme = 'light' | 'dark';

export const palettes: Readonly<Record<ColorScheme, Palette>> = {
  light: lightColors,
  dark: darkColors,
};

/** The silver of the design: round buttons, the follow badge, the top cards. Same in both schemes. */
export const silver = {
  colors: ['#F7F8FA', '#C9CDD3', '#F1F2F4', '#A9AEB6'],
  locations: [0, 0.4, 0.56, 1],
  /** The grey of the Aura coin on a dark ground. */
  coin: '#C7CBD1',
  /** The gold of the rarest cards and the first place. */
  gold: '#E8B04B',
} as const;

/** First, second and third place. */
export const medals = ['#E8B04B', '#C3C8D2', '#E3955E'] as const;
