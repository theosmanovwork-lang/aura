import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import type { Repositories } from '../../src/data/repositories';
import { videoPrice } from '../../src/domain/videoPrice';
import { investInVideo } from '../../src/features/investments/investmentService';
import { VideoMarketScreen } from '../../src/features/market/VideoMarketScreen';
import { formatPrice } from '../../src/features/market/marketFormat';
import { ensureWelcomeBonus, WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';
import { ru } from '../../src/i18n/ru';

const USER = 'user-me';
const VIDEO = seed.videos.find((v) => v.id === 'video-1')!;
const AUTHOR = seed.users.find((u) => u.id === VIDEO.authorId)!;
const NOW = Date.UTC(2026, 5, 1);

const renderMarket = async (
  options: { repos?: Repositories; videoId?: string; onOpenVideo?: (id: string) => void } = {},
) => {
  const repos = options.repos ?? createMemoryRepositories(seed);
  await ensureWelcomeBonus(repos, USER, 0);
  await render(
    <RepositoriesProvider repositories={repos}>
      <VideoMarketScreen
        videoId={options.videoId ?? VIDEO.id}
        now={() => NOW}
        onOpenVideo={options.onOpenVideo}
      />
    </RepositoriesProvider>,
  );
  return repos;
};

const typeAmount = async (digits: string) => {
  for (const digit of digits) {
    await fireEvent.press(screen.getByRole('button', { name: digit }));
  }
};

describe('VideoMarketScreen', () => {
  test('shows the author, the title, the price and the chart', async () => {
    await renderMarket();

    expect(await screen.findByText(AUTHOR.nickname)).toBeTruthy();
    expect(screen.getByText(VIDEO.title)).toBeTruthy();
    expect(screen.getByTestId('market-price')).toHaveTextContent(formatPrice(videoPrice(VIDEO)));
    expect(screen.getAllByTestId('chart-bar').length).toBeGreaterThan(1);
  });

  test('offers four chart periods and the shorter one draws fewer bars', async () => {
    await renderMarket();
    await screen.findByTestId('market-price');
    const all = screen.getAllByTestId('chart-bar').length;

    for (const label of Object.values(ru.market.periods)) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    }
    await fireEvent.press(screen.getByRole('button', { name: ru.market.periods.week }));

    expect(screen.getAllByTestId('chart-bar').length).toBeLessThan(all);
    expect(
      screen.getByRole('button', { name: ru.market.periods.week }).props.accessibilityState
        .selected,
    ).toBe(true);
  });

  test('without a position there is «Вложить» and «Забрать» is off', async () => {
    await renderMarket();
    await screen.findByTestId('market-price');

    expect(screen.getByRole('button', { name: ru.market.actions.invest })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: ru.market.actions.take }).props.accessibilityState
        .disabled,
    ).toBe(true);
    expect(screen.queryByTestId('position-card')).toBeNull();
  });

  test('putting Aura in opens the pad, saves the position and shows it', async () => {
    const repos = await renderMarket();
    await screen.findByTestId('market-price');

    await fireEvent.press(screen.getByRole('button', { name: ru.market.actions.invest }));
    await typeAmount('100');
    await fireEvent.press(screen.getByTestId('pad-confirm'));

    expect(await screen.findByText('Вложено 100 Аура')).toBeTruthy();
    expect(await screen.findByTestId('position-card')).toBeTruthy();
    expect(screen.getByRole('button', { name: ru.market.actions.investMore })).toBeTruthy();
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 100);
    expect(screen.queryByTestId('pad-confirm')).toBeNull();
  });

  test('taking Aura back opens the pad with the most that can be taken', async () => {
    const repos = createMemoryRepositories(seed);
    await ensureWelcomeBonus(repos, USER, 0);
    await investInVideo(repos, { userId: USER, videoId: VIDEO.id, amount: 100, now: NOW - 1 });
    await renderMarket({ repos });
    await screen.findByTestId('position-card');

    await fireEvent.press(screen.getByRole('button', { name: ru.market.actions.take }));
    expect(screen.getByText(ru.market.pad.takable.replace('{max}', '100'))).toBeTruthy();
    await typeAmount('40');
    await fireEvent.press(screen.getByTestId('pad-confirm'));

    expect(await screen.findByText('Забрано 40 Аура')).toBeTruthy();
    expect((await repos.investments.getByUserAndVideo(USER, VIDEO.id))?.invested).toBe(60);
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 100 + 40);
  });

  test('says so, and does not open the pad, when the balance is below the minimum', async () => {
    const repos = createMemoryRepositories(seed);
    await ensureWelcomeBonus(repos, USER, 0);
    await repos.wallet.append({
      id: 'spend',
      userId: USER,
      amount: -(WELCOME_BONUS_POINTS - 5),
      asset: 'POINTS',
      kind: 'prediction_stake',
      createdAt: 1,
    });
    await renderMarket({ repos });
    await screen.findByTestId('market-price');

    await fireEvent.press(screen.getByRole('button', { name: ru.market.actions.invest }));

    expect(screen.getByText(ru.market.errors.notEnough)).toBeTruthy();
    expect(screen.queryByTestId('pad-confirm')).toBeNull();
  });

  test('says so when the video already holds the most it may', async () => {
    const repos = createMemoryRepositories(seed);
    await ensureWelcomeBonus(repos, USER, 0);
    await investInVideo(repos, { userId: USER, videoId: VIDEO.id, amount: 500, now: NOW - 1 });
    await renderMarket({ repos });
    await screen.findByTestId('position-card');

    await fireEvent.press(screen.getByRole('button', { name: ru.market.actions.investMore }));

    expect(screen.getByText(ru.market.errors.cap)).toBeTruthy();
    expect(screen.queryByTestId('pad-confirm')).toBeNull();
  });

  test('cancel closes the pad without changing anything', async () => {
    const repos = await renderMarket();
    await screen.findByTestId('market-price');
    await fireEvent.press(screen.getByRole('button', { name: ru.market.actions.invest }));

    await fireEvent.press(screen.getByRole('button', { name: ru.market.actions.cancel }));

    expect(screen.queryByTestId('pad-confirm')).toBeNull();
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS);
  });

  test('lists other videos of the same wave and opens one on press', async () => {
    const onOpenVideo = jest.fn();
    await renderMarket({ onOpenVideo });
    await screen.findByTestId('market-price');
    const other = seed.videos.find(
      (v) => v.trendId === VIDEO.trendId && v.id !== VIDEO.id && v.moderationStatus === 'published',
    )!;

    expect(screen.getByText(ru.market.related)).toBeTruthy();
    await fireEvent.press(screen.getByTestId(`related-${other.id}`));

    expect(onOpenVideo).toHaveBeenCalledWith(other.id);
    expect(screen.queryByTestId(`related-${VIDEO.id}`)).toBeNull();
  });

  test('says in words that the price and Aura are not worth anything', async () => {
    await renderMarket();

    expect(await screen.findByText(ru.market.disclaimer)).toBeTruthy();
  });

  test('says so for a video that does not exist', async () => {
    await renderMarket({ videoId: 'nope' });

    expect(await screen.findByText(ru.market.notFound)).toBeTruthy();
  });
});
