import { lightColors as c } from '../../src/theme';

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const channel = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
};
const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

describe('light palette: readable text (AA 4.5:1)', () => {
  test.each([
    ['text on background', c.text, c.background],
    ['text on surface', c.text, c.surface],
    ['text on muted surface', c.text, c.surfaceMuted],
    ['textMuted on background', c.textMuted, c.background],
    ['textMuted on surface', c.textMuted, c.surface],
    ['textMuted on muted surface', c.textMuted, c.surfaceMuted],
    ['onPrimary on primary', c.onPrimary, c.primary],
    ['primary soft text on its fill', c.primarySoftText, c.primarySoft],
    ['accent soft text on its fill', c.accentSoftText, c.accentSoft],
    ['positive on its fill', c.positive, c.positiveSoft],
    ['negative on its fill', c.negative, c.negativeSoft],
    ['positive on surface', c.positive, c.surface],
    ['negative on surface', c.negative, c.surface],
    ['onAlert on alert', c.onAlert, c.alert],
  ])('%s', (_name, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('light palette: visible icons (3:1)', () => {
  test('inactive icons on the page and on cards', () => {
    expect(contrast(c.iconInactive, c.background)).toBeGreaterThanOrEqual(3);
    expect(contrast(c.iconInactive, c.surface)).toBeGreaterThanOrEqual(3);
  });
});

describe('light palette: chart and badges', () => {
  test('chart bars are visible against a card (3:1 for graphics)', () => {
    expect(contrast(c.chartBar, c.surface)).toBeGreaterThanOrEqual(3);
    expect(contrast(c.primary, c.surface)).toBeGreaterThanOrEqual(3);
  });

  test('pressed primary button keeps white text readable', () => {
    expect(contrast(c.onPrimary, c.primaryPressed)).toBeGreaterThanOrEqual(4.5);
  });
});
