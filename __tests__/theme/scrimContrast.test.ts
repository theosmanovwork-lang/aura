import { colors, MIN_TOUCH_TARGET, scrim, spacing } from '../../src/theme';

/** Light text over the worst case: a pure white video under the dark fade at the bottom. */

const luminance = (rgb: readonly number[]): number => {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb[0]!) + 0.7152 * channel(rgb[1]!) + 0.0722 * channel(rgb[2]!);
};
const contrast = (a: readonly number[], b: readonly number[]): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};
const parseRgba = (value: string): [number, number, number, number] => {
  const [r, g, b, a] = value.match(/[\d.]+/g)!.map(Number);
  return [r!, g!, b!, a!];
};
const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/** Opacity of the bottom fade at a given distance (points) from the bottom edge of the video. */
const fadeAlphaAt = (distanceFromBottom: number): number => {
  const stops = [0, 1, 2].map((i) => ({
    at: scrim.locations[i]!,
    alpha: parseRgba([colors.scrimClear, colors.scrimMid, colors.scrimBottom][i]!)[3],
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

const overWhite = (alpha: number): [number, number, number] => {
  const [r, g, b] = parseRgba(colors.scrimBottom);
  return [
    255 * (1 - alpha) + r * alpha,
    255 * (1 - alpha) + g * alpha,
    255 * (1 - alpha) + b * alpha,
  ];
};

/** Roughly how far above the bottom edge the top of the two-item action rail reaches. */
const RAIL_TOP = spacing.lg + 2 * MIN_TOUCH_TARGET + spacing.md;

describe('text over the fade at the bottom of a video', () => {
  const text = hexToRgb(colors.text);

  test('the fade becomes opaque towards the bottom edge', () => {
    expect(fadeAlphaAt(0)).toBeCloseTo(0.88);
    expect(fadeAlphaAt(scrim.bottomHeight)).toBe(0);
  });

  test('the counts at the top of the action rail stay readable (4.5:1) over a white video', () => {
    expect(contrast(text, overWhite(fadeAlphaAt(RAIL_TOP)))).toBeGreaterThanOrEqual(4.5);
  });

  test('the title stays readable over a white video', () => {
    expect(contrast(text, overWhite(fadeAlphaAt(spacing.lg + 40)))).toBeGreaterThanOrEqual(7);
  });
});
