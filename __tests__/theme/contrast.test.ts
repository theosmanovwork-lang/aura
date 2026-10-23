import {
  darkColors,
  iconSizes,
  lightColors,
  MIN_TOUCH_TARGET,
  palettes,
  radii,
  spacing,
  typography,
} from '../../src/theme';
import { blend, contrast, GRAPHIC_MIN, rgb, TEXT_MIN } from '../../test-utils/colorMath';

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
] as const)('%s palette: readable text (AA 4.5:1)', (_scheme, c) => {
  test.each([
    ['text', c.text, c.background],
    ['text', c.text, c.surface],
    ['text', c.text, c.surfaceMuted],
    ['textSecondary', c.textSecondary, c.background],
    ['textMuted', c.textMuted, c.background],
    ['textMuted', c.textMuted, c.surface],
    ['textMuted', c.textMuted, c.surfaceMuted],
    ['accentText', c.accentText, c.background],
    ['accentText', c.accentText, c.surface],
    ['primaryText', c.primaryText, c.background],
    ['onPrimary on primary fills', c.onPrimary, c.primary],
    ['onPrimary on pressed primary', c.onPrimary, c.primaryPressed],
    ['onAccent on accent fills', c.onAccent, c.accent],
    ['accent as text', c.accent, c.background],
    ['positive', c.positive, c.background],
    ['positive', c.positive, c.surface],
    ['negative', c.negative, c.background],
    ['negative', c.negative, c.surface],
    ['destructive', c.destructive, c.background],
  ])('%s %s on %s', (_name, foreground, background) => {
    expect(contrast(rgb(foreground), rgb(background))).toBeGreaterThanOrEqual(TEXT_MIN);
  });

  test.each([
    ['growth text on its pill over a card', c.positive, c.positiveSoft, c.surface],
    ['fall text on its pill over a card', c.negative, c.negativeSoft, c.surface],
    ['accent text on its soft fill', c.accentSoftText, c.accentSoft, c.background],
  ])('%s', (_name, text, pill, card) => {
    expect(contrast(rgb(text), blend(pill, card))).toBeGreaterThanOrEqual(TEXT_MIN);
  });
});

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
] as const)('%s palette: visible icons and chart parts (3:1)', (_scheme, c) => {
  test.each([
    ['iconInactive on background', c.iconInactive, c.background],
    ['iconInactive on surface', c.iconInactive, c.surface],
    ['accent on surface', c.accent, c.surface],
    ['like on background', c.like, c.background],
    ['chart bars on a card', c.chartBar, c.surface],
    ['field border on the page', c.fieldBorder, c.background],
  ])('%s', (_name, foreground, background) => {
    expect(contrast(rgb(foreground), rgb(background))).toBeGreaterThanOrEqual(GRAPHIC_MIN);
  });

  test('the dividing line is visible but quiet', () => {
    expect(contrast(rgb(c.border), rgb(c.background))).toBeGreaterThan(1.05);
  });
});

describe('palettes', () => {
  test('both palettes have the same set of colours', () => {
    expect(Object.keys(lightColors).sort()).toEqual(Object.keys(darkColors).sort());
    expect(palettes.light).toBe(lightColors);
    expect(palettes.dark).toBe(darkColors);
  });

  test('every colour is a valid CSS colour string', () => {
    for (const palette of [lightColors, darkColors]) {
      for (const value of Object.values(palette)) {
        expect(value).toMatch(/^(#[0-9A-Fa-f]{6}|rgba\(\s*\d+,\s*\d+,\s*\d+,\s*[\d.]+\s*\))$/);
      }
    }
  });

  test('white page in the light palette, black page in the dark one', () => {
    expect(lightColors.background).toBe('#FFFFFF');
    expect(darkColors.background).toBe('#000000');
  });

  test('the main button is blue in both palettes with white text on it', () => {
    for (const palette of [lightColors, darkColors]) {
      expect(palette.onPrimary).toBe('#FFFFFF');
      const [r, g, b] = rgb(palette.primary);
      expect(b).toBeGreaterThan(r);
      expect(b).toBeGreaterThan(g);
    }
  });

  test('growth is green and a fall is red in both palettes', () => {
    for (const palette of [lightColors, darkColors]) {
      const [pr, pg] = rgb(palette.positive);
      const [nr, ng] = rgb(palette.negative);
      expect(pg).toBeGreaterThan(pr);
      expect(nr).toBeGreaterThan(ng);
    }
  });

  test('the layers over video are the same in both palettes', () => {
    for (const key of [
      'overlay',
      'scrimClear',
      'scrimMid',
      'scrimTop',
      'scrimBottom',
      'onVideo',
    ] as const) {
      expect(lightColors[key]).toBe(darkColors[key]);
    }
    expect(darkColors.onVideo).toBe('#FFFFFF');
  });

  test('the scrim fades from clear to dark with the same base colour', () => {
    expect(darkColors.scrimClear).toMatch(/^rgba\(0, 0, 0, 0\)$/);
    expect(darkColors.scrimBottom).toMatch(/^rgba\(0, 0, 0, 0\.\d+\)$/);
  });
});

describe('sizes and typography', () => {
  test('a touch target is at least 44 points', () => {
    expect(MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(44);
  });

  test('icon sizes and corner radii grow step by step', () => {
    expect(iconSizes.sm).toBeLessThan(iconSizes.md);
    expect(iconSizes.md).toBeLessThan(iconSizes.lg);
    expect([radii.sm, radii.md, radii.lg, radii.xl]).toEqual([8, 12, 16, 24]);
    expect(radii.pill).toBeGreaterThan(radii.xl);
    expect([radii.control, radii.card, radii.panel]).toEqual([8, 10, 14]);
  });

  test('spacing keeps the old steps and adds a 2-point step and a screen gutter', () => {
    expect([spacing.xs, spacing.sm, spacing.md, spacing.lg, spacing.xl]).toEqual([
      4, 8, 16, 24, 32,
    ]);
    expect(spacing.xxs).toBe(2);
    expect(spacing.gutter).toBe(16);
  });

  test('the type scale (size / line height)', () => {
    const scale = (style: { fontSize: number; lineHeight: number }) =>
      `${style.fontSize}/${style.lineHeight}`;
    expect(scale(typography.display)).toBe('34/40');
    expect(scale(typography.title)).toBe('22/28');
    expect(scale(typography.heading)).toBe('17/24');
    expect(scale(typography.lead)).toBe('16/24');
    expect(scale(typography.body)).toBe('15/22');
    expect(scale(typography.bodySmall)).toBe('14/20');
    expect(scale(typography.titleSmall)).toBe('14/18');
    expect(scale(typography.caption)).toBe('12/16');
    expect(scale(typography.tabLabel)).toBe('10/14');
  });

  test('every number style has equal-width digits', () => {
    for (const style of [
      typography.figureDisplay,
      typography.figureXL,
      typography.figure,
      typography.figureSmall,
    ]) {
      expect(style.fontVariant).toEqual(['tabular-nums']);
    }
  });

  test('the own font of the phone is used: no text style names a font family', () => {
    for (const style of Object.values(typography)) {
      expect(style).not.toHaveProperty('fontFamily');
      expect(style).toHaveProperty('fontWeight');
    }
  });

  test('text is never smaller than 10 points', () => {
    for (const style of Object.values(typography)) {
      expect(style.fontSize).toBeGreaterThanOrEqual(10);
    }
  });
});
