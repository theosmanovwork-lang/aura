import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AmountPad } from '../../src/features/market/AmountPad';
import { ru } from '../../src/i18n/ru';
import { MIN_TOUCH_TARGET } from '../../src/theme';

const press = async (digits: string) => {
  for (const digit of digits) {
    await fireEvent.press(screen.getByRole('button', { name: digit }));
  }
};

const renderPad = async (props: Partial<Parameters<typeof AmountPad>[0]> = {}) => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  await render(
    <AmountPad
      mode="invest"
      min={10}
      max={500}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onConfirm, onCancel };
};

describe('AmountPad', () => {
  test('builds the amount from the digits and shows it', async () => {
    await renderPad();

    await press('250');

    expect(screen.getByTestId('pad-amount')).toHaveTextContent('250');
  });

  test('ignores a leading zero and more than six digits', async () => {
    await renderPad();

    await press('0');
    expect(screen.getByTestId('pad-amount')).toHaveTextContent('0');
    await press('1234567890');

    expect(screen.getByTestId('pad-amount').props.children).toMatch(/^\d{1,6}$/);
    expect(String(screen.getByTestId('pad-amount').props.children).startsWith('0')).toBe(false);
  });

  test('the delete key removes the last digit', async () => {
    await renderPad();
    await press('123');

    await fireEvent.press(screen.getByRole('button', { name: ru.market.pad.deleteDigit }));

    expect(screen.getByTestId('pad-amount')).toHaveTextContent('12');
  });

  test('putting in: confirm is off below the minimum and above the maximum, on in between', async () => {
    await renderPad({ mode: 'invest', min: 10, max: 500 });
    const confirm = () => screen.getByTestId('pad-confirm');

    expect(confirm().props.accessibilityState.disabled).toBe(true);
    await press('9');
    expect(confirm().props.accessibilityState.disabled).toBe(true);
    await press('0');
    expect(confirm().props.accessibilityState.disabled).toBe(false);
    await press('00');
    expect(confirm().props.accessibilityState.disabled).toBe(true);
  });

  test('taking: any whole amount up to the most that can be taken', async () => {
    await renderPad({ mode: 'take', min: 1, max: 40 });
    const confirm = () => screen.getByTestId('pad-confirm');

    await press('1');
    expect(confirm().props.accessibilityState.disabled).toBe(false);
    await press('0');
    await press('0');
    expect(confirm().props.accessibilityState.disabled).toBe(true);
  });

  test('confirming hands over the whole amount and names it on the button', async () => {
    const { onConfirm } = await renderPad();
    await press('120');

    expect(screen.getByTestId('pad-confirm')).toHaveTextContent('Вложить 120 Аура', {
      exact: false,
    });
    await fireEvent.press(screen.getByTestId('pad-confirm'));

    expect(onConfirm).toHaveBeenCalledWith(120);
  });

  test('says which limit applies', async () => {
    await renderPad({ mode: 'invest', min: 10, max: 500 });
    expect(screen.getByText(ru.market.pad.min.replace('{min}', '10'))).toBeTruthy();
  });

  test('shows the most that can be taken when taking', async () => {
    await renderPad({ mode: 'take', min: 1, max: 40 });

    expect(screen.getByText(ru.market.pad.takable.replace('{max}', '40'))).toBeTruthy();
    expect(screen.getByTestId('pad-confirm')).toHaveTextContent('Забрать', { exact: false });
  });

  test('cancel closes the pad and a busy pad cannot be confirmed twice', async () => {
    const { onCancel } = await renderPad({ pending: true });
    await press('50');

    expect(screen.getByTestId('pad-confirm').props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: ru.market.actions.cancel }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('every key is at least 44 points big', async () => {
    await renderPad();

    for (const name of ['1', '5', '0', ru.market.pad.deleteDigit]) {
      const style = StyleSheet.flatten(screen.getByRole('button', { name }).props.style);
      expect(style.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      expect(style.minWidth ?? style.flexBasis ?? style.width).toBeDefined();
    }
  });
});
