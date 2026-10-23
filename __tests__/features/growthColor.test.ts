import { growthColor } from '../../src/features/trends/growthColor';
import { darkColors as colors } from '../../src/theme';

describe('growthColor', () => {
  test.each([
    [12, colors.positive],
    [-3, colors.negative],
    [0, colors.textMuted],
    [null, colors.textMuted],
  ])('%p -> %s', (percent, expected) => {
    expect(growthColor(percent, colors)).toBe(expected);
  });
});
