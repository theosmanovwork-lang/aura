import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { demoChestCount } from '../../src/data/seed/demoShop';
import { ChestScreen, FLASH_MS } from '../../src/features/chest/ChestScreen';
import { ru } from '../../src/i18n/ru';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const open = async () => {
  const onClose = jest.fn();
  await render(<ChestScreen onClose={onClose} />);
  return onClose;
};

const flash = async () => {
  await fireEvent.press(screen.getByTestId('chest-open'));
  await act(async () => {
    jest.advanceTimersByTime(FLASH_MS);
  });
};

describe('ChestScreen', () => {
  test('starts closed and shows the odds of every rarity (they must be visible)', async () => {
    await open();

    expect(screen.getByTestId('chest-closed')).toBeTruthy();
    expect(screen.getByText(ru.chest.odds)).toBeTruthy();
    for (const percent of ['60%', '28%', '11%', '1%']) {
      expect(screen.getByText(percent)).toBeTruthy();
    }
    expect(
      screen.getByText(
        ru.chest.counter.replace('{n}', '1').replace('{total}', String(demoChestCount)),
      ),
    ).toBeTruthy();
  });

  test('opening starts the flash, and after 0.8 s the reward shows', async () => {
    await open();

    await fireEvent.press(screen.getByTestId('chest-open'));
    expect(screen.getByTestId('chest-flash')).toBeTruthy();
    expect(screen.getByText(ru.chest.flash)).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(FLASH_MS);
    });
    expect(screen.getByTestId('chest-reward')).toBeTruthy();
    expect(screen.getByTestId('chest-card')).toBeTruthy();
  });

  test('«Открыть ещё» goes to the next chest; the last chest has none left', async () => {
    await open();

    await flash();
    expect(screen.getByText(ru.chest.more.replace('{n}', '2'))).toBeTruthy();
    await fireEvent.press(screen.getByTestId('chest-more'));
    expect(screen.getByTestId('chest-closed')).toBeTruthy();
    expect(
      screen.getByText(ru.chest.counter.replace('{n}', '2').replace('{total}', '3')),
    ).toBeTruthy();

    await flash();
    await fireEvent.press(screen.getByTestId('chest-more'));
    await flash();
    expect(screen.getByTestId('chest-more').props.accessibilityState.disabled).toBe(true);
  });

  test('«Забрать в коллекцию» on the last chest closes the screen', async () => {
    const onClose = await open();

    for (let i = 0; i < demoChestCount; i += 1) {
      await flash();
      await fireEvent.press(screen.getByTestId('chest-keep'));
    }

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('the close button closes the screen', async () => {
    const onClose = await open();

    await fireEvent.press(screen.getByTestId('chest-close'));

    expect(onClose).toHaveBeenCalled();
  });
});
