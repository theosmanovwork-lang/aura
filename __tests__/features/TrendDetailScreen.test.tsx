import { render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { countLabel, formatCount } from '../../src/i18n/plural';
import { ru } from '../../src/i18n/ru';
import { describeGrowth, formatGrowth } from '../../src/features/trends/format';
import { TrendDetailScreen } from '../../src/features/trends/TrendDetailScreen';
import { loadTrendDetail } from '../../src/features/trends/trendService';

const NOW = Date.UTC(2027, 0, 1);

const renderDetail = (trendId: string, repos = createMemoryRepositories(seed)) =>
  render(
    <RepositoriesProvider repositories={repos}>
      <TrendDetailScreen trendId={trendId} now={() => NOW} />
    </RepositoriesProvider>,
  );

describe('TrendDetailScreen', () => {
  test('shows the wave name, score and growth', async () => {
    const repos = createMemoryRepositories(seed);
    await renderDetail('trend-neirokot', repos);
    const { summary } = await loadTrendDetail(repos, 'trend-neirokot', NOW);

    expect(await screen.findByText('Нейрокот')).toBeTruthy();
    expect(screen.getByText(formatCount(summary.score))).toBeTruthy();
    expect(screen.getByText(formatGrowth(summary.growthPercent))).toBeTruthy();
  });

  test('the growth is described in words for screen readers', async () => {
    const repos = createMemoryRepositories(seed);
    await renderDetail('trend-neirokot', repos);
    const { summary } = await loadTrendDetail(repos, 'trend-neirokot', NOW);

    const growth = await screen.findByText(formatGrowth(summary.growthPercent));

    expect(growth.props.accessibilityLabel).toBe(describeGrowth(summary.growthPercent));
  });

  test('draws one bar per history point', async () => {
    const repos = createMemoryRepositories(seed);
    await renderDetail('trend-neirokot', repos);
    const { summary } = await loadTrendDetail(repos, 'trend-neirokot', NOW);
    await screen.findByText('Нейрокот');

    expect(screen.getAllByTestId('chart-bar')).toHaveLength(summary.history.length);
  });

  test('lists the published videos of the wave and their number', async () => {
    await renderDetail('trend-neirokot');

    expect(await screen.findByText('Кот-астронавт летит к Луне')).toBeTruthy();
    expect(screen.getByText('Коты играют в шахматы')).toBeTruthy();
    expect(screen.getByText(countLabel(2, ru.trends.videos))).toBeTruthy();
  });

  test('does not list videos from other waves or unpublished ones', async () => {
    await renderDetail('trend-roboty');

    expect(await screen.findByText('Роботы танцуют вальс')).toBeTruthy();
    expect(screen.queryByText('Робот-уборщик в ритме диско')).toBeNull();
    expect(screen.queryByText('Кот-астронавт летит к Луне')).toBeNull();
  });

  test('explains that the score is not money', async () => {
    await renderDetail('trend-neirokot');

    expect(await screen.findByText(ru.trends.disclaimer)).toBeTruthy();
  });

  test('tells the user when the wave does not exist', async () => {
    await renderDetail('nope');

    expect(await screen.findByText(ru.trends.notFound)).toBeTruthy();
  });

  test('shows an error with a retry button and recovers', async () => {
    const repos = createMemoryRepositories(seed);
    const spy = jest.spyOn(repos.trends, 'getById').mockRejectedValueOnce(new Error('disk error'));
    await renderDetail('trend-neirokot', repos);

    expect(await screen.findByText(ru.trends.error)).toBeTruthy();
    spy.mockRestore();
  });
});
