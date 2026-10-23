import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { demoPacks } from '../../src/data/seed/demoShop';
import { TopUpScreen } from '../../src/features/topup/TopUpScreen';
import { WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';

const renderTopUp = async (onBack = jest.fn()) => {
  const repos = createMemoryRepositories(seed);
  await render(
    <RepositoriesProvider repositories={repos}>
      <TopUpScreen onBack={onBack} />
    </RepositoriesProvider>,
  );
  await screen.findByText(formatPoints(WELCOME_BONUS_POINTS), { exact: false });
  return { repos, onBack };
};

describe('TopUpScreen', () => {
  test('shows six packs with the third one chosen and the matching buy button', async () => {
    await renderTopUp();

    expect(demoPacks).toHaveLength(6);
    const chosen = demoPacks[2]!;
    expect(screen.getByTestId(`pack-${chosen.amount}`).props.accessibilityState.selected).toBe(
      true,
    );
    expect(
      screen.getByText(
        ru.topup.buy
          .replace('{amount}', formatPoints(chosen.amount))
          .replace('{price}', chosen.price),
      ),
    ).toBeTruthy();
  });

  test('choosing another pack changes the buy button', async () => {
    await renderTopUp();
    const pack = demoPacks[4]!;

    await fireEvent.press(screen.getByTestId(`pack-${pack.amount}`));

    expect(screen.getByTestId(`pack-${pack.amount}`).props.accessibilityState.selected).toBe(true);
    expect(
      screen.getByText(
        ru.topup.buy.replace('{amount}', formatPoints(pack.amount)).replace('{price}', pack.price),
      ),
    ).toBeTruthy();
  });

  test('the buy button only shows «Готово» and does not touch the ledger', async () => {
    const { repos } = await renderTopUp();
    const entries = await repos.wallet.listByUser('user-me');

    await fireEvent.press(screen.getByTestId('topup-buy'));

    expect(
      screen.getByText(ru.topup.done.replace('{amount}', formatPoints(demoPacks[2]!.amount))),
    ).toBeTruthy();
    expect(await repos.wallet.listByUser('user-me')).toEqual(entries);
  });

  test('the back button calls onBack', async () => {
    const { onBack } = await renderTopUp();

    await fireEvent.press(screen.getByRole('button', { name: ru.common.back }));

    expect(onBack).toHaveBeenCalled();
  });
});
