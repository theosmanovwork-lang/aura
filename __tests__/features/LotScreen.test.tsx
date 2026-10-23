import { fireEvent, render, screen } from '@testing-library/react-native';

import { demoLots } from '../../src/data/seed/demoCommunity';
import { LotScreen } from '../../src/features/lot/LotScreen';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';

const lot = demoLots[0]!;
const current = Number(lot.bid.replace(/\s/g, ''));

const renderLot = (lotId = lot.id, onBack = jest.fn()) =>
  render(<LotScreen lotId={lotId} onBack={onBack} />);

describe('LotScreen', () => {
  test('shows the card, the current bid and the lowest next bid', async () => {
    await renderLot();

    expect(screen.getByText(ru.lot.title.replace('{no}', lot.no))).toBeTruthy();
    expect(screen.getByTestId('lot-current-bid')).toHaveTextContent(lot.bid, { exact: false });
    expect(screen.getByTestId('bid-value')).toHaveTextContent(formatPoints(current + 100));
  });

  test('the plus and minus change the bid by 100, never below the lowest', async () => {
    await renderLot();

    await fireEvent.press(screen.getByTestId('bid-inc'));
    expect(screen.getByTestId('bid-value')).toHaveTextContent(formatPoints(current + 200));
    await fireEvent.press(screen.getByTestId('bid-dec'));
    await fireEvent.press(screen.getByTestId('bid-dec'));
    expect(screen.getByTestId('bid-value')).toHaveTextContent(formatPoints(current + 100));
  });

  test('the quick buttons add 100, 500 and 1 000', async () => {
    await renderLot();

    await fireEvent.press(screen.getByTestId('bid-add-500'));
    await fireEvent.press(screen.getByTestId('bid-add-1000'));

    expect(screen.getByTestId('bid-value')).toHaveTextContent(formatPoints(current + 100 + 1500));
  });

  test('placing a bid shows that it is accepted; changing it asks again', async () => {
    await renderLot();

    await fireEvent.press(screen.getByTestId('bid-place'));
    expect(
      screen.getByText(ru.lot.placed.replace('{amount}', formatPoints(current + 100))),
    ).toBeTruthy();

    await fireEvent.press(screen.getByTestId('bid-inc'));
    expect(
      screen.getByText(ru.lot.place.replace('{amount}', formatPoints(current + 200))),
    ).toBeTruthy();
  });

  test('lists the bids with the leader first, and the seller', async () => {
    await renderLot();

    expect(screen.getAllByText(ru.lot.leads)).toHaveLength(1);
    expect(screen.getByText(ru.lot.seller.replace('{who}', lot.seller))).toBeTruthy();
  });

  test('an unknown lot says so and goes back', async () => {
    const onBack = jest.fn();
    await renderLot('nope', onBack);

    expect(screen.getByText(ru.lot.notFound)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: ru.common.back }));
    expect(onBack).toHaveBeenCalled();
  });
});
