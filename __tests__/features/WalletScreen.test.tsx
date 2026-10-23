import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { makeEntry } from '../../src/data/testing/fixtures';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';
import { WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';
import { WalletScreen } from '../../src/features/wallet/WalletScreen';

const NOW = new Date(2026, 9, 22, 21, 5).getTime();

const renderWallet = (repos = createMemoryRepositories(), refreshKey = 0) =>
  render(
    <RepositoriesProvider repositories={repos}>
      <WalletScreen now={() => NOW} refreshKey={refreshKey} />
    </RepositoriesProvider>,
  );

describe('WalletScreen', () => {
  test('shows the title and the starting balance', async () => {
    await renderWallet();

    expect(await screen.findByText(ru.wallet.title)).toBeTruthy();
    expect(await screen.findByTestId('wallet-balance')).toHaveTextContent(
      formatPoints(WELCOME_BONUS_POINTS),
      { exact: false },
    );
  });

  test('lists the welcome bonus in the history with its date', async () => {
    await renderWallet();

    expect(await screen.findByText(ru.wallet.kinds.welcome_bonus)).toBeTruthy();
    expect(screen.getByText(`+${formatPoints(WELCOME_BONUS_POINTS)}`)).toBeTruthy();
    expect(screen.getByText('22 октября, 21:05')).toBeTruthy();
  });

  test('shows spending with a minus and the newest operation first', async () => {
    const repos = createMemoryRepositories();
    const view = await renderWallet(repos);
    await screen.findByText(ru.wallet.kinds.welcome_bonus);
    await repos.wallet.append(
      makeEntry({
        id: 'p1',
        userId: 'user-me',
        amount: -250,
        kind: 'prediction_stake',
        createdAt: NOW + 1,
      }),
    );

    await view.rerender(
      <RepositoriesProvider repositories={repos}>
        <WalletScreen now={() => NOW} refreshKey={1} />
      </RepositoriesProvider>,
    );

    expect(await screen.findByText('−250')).toBeTruthy();
    const rows = screen.getAllByTestId(/^wallet-entry-/).map((row) => row.props.testID);
    expect(rows).toEqual(['wallet-entry-p1', 'wallet-entry-welcome-user-me']);
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent(
      formatPoints(WELCOME_BONUS_POINTS - 250),
      { exact: false },
    );
  });

  test('each history row is read aloud as one sentence with the unit', async () => {
    const repos = createMemoryRepositories();
    const view = await renderWallet(repos);
    await screen.findByText(ru.wallet.kinds.welcome_bonus);
    await repos.wallet.append(
      makeEntry({
        id: 'p1',
        userId: 'user-me',
        amount: -250,
        kind: 'prediction_stake',
        createdAt: NOW,
      }),
    );
    await view.rerender(
      <RepositoriesProvider repositories={repos}>
        <WalletScreen now={() => NOW} refreshKey={1} />
      </RepositoriesProvider>,
    );

    const bonus = await screen.findByTestId('wallet-entry-welcome-user-me');
    const stake = await screen.findByTestId('wallet-entry-p1');

    expect(bonus.props.accessibilityLabel).toBe(
      'Стартовый бонус, 22 октября, 21:05, плюс 1\u00A0000 Аура',
    );
    expect(stake.props.accessibilityLabel).toBe(
      'Участие в прогнозе, 22 октября, 21:05, минус 250 Аура',
    );
  });

  test('the title and the history heading are marked as headings', async () => {
    await renderWallet();

    expect((await screen.findByText(ru.wallet.title)).props.accessibilityRole).toBe('header');
    expect(screen.getByText(ru.wallet.historyTitle).props.accessibilityRole).toBe('header');
  });

  test('says in words that sparks are not worth anything', async () => {
    await renderWallet();

    expect(await screen.findByText(ru.wallet.disclaimer)).toBeTruthy();
  });

  test('reads the balance aloud with the right word form', async () => {
    await renderWallet();

    const balance = await screen.findByTestId('wallet-balance');

    expect(balance.props.accessibilityLabel).toBe('1 000 Аура');
  });

  test('shows an error with a retry button and recovers', async () => {
    const repos = createMemoryRepositories();
    const spy = jest
      .spyOn(repos.wallet, 'listByUser')
      .mockRejectedValueOnce(new Error('disk error'));

    await renderWallet(repos);
    expect(await screen.findByText(ru.wallet.error)).toBeTruthy();

    await act(async () => {
      await fireEvent.press(screen.getByText(ru.wallet.retry));
    });

    expect(await screen.findByTestId('wallet-balance')).toBeTruthy();
    spy.mockRestore();
  });
});
