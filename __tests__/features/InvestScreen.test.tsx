import { fireEvent, render, screen } from '@testing-library/react-native';

import { buyCost, sellNet, sharePrice } from '../../src/domain/shares';
import { InvestScreen } from '../../src/features/invest/InvestScreen';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';

const money = (n: number) => formatPoints(Math.round(n));
const renderInvest = (onClose = jest.fn()) =>
  render(<InvestScreen author="mira.wav" title="Закат на крыше" onClose={onClose} />).then(
    () => onClose,
  );

describe('InvestScreen', () => {
  test('shows the share price of the curve, the stats and your position', async () => {
    await renderInvest();

    expect(screen.getByTestId('share-price')).toHaveTextContent(money(sharePrice(640)), {
      exact: false,
    });
    expect(screen.getByTestId('stat-sold')).toHaveTextContent('640');
    expect(screen.getByTestId('position')).toHaveTextContent('25 долей', { exact: false });
    expect(screen.getByText('mira.wav · Закат на крыше')).toBeTruthy();
  });

  test('the total follows the count: ten shares at the start cost what the curve says', async () => {
    await renderInvest();

    expect(screen.getByTestId('invest-count')).toHaveTextContent('10');
    expect(screen.getByTestId('invest-total')).toHaveTextContent(money(buyCost(10, 640)), {
      exact: false,
    });

    await fireEvent.press(screen.getByTestId('invest-more'));
    expect(screen.getByTestId('invest-count')).toHaveTextContent('11');
    await fireEvent.press(screen.getByTestId('invest-fewer'));
    await fireEvent.press(screen.getByTestId('invest-fewer'));
    expect(screen.getByTestId('invest-count')).toHaveTextContent('9');
  });

  test('the count never goes below one', async () => {
    await renderInvest();

    await fireEvent.press(screen.getByTestId('invest-quick-1'));
    await fireEvent.press(screen.getByTestId('invest-fewer'));

    expect(screen.getByTestId('invest-count')).toHaveTextContent('1');
  });

  test('buying moves the price up and the position grows', async () => {
    await renderInvest();

    await fireEvent.press(screen.getByTestId('invest-confirm'));

    expect(screen.getByText(ru.invest.cta.done.replace('{msg}', 'Куплено 10 долей'))).toBeTruthy();
    expect(screen.getByTestId('stat-sold')).toHaveTextContent('650');
    expect(screen.getByTestId('share-price')).toHaveTextContent(money(sharePrice(650)), {
      exact: false,
    });
    expect(screen.getByTestId('position')).toHaveTextContent('35 долей', { exact: false });
  });

  test('selling shows what you get after the 5% fee and takes shares out', async () => {
    await renderInvest();
    await fireEvent.press(screen.getByTestId('invest-mode-sell'));

    expect(screen.getByText(ru.invest.getNet)).toBeTruthy();
    expect(screen.getByTestId('invest-total')).toHaveTextContent(money(sellNet(10, 640)), {
      exact: false,
    });

    await fireEvent.press(screen.getByTestId('invest-confirm'));

    expect(screen.getByText(ru.invest.cta.done.replace('{msg}', 'Продано 10 долей'))).toBeTruthy();
    expect(screen.getByTestId('position')).toHaveTextContent('15 долей', { exact: false });
  });

  test('«Макс» when selling is everything you hold', async () => {
    await renderInvest();
    await fireEvent.press(screen.getByTestId('invest-mode-sell'));

    await fireEvent.press(screen.getByTestId(`invest-quick-${ru.invest.max}`));

    expect(screen.getByTestId('invest-count')).toHaveTextContent('25');
  });

  test('after selling everything the sell button is switched off', async () => {
    await renderInvest();
    await fireEvent.press(screen.getByTestId('invest-mode-sell'));
    await fireEvent.press(screen.getByTestId(`invest-quick-${ru.invest.max}`));
    await fireEvent.press(screen.getByTestId('invest-confirm'));
    await fireEvent.press(screen.getByTestId('invest-mode-buy'));
    await fireEvent.press(screen.getByTestId('invest-mode-sell'));

    expect(screen.getByTestId('invest-confirm').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText(ru.invest.nothing)).toBeTruthy();
  });

  test('closing from the cross or from the dim area above calls onClose', async () => {
    const onClose = await renderInvest();

    await fireEvent.press(screen.getByTestId('invest-close'));
    await fireEvent.press(screen.getByTestId('invest-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
