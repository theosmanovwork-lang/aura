import { act, render, screen } from '@testing-library/react-native';

import { LaunchSplash, SPLASH_MS } from '../../src/features/launch/LaunchSplash';
import { ru } from '../../src/i18n/ru';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('LaunchSplash', () => {
  test('shows the word, the tagline and the loading bar', async () => {
    await render(<LaunchSplash ready onDone={jest.fn()} />);

    expect(screen.getByText('aura')).toBeTruthy();
    expect(screen.getByText(ru.brand.tagline)).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: ru.brand.loading })).toBeTruthy();
  });

  test('is over only after the bar has filled and the app is ready', async () => {
    const onDone = jest.fn();
    const { rerender } = await render(<LaunchSplash ready={false} onDone={onDone} />);

    await act(async () => {
      jest.advanceTimersByTime(SPLASH_MS + 1000);
    });
    expect(onDone).not.toHaveBeenCalled();

    await rerender(<LaunchSplash ready onDone={onDone} />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test('does not finish before the bar is full even if the app is ready at once', async () => {
    const onDone = jest.fn();
    await render(<LaunchSplash ready onDone={onDone} />);

    await act(async () => {
      jest.advanceTimersByTime(SPLASH_MS / 2);
    });

    expect(onDone).not.toHaveBeenCalled();
  });
});
