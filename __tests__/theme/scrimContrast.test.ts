import { darkColors, MIN_TOUCH_TARGET, scrim, spacing } from '../../src/theme';
import { contrast, parseRgba, rgb, type Rgb } from '../../test-utils/colorMath';

/** White text over the worst case: a pure white video under the dark fade at the bottom. */
const BOTTOM_ALPHA = parseRgba(darkColors.scrimBottom)[3];

/** Opacity of the bottom fade at a given distance (points) from the bottom edge of the video. */
const fadeAlphaAt = (distanceFromBottom: number): number => {
  const stops = [0, 1, 2].map((i) => ({
    at: scrim.locations[i]!,
    alpha: parseRgba([darkColors.scrimClear, darkColors.scrimMid, darkColors.scrimBottom][i]!)[3],
  }));
  const t = 1 - distanceFromBottom / scrim.bottomHeight; // 0 at the top of the fade, 1 at the bottom
  for (let i = 1; i < stops.length; i += 1) {
    if (t <= stops[i]!.at) {
      const [from, to] = [stops[i - 1]!, stops[i]!];
      return from.alpha + ((to.alpha - from.alpha) * (t - from.at)) / (to.at - from.at);
    }
  }
  return stops[stops.length - 1]!.alpha;
};

const overWhite = (alpha: number): Rgb => [255 * (1 - alpha), 255 * (1 - alpha), 255 * (1 - alpha)];

/** Roughly how far above the bottom edge the top of the action rail reaches. */
const RAIL_TOP = spacing.lg + 3 * MIN_TOUCH_TARGET + 2 * spacing.md;

describe('text over the fade at the bottom of a video', () => {
  const text = rgb(darkColors.onVideo);

  test('the fade becomes dark towards the bottom edge', () => {
    expect(fadeAlphaAt(0)).toBeCloseTo(BOTTOM_ALPHA);
    expect(fadeAlphaAt(scrim.bottomHeight)).toBe(0);
  });

  test('the title stays readable (4.5:1) over a white video', () => {
    expect(contrast(text, overWhite(fadeAlphaAt(spacing.lg + 40)))).toBeGreaterThanOrEqual(4.5);
  });

  test('the counts low on the action rail stay readable (3:1, large bold figures) over white', () => {
    expect(
      contrast(text, overWhite(fadeAlphaAt(spacing.lg + MIN_TOUCH_TARGET))),
    ).toBeGreaterThanOrEqual(3);
    expect(RAIL_TOP).toBeGreaterThan(0);
  });
});
