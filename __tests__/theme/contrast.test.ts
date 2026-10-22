import { colors, iconSizes, MIN_TOUCH_TARGET, radii, spacing, typography } from '../../src/theme';

/** WCAG 2.x relative luminance and contrast ratio of two #RRGGBB colors. */
const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
};
const contrast = (a: string, b: string): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
};

const TEXT_MIN = 4.5; // WCAG AA for normal text
const GRAPHIC_MIN = 3; // WCAG AA for icons and large graphics

describe('colors: readable text (AA 4.5:1)', () => {
  test.each([
    ['text', colors.text, colors.background],
    ['text', colors.text, colors.surface],
    ['text', colors.text, colors.surfaceRaised],
    ['textMuted', colors.textMuted, colors.background],
    ['textMuted', colors.textMuted, colors.surface],
    ['textMuted', colors.textMuted, colors.surfaceRaised],
    ['primaryText', colors.primaryText, colors.background],
    ['primaryText', colors.primaryText, colors.surface],
    ['text on primary fills', colors.text, colors.primary],
    ['text on pressed primary', colors.text, colors.primaryPressed],
    ['onAccent on accent fills', colors.onAccent, colors.accent],
    ['accent text', colors.accent, colors.background],
    ['accent text', colors.accent, colors.surface],
    ['positive', colors.positive, colors.surface],
    ['negative', colors.negative, colors.surface],
  ])('%s %s on %s', (_name, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(TEXT_MIN);
  });
});

describe('colors: visible icons and chart parts (3:1)', () => {
  test.each([
    ['iconInactive on background', colors.iconInactive, colors.background],
    ['iconInactive on surface', colors.iconInactive, colors.surface],
    ['accent on surface', colors.accent, colors.surface],
    ['like on background', colors.like, colors.background],
    ['border on background', colors.border, colors.background, 1.1],
  ])('%s', (_name, foreground, background, minimum = GRAPHIC_MIN) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(minimum);
  });
});

describe('colors: roles', () => {
  test('indigo is the main color and gold the accent', () => {
    expect(colors.primary).toBe('#4F46E5');
    expect(colors.accent).toBe('#FBBF24');
  });

  test('sparks (the currency) use the accent gold', () => {
    expect(colors.spark).toBe(colors.accent);
  });

  test('every color is a valid CSS color string', () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^(#[0-9A-Fa-f]{6}|rgba\(\s*\d+,\s*\d+,\s*\d+,\s*[\d.]+\s*\))$/);
    }
  });

  test('the scrim fades from clear to dark with the same base color', () => {
    expect(colors.scrimClear).toMatch(/^rgba\(14, 11, 26, 0\)$/);
    expect(colors.scrimBottom).toMatch(/^rgba\(14, 11, 26, 0\.\d+\)$/);
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
  });

  test('spacing keeps the old steps and adds a 2-point step and a screen gutter', () => {
    expect([spacing.xs, spacing.sm, spacing.md, spacing.lg, spacing.xl]).toEqual([
      4, 8, 16, 24, 32,
    ]);
    expect(spacing.xxs).toBe(2);
    expect(spacing.gutter).toBe(16);
  });

  test('the type scale has the planned sizes', () => {
    expect(typography.display.fontSize).toBe(44);
    expect(typography.title.fontSize).toBe(28);
    expect(typography.heading.fontSize).toBe(20);
    expect(typography.body.fontSize).toBe(16);
    expect(typography.bodyStrong.fontWeight).toBe('700');
    expect(typography.caption.fontSize).toBe(12);
    expect(typography.tabLabel.fontSize).toBe(11);
  });

  test('text is never smaller than 11 points', () => {
    for (const style of Object.values(typography)) {
      expect(style.fontSize).toBeGreaterThanOrEqual(11);
    }
  });
});
