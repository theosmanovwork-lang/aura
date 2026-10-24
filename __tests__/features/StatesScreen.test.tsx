import { fireEvent, render, screen } from '@testing-library/react-native';

import { StatesScreen } from '../../src/features/states/StatesScreen';
import { ru } from '../../src/i18n/ru';

describe('StatesScreen', () => {
  test('shows every state of the design', async () => {
    await render(<StatesScreen onBack={jest.fn()} />);

    for (const id of [
      'states-skeleton',
      'states-empty',
      'states-error',
      'offline-banner',
      'toast-outbid',
    ]) {
      expect(screen.getByTestId(id)).toBeTruthy();
    }
    expect(screen.getByText(ru.states.offline)).toBeTruthy();
    expect(screen.getByText(ru.states.accepted)).toBeTruthy();
  });

  test('the busy «auction ended» button is switched off and back works', async () => {
    const onBack = jest.fn();
    await render(<StatesScreen onBack={onBack} />);

    expect(
      screen.getByRole('button', { name: ru.states.ended }).props.accessibilityState.disabled,
    ).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: ru.common.back }));
    expect(onBack).toHaveBeenCalled();
  });

  test('toast buttons run their action', async () => {
    const { Toast } = jest.requireActual('../../src/components/Toast');
    const run = jest.fn();
    await render(
      <Toast
        title="a"
        sub="b"
        icon="check"
        iconBg="#fff"
        iconInk="#000"
        action={{ label: 'Go', run }}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Go' }));

    expect(run).toHaveBeenCalled();
  });
});
