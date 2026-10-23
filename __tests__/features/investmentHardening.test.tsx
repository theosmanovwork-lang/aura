import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { InvestmentRuleError } from '../../src/domain/investment';
import {
  investInVideo,
  loadVideoMarket,
  OutOfSyncError,
  takeFromVideo,
} from '../../src/features/investments/investmentService';
import { VideoMarketScreen } from '../../src/features/market/VideoMarketScreen';
import { ensureWelcomeBonus, WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';
import { ru } from '../../src/i18n/ru';

const USER = 'user-me';
const NOW = Date.UTC(2026, 5, 1);

const start = async () => {
  const repos = createMemoryRepositories(seed);
  await ensureWelcomeBonus(repos, USER, 0);
  return repos;
};

describe('rule errors carry a code', () => {
  test.each([
    [9, 'too_small'],
    [10.5, 'not_whole'],
    [501, 'over_cap'],
  ])('an amount of %s is refused with %s', async (amount, code) => {
    const repos = await start();

    const error = await investInVideo(repos, {
      userId: USER,
      videoId: 'video-1',
      amount,
      now: NOW,
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(InvestmentRuleError);
    expect((error as InvestmentRuleError).code).toBe(code);
  });

  test('taking more than the worth is refused with too_much', async () => {
    const repos = await start();
    await investInVideo(repos, { userId: USER, videoId: 'video-1', amount: 100, now: NOW });

    const error = await takeFromVideo(repos, {
      userId: USER,
      videoId: 'video-1',
      amount: 101,
      now: NOW,
    }).catch((e: unknown) => e);

    expect((error as InvestmentRuleError).code).toBe('too_much');
  });

  test('a video that is not published is refused with not_published', async () => {
    const repos = await start();
    await repos.videos.update('video-2', { moderationStatus: 'pending' });

    const error = await investInVideo(repos, {
      userId: USER,
      videoId: 'video-2',
      amount: 10,
      now: NOW,
    }).catch((e: unknown) => e);

    expect((error as InvestmentRuleError).code).toBe('not_published');
  });
});

describe('a failure while putting things back is not hidden', () => {
  test('taking: if paying fails and restoring the position fails too, the caller is told', async () => {
    const repos = await start();
    await investInVideo(repos, { userId: USER, videoId: 'video-1', amount: 100, now: NOW });
    jest.spyOn(repos.wallet, 'append').mockRejectedValue(new Error('disk full'));
    const update = jest.spyOn(repos.investments, 'update');
    update.mockImplementationOnce(async (id, patch) => ({
      id,
      userId: USER,
      videoId: 'video-1',
      createdAt: NOW,
      ...patch,
    }));
    update.mockRejectedValue(new Error('disk full'));

    await expect(
      takeFromVideo(repos, { userId: USER, videoId: 'video-1', amount: 40, now: NOW + 1 }),
    ).rejects.toThrow(OutOfSyncError);
  });

  test('putting in: if saving fails and giving the Aura back fails too, the caller is told', async () => {
    const repos = await start();
    const original = repos.wallet.append.bind(repos.wallet);
    const append = jest.spyOn(repos.wallet, 'append');
    jest.spyOn(repos.investments, 'add').mockRejectedValueOnce(new Error('disk full'));
    append.mockImplementationOnce(original);
    append.mockRejectedValue(new Error('disk full'));

    await expect(
      investInVideo(repos, { userId: USER, videoId: 'video-1', amount: 100, now: NOW }),
    ).rejects.toThrow(OutOfSyncError);
  });
});

describe('two loads of the same page at the same moment', () => {
  test('do not fail when both try to record the same price point', async () => {
    const repos = await start();

    const results = await Promise.allSettled([
      loadVideoMarket(repos, USER, 'video-1', NOW),
      loadVideoMarket(repos, USER, 'video-1', NOW),
    ]);

    expect(results.map((r) => r.status)).toEqual(['fulfilled', 'fulfilled']);
  });
});

describe('a double tap on the confirm button', () => {
  test('moves the Aura once, not twice', async () => {
    const repos = await start();
    await render(
      <RepositoriesProvider repositories={repos}>
        <VideoMarketScreen videoId="video-1" now={() => NOW} />
      </RepositoriesProvider>,
    );
    await screen.findByTestId('market-price');
    await fireEvent.press(screen.getByRole('button', { name: ru.market.actions.invest }));
    for (const digit of '300') {
      await fireEvent.press(screen.getByRole('button', { name: digit }));
    }
    const confirm = screen.getByTestId('pad-confirm');

    // Two presses in the same frame, before the screen has had time to switch the button off.
    void fireEvent.press(confirm);
    await fireEvent.press(confirm);

    await screen.findByTestId('position-card');
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 300);
  });
});
