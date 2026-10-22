import { colors } from '../../src/theme';

/** The growth pills tint the card behind the text, so the text is checked over the blended color. */

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const parseRgba = (value: string): [number, number, number, number] => {
  const [r, g, b, a] = value.match(/[\d.]+/g)!.map(Number);
  return [r!, g!, b!, a!];
};
const blend = (overlay: string, base: string): [number, number, number] => {
  const [r, g, b, a] = parseRgba(overlay);
  const [br, bg, bb] = rgb(base);
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
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

describe('growth pill colors', () => {
  test.each([
    ['positive text on its pill over a card', colors.positive, colors.positiveSoft, colors.surface],
    ['negative text on its pill over a card', colors.negative, colors.negativeSoft, colors.surface],
  ])('%s is readable (4.5:1)', (_name, text, pill, card) => {
    expect(contrast(rgb(text), blend(pill, card))).toBeGreaterThanOrEqual(4.5);
  });

  test('muted text on the neutral pill is readable', () => {
    expect(contrast(rgb(colors.textMuted), rgb(colors.surfaceRaised))).toBeGreaterThanOrEqual(4.5);
  });

  test('the rank number on the gold badge is readable', () => {
    expect(contrast(rgb(colors.onAccent), rgb(colors.accent))).toBeGreaterThanOrEqual(4.5);
  });

  test('the soft tints are see-through colors', () => {
    for (const tint of [colors.positiveSoft, colors.negativeSoft]) {
      expect(tint).toMatch(/^rgba\(\d+, \d+, \d+, 0?\.\d+\)$/);
    }
  });

  test('chart bars are visible against the card they sit on (3:1 for graphics)', () => {
    expect(contrast(rgb(colors.chartBar), rgb(colors.surface))).toBeGreaterThanOrEqual(3);
  });
});
