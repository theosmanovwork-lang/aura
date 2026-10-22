import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Button } from '../../src/components/Button';
import { lightColors as colors, MIN_TOUCH_TARGET } from '../../src/theme';

const styleOf = (el: { props: { style?: unknown } }) =>
  StyleSheet.flatten(el.props.style as never) as Record<string, unknown>;

describe('Button', () => {
  test('shows its label and calls the handler when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button label="Готово" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Готово' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does nothing when disabled and says so to screen readers', async () => {
    const onPress = jest.fn();
    await render(<Button label="Готово" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Готово' });
    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
  });

  test('is at least 44 points high', async () => {
    await render(<Button label="Готово" onPress={jest.fn()} testID="b" />);

    expect(styleOf(screen.getByTestId('b')).minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('the main button is indigo, the option chip is quiet and a chosen chip gets an indigo edge', async () => {
    await render(
      <>
        <Button label="Главная" onPress={jest.fn()} testID="main" />
        <Button label="Вариант" variant="chip" onPress={jest.fn()} testID="chip" />
        <Button label="Выбран" variant="chip" selected onPress={jest.fn()} testID="chosen" />
      </>,
    );

    expect(styleOf(screen.getByTestId('main')).backgroundColor).toBe(colors.primary);
    expect(styleOf(screen.getByTestId('chip')).backgroundColor).toBe(colors.surfaceMuted);
    expect(styleOf(screen.getByTestId('chosen')).borderColor).toBe(colors.primary);
    expect(screen.getByTestId('chosen').props.accessibilityState).toMatchObject({ selected: true });
  });
});
