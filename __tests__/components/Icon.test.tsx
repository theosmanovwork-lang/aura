import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Icon } from '../../src/components/Icon';
import { colors, iconSizes } from '../../src/theme';

describe('Icon', () => {
  test('draws the named icon', async () => {
    await render(<Icon name="heart" testID="icon" />);

    expect(screen.getByTestId('icon', { hidden: true })).toBeTruthy();
  });

  test('uses the medium size and the text color by default', async () => {
    await render(<Icon name="heart" testID="icon" />);

    const style = StyleSheet.flatten(screen.getByTestId('icon', { hidden: true }).props.style);
    expect(style.fontSize).toBe(iconSizes.md);
    expect(style.color).toBe(colors.text);
  });

  test('takes a custom size and color', async () => {
    await render(<Icon name="heart" size={iconSizes.lg} color={colors.like} testID="icon" />);

    const style = StyleSheet.flatten(screen.getByTestId('icon', { hidden: true }).props.style);
    expect(style.fontSize).toBe(iconSizes.lg);
    expect(style.color).toBe(colors.like);
  });

  test('is hidden from screen readers (the button around it carries the label)', async () => {
    await render(<Icon name="heart" testID="icon" />);

    expect(screen.getByTestId('icon', { hidden: true }).props.accessibilityElementsHidden).toBe(
      true,
    );
    expect(screen.getByTestId('icon', { hidden: true }).props.importantForAccessibility).toBe(
      'no-hide-descendants',
    );
  });
});
