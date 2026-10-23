import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { demoCollection, demoCollectionCounts } from '../../src/data/seed/demoCommunity';
import { CardsScreen } from '../../src/features/cards/CardsScreen';
import { WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';

const onTopUp = jest.fn();

const renderCards = () =>
  render(
    <RepositoriesProvider repositories={createMemoryRepositories(seed)}>
      <CardsScreen onTopUp={onTopUp} />
    </RepositoriesProvider>,
  );

describe('CardsScreen', () => {
  test('shows the real balance in the dark card, with the note that Aura has no price', async () => {
    await renderCards();

    expect(
      await screen.findByText(`${formatPoints(WELCOME_BONUS_POINTS)} ${ru.cards.coinsWord}`, {
        exact: false,
      }),
    ).toBeTruthy();
    expect(screen.getByText(ru.cards.today)).toBeTruthy();
    expect(screen.getByText(ru.cards.balance)).toBeTruthy();
  });

  test('the top-up button opens the top-up screen', async () => {
    await renderCards();
    await screen.findByTestId('balance-card');

    expect(screen.getByText(ru.cards.topUp)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('top-up'));
    expect(onTopUp).toHaveBeenCalled();
  });

  test('the chests button says how many chests wait', async () => {
    await renderCards();

    expect(await screen.findByTestId('open-chests')).toHaveTextContent('3 сундука · Открыть', {
      exact: false,
    });
  });

  test('the quests: today is marked, past days are done, the chest waits on day 14', async () => {
    await renderCards();
    await screen.findByTestId('balance-card');

    expect(screen.getByTestId('quest-day-9')).toBeTruthy();
    expect(screen.getByTestId('quest-day-14')).toHaveTextContent(ru.cards.quests.chestReward, {
      exact: false,
    });
    expect(screen.getByText(ru.cards.quests.progress.replace('{n}', '11'))).toBeTruthy();
    expect(screen.getByText(ru.cards.quests.chestDay)).toBeTruthy();
  });

  test('claiming today moves the progress and the button turns into a done message', async () => {
    await renderCards();
    await screen.findByTestId('balance-card');

    await fireEvent.press(screen.getByTestId('quest-claim'));

    expect(screen.getByText(ru.cards.quests.claimed)).toBeTruthy();
    expect(screen.getByText(ru.cards.quests.progress.replace('{n}', '12'))).toBeTruthy();
    expect(screen.getByTestId('quest-claim').props.accessibilityState.disabled).toBe(true);
  });

  test('the collection shows the count and open cards with their rarity, locked ones as «???»', async () => {
    await renderCards();
    await screen.findByTestId('balance-card');

    expect(
      screen.getByText(`${demoCollectionCounts.have} / ${demoCollectionCounts.total}`),
    ).toBeTruthy();
    const open = demoCollection.filter((c) => c.kind === 'open');
    const locked = demoCollection.filter((c) => c.kind === 'locked');
    expect(screen.getAllByText(ru.cards.locked)).toHaveLength(locked.length);
    expect(screen.getAllByText(ru.cards.notOpened)).toHaveLength(locked.length);
    expect(screen.getByText(ru.cards.rarity.treasure)).toBeTruthy();
    expect(open.length).toBe(3);
  });

  test('ends with the hint how to get cards', async () => {
    await renderCards();

    expect(await screen.findByText(ru.cards.hint)).toBeTruthy();
    expect(screen.getByText(ru.cards.hintMore)).toBeTruthy();
  });
});
