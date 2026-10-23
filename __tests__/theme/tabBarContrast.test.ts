import { colors } from '../../src/theme';

/** The open tab's name is gold text on a gold tint, over the pill (surface). */

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const blend = (overlay: string, base: string): [number, number, number] => {
  const [r, g, b, a] = overlay.match(/[\d.]+/g)!.map(Number);
  const [br, bg, bb] = rgb(base);
  return [r! * a! + br * (1 - a!), g! * a! + bg * (1 - a!), b! * a! + bb * (1 - a!)];
};
const luminance = ([r, g, b]: readonly number[]): number => {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
};
const contrast = (a: readonly number[], b: readonly number[]): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

describe('floating tab bar colors', () => {
  test('gold name on the gold tint over the pill is readable (4.5:1)', () => {
    const tint = blend(colors.accentSoft, colors.surface);
    expect(contrast(rgb(colors.accent), tint)).toBeGreaterThanOrEqual(4.5);
  });

  test('inactive icons on the pill are visible (3:1 for graphics)', () => {
    expect(contrast(rgb(colors.iconInactive), rgb(colors.surface))).toBeGreaterThanOrEqual(3);
  });

  test('the pill stands out from the page behind it', () => {
    expect(contrast(rgb(colors.border), rgb(colors.background))).toBeGreaterThan(1);
  });
});

describe('glass pill over the brightest page', () => {
  /** The blur lets the page show through, so the worst case is a white page behind the glass. */
  const worstCase = blend(colors.glassFill, '#FFFFFF');

  test('inactive icons stay visible (3:1 for graphics)', () => {
    expect(contrast(rgb(colors.iconInactive), worstCase)).toBeGreaterThanOrEqual(3);
  });

  test('the open tab name keeps its contrast on the gold tint (4.5:1)', () => {
    const tint = blend(
      colors.accentSoft,
      `#${worstCase.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`,
    );
    expect(contrast(rgb(colors.accent), tint)).toBeGreaterThanOrEqual(4.5);
  });
});
