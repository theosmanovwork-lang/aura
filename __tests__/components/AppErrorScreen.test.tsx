import { fireEvent, render, screen } from '@testing-library/react-native';

import { AppErrorScreen } from '../../src/components/AppErrorScreen';
import { ru } from '../../src/i18n/ru';

describe('AppErrorScreen', () => {
  test('shows a calm Russian message and hides the error details', async () => {
    await render(<AppErrorScreen error={new Error('secret stack detail')} retry={jest.fn()} />);

    expect(screen.getByText(ru.app.crash)).toBeTruthy();
    expect(screen.queryByText(/secret stack detail/)).toBeNull();
  });

  test('the retry button tries the screen again', async () => {
    const retry = jest.fn().mockResolvedValue(undefined);
    await render(<AppErrorScreen error={new Error('boom')} retry={retry} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
