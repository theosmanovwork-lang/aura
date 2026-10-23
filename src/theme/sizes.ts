export const radii = {
  /** Prufbase: 8 for controls and chips, 10 for cards, 14 for large panels. */
  control: 8,
  card: 10,
  panel: 14,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const iconSizes = {
  sm: 20,
  md: 24,
  lg: 28,
  xl: 36,
} as const;

/** Fades over video that keep light text readable. Heights in points, `locations` are the stops. */
export const scrim = {
  topHeight: 120,
  bottomHeight: 280,
  locations: [0, 0.4, 1],
} as const;

/** Diameter of the round play button shown while a video is paused. */
export const PAUSE_BUTTON_SIZE = 72;

/** The smallest comfortable area for a finger, in points. */
export const MIN_TOUCH_TARGET = 44;

/** Height of the bottom tab bar without the safe area under it, in points. */
export const TAB_BAR_HEIGHT = 56;

export const durations = {
  /** Every colour, border and background change: 160 ms. */
  fast: 160,
  normal: 250,
} as const;

/**
 * The widest a column of content gets, in points. On a tablet or a wide browser window lists stay
 * a readable column in the middle instead of stretching edge to edge.
 */
export const CONTENT_MAX_WIDTH = 640;

/** Style for the content of a list or scroll view: full width on a phone, a centred column on wide screens. */
export const contentColumn = {
  width: '100%',
  maxWidth: CONTENT_MAX_WIDTH,
  alignSelf: 'center',
} as const;
