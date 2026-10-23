import { render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { formatSignedPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';
import { MyPredictions } from '../../src/features/predictions/MyPredictions';
import {
  placePrediction,
  PREDICTION_DURATION_MS,
} from '../../src/features/predictions/predictionService';
import { ensureWelcomeBonus } from '../../src/features/wallet/walletService';

const USER = 'user-me';
const NOW = 7_000_000;

const renderList = (repos: ReturnType<typeof createMemoryRepositories>, now = NOW) =>
  render(
    <RepositoriesProvider repositories={repos}>
      <MyPredictions now={() => now} />
    </RepositoriesProvider>,
  );

async function withPrediction() {
  const repos = createMemoryRepositories(seed);
  await ensureWelcomeBonus(repos, USER, 0);
  const prediction = await placePrediction(repos, {
    userId: USER,
    trendId: 'trend-neirokot',
    stake: 50,
    now: NOW,
  });
  return { repos, prediction };
}

describe('MyPredictions', () => {
  test('shows nothing when the user has made no predictions', async () => {
    const repos = createMemoryRepositories(seed);
    await renderList(repos);

    expect(screen.queryByText(ru.predictions.myTitle)).toBeNull();
  });

  test('lists a waiting prediction with the wave, the amount and the status', async () => {
    const { repos, prediction } = await withPrediction();

    await renderList(repos);

    const row = await screen.findByTestId(`prediction-row-${prediction.id}`);
    expect(screen.getByText(ru.predictions.myTitle).props.accessibilityRole).toBe('header');
    expect(row).toHaveTextContent('Нейрокот', { exact: false });
    expect(row).toHaveTextContent(ru.predictions.status.open, { exact: false });
    expect(row.props.accessibilityLabel).toBe(`Нейрокот, 50 Аура, ${ru.predictions.status.open}`);
  });

  test('after the time is up the result is shown, with the payout when it came true', async () => {
    const { repos, prediction } = await withPrediction();
    const video = (await repos.videos.getById('video-1'))!;
    await repos.videos.update('video-1', { viewCount: video.viewCount + 100 });

    await renderList(repos, NOW + PREDICTION_DURATION_MS);

    const row = await screen.findByTestId(`prediction-row-${prediction.id}`);
    expect(row).toHaveTextContent(ru.predictions.status.won, { exact: false });
    expect(screen.getByText(formatSignedPoints(100))).toBeTruthy();
    expect(row.props.accessibilityLabel).toBe(
      `Нейрокот, 50 Аура, ${ru.predictions.status.won}, плюс 100 Аура`,
    );
  });

  test('a prediction that did not come true shows no payout', async () => {
    const { repos, prediction } = await withPrediction();
    const video = (await repos.videos.getById('video-1'))!;
    await repos.videos.update('video-1', { viewCount: video.viewCount - 100 });

    await renderList(repos, NOW + PREDICTION_DURATION_MS);

    const row = await screen.findByTestId(`prediction-row-${prediction.id}`);
    expect(row).toHaveTextContent(ru.predictions.status.lost, { exact: false });
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  test('says so when the list cannot be loaded', async () => {
    const repos = createMemoryRepositories(seed);
    jest.spyOn(repos.predictions, 'listByUser').mockRejectedValue(new Error('disk error'));

    await renderList(repos);

    expect(await screen.findByText(ru.predictions.error)).toBeTruthy();
  });
});
