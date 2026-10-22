import { iconSizes, TAB_BAR_HEIGHT, typography } from '../../src/theme';

describe('tab bar size', () => {
  test('fits an icon, a label and some air', () => {
    expect(TAB_BAR_HEIGHT).toBeGreaterThanOrEqual(iconSizes.md + typography.tabLabel.fontSize + 16);
  });

  test('is 56 points before the safe area under it is added', () => {
    expect(TAB_BAR_HEIGHT).toBe(56);
  });
});
