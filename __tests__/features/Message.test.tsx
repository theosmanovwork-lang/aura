import { fireEvent, render, screen } from '@testing-library/react-native';

import { Message } from '../../src/components/Message';

describe('Message', () => {
  test('shows the text', async () => {
    await render(<Message text="Привет" />);

    expect(screen.getByText('Привет')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('shows a button that runs the action', async () => {
    const run = jest.fn();
    await render(<Message text="Ошибка" action={{ label: 'Повторить', run }} />);

    await fireEvent.press(screen.getByText('Повторить'));

    expect(run).toHaveBeenCalledTimes(1);
  });
});
