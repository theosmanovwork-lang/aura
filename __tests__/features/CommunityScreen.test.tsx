import { fireEvent, render, screen } from '@testing-library/react-native';

import * as Clipboard from 'expo-clipboard';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { demoLots } from '../../src/data/seed/demoCommunity';
import { CommunityScreen } from '../../src/features/community/CommunityScreen';
import { WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }));

const renderCommunity = async (repos = createMemoryRepositories(seed)) => {
  await render(
    <RepositoriesProvider repositories={repos}>
      <CommunityScreen />
    </RepositoriesProvider>,
  );
  return repos;
};

describe('CommunityScreen', () => {
  test('if the phone refuses the clipboard the code is not reported as copied', async () => {
    (Clipboard.setStringAsync as jest.Mock).mockRejectedValueOnce(new Error('denied'));
    await renderCommunity();
    await screen.findByTestId('players-card');

    await fireEvent.press(screen.getByTestId('referral-copy'));

    expect(screen.queryByText(ru.community.referral.copied)).toBeNull();
    expect(screen.getByText('MIRA-77')).toBeTruthy();
  });

  test('has the title and the balance chip with the real balance', async () => {
    await renderCommunity();

    expect(await screen.findByText(ru.community.title)).toBeTruthy();
    expect(await screen.findByText(formatPoints(WELCOME_BONUS_POINTS))).toBeTruthy();
  });

  test('the rating shows the best authors of the real videos, best first', async () => {
    await renderCommunity();

    const card = await screen.findByTestId('players-card');

    expect(card).toHaveTextContent(ru.community.rating, { exact: false });
    expect(screen.getByTestId('player-user-eter')).toBeTruthy();
    expect(screen.queryByTestId('player-user-mila')).toBeNull();
    const places = screen.getAllByTestId(/^player-/).map((row) => row.props.accessibilityLabel);
    expect(places[0]).toMatch(/^1\. kira/);
  });

  test('shows the clans and the three medals', async () => {
    await renderCommunity();
    await screen.findByTestId('players-card');

    expect(screen.getByTestId('clans-card')).toHaveTextContent(ru.community.clans, {
      exact: false,
    });
    expect(screen.getAllByTestId(/^clan-/)).toHaveLength(3);
  });

  test('auctions come first with bids and timers; the market tab shows prices', async () => {
    await renderCommunity();
    await screen.findByTestId('players-card');
    expect(screen.getAllByText(ru.community.bid)).toHaveLength(demoLots.length);
    expect(
      screen.getByText(ru.community.meta.auctions.replace('{n}', String(demoLots.length))),
    ).toBeTruthy();

    await fireEvent.press(screen.getByTestId('trade-tab-market'));

    expect(screen.getAllByText(ru.community.price)).toHaveLength(demoLots.length);
    expect(screen.queryByText(ru.community.bid)).toBeNull();
    expect(
      screen.getByText(ru.community.meta.market.replace('{n}', String(demoLots.length))),
    ).toBeTruthy();
    expect(screen.getByTestId('trade-tab-market').props.accessibilityState.selected).toBe(true);
  });

  test('the search narrows the lots by name or seller', async () => {
    await renderCommunity();
    await screen.findByTestId('players-card');

    await fireEvent.changeText(screen.getByTestId('community-search'), 'kira');

    expect(screen.getAllByTestId(/^lot-/)).toHaveLength(1);
    expect(screen.getByText('@kira')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('community-search'), 'такого нет');
    expect(screen.queryAllByTestId(/^lot-/)).toHaveLength(0);
  });

  test('the reminder button turns on and the referral code is copied', async () => {
    await renderCommunity();
    await screen.findByTestId('players-card');

    await fireEvent.press(screen.getByTestId('notice-button'));
    await fireEvent.press(screen.getByTestId('referral-copy'));

    expect(screen.getByText(ru.community.notice.done)).toBeTruthy();
    expect(await screen.findByText(ru.community.referral.copied)).toBeTruthy();
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('MIRA-77');
  });

  test('each lot has a spoken name with its rarity', async () => {
    await renderCommunity();
    await screen.findByTestId('players-card');

    const lot = screen.getByTestId('lot-lot-1');

    expect(lot.props.accessibilityLabel).toBe(
      ru.community.openLot
        .replace('{name}', demoLots[0]!.name)
        .replace('{rarity}', ru.cards.rarity.treasure),
    );
  });

  test('a failed load shows an error with a retry button', async () => {
    const repos = createMemoryRepositories(seed);
    jest.spyOn(repos.videos, 'listPublished').mockRejectedValueOnce(new Error('disk'));
    await renderCommunity(repos);

    expect(await screen.findByText(ru.community.error)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: ru.community.retry }));
    expect(await screen.findByTestId('players-card')).toBeTruthy();
  });
});
