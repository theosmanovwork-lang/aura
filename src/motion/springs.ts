import { Platform } from 'react-native';

/** Native driver is not there on the web. */
export const NATIVE = Platform.OS !== 'web';

/** Springs with a little overshoot, the way Disney draws a bounce: fast out, past the mark, settle. */
export const SPRING = {
  /** A press that squashes and comes back. */
  press: { speed: 40, bounciness: 14 },
  /** A pop that overshoots (a coin, a badge, a tab icon). */
  pop: { speed: 18, bounciness: 18 },
  /** Something arriving on the screen. */
  enter: { speed: 12, bounciness: 8 },
} as const;

export const PRESS_SCALE = 0.92;
/** Entrance of the rows of a list: each one waits this long more than the one before, up to the cap. */
export const STAGGER_MS = 45;
export const STAGGER_CAP = 8;
