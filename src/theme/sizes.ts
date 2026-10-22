export const radii = {
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
  fast: 150,
  normal: 250,
} as const;
