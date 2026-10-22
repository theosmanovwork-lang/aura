import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { formatCount } from '../../src/i18n/plural';
import { ru } from '../../src/i18n/ru';
import { describeGrowth, formatGrowth } from '../../src/features/trends/format';
import { TrendsScreen } from '../../src/features/trends/TrendsScreen';
import { loadTrendBoard } from '../../src/features/trends/trendService';

const NOW = Date.UTC(2027, 0, 1);

const renderTrends = (repos = createMemoryRepositories(seed), onOpenTrend = jest.fn()) =>
  render(
    <RepositoriesProvider repositories={repos}>
      <TrendsScreen onOpenTrend={onOpenTrend} now={() => NOW} />
    </RepositoriesProvider>,
  );

describe('TrendsScreen', () => {
  test('shows the title and every wave', async () => {
    await renderTrends();

    expect(await screen.findByText(ru.trends.title)).toBeTruthy();
    for (const trend of seed.trends) {
      expect(await screen.findByText(trend.name)).toBeTruthy();
    }
  });

  test('shows the score and the growth of each wave', async () => {
    const repos = createMemoryRepositories(seed);
    await renderTrends(repos);
    const board = await loadTrendBoard(repos, NOW);

    for (const row of board) {
      const rowView = await screen.findByTestId(`trend-row-${row.trend.id}`);
      expect(rowView).toHaveTextContent(formatCount(row.score), { exact: false });
      expect(rowView).toHaveTextContent(formatGrowth(row.growthPercent), { exact: false });
    }
  });

  test('lists the fastest growing wave first', async () => {
    const repos = createMemoryRepositories(seed);
    await renderTrends(repos);
    const board = await loadTrendBoard(repos, NOW);
    await screen.findByText(board[0]!.trend.name);

    const shown = screen.getAllByTestId(/^trend-row-/).map((r) => r.props.testID);

    expect(shown).toEqual(board.map((row) => `trend-row-${row.trend.id}`));
  });

  test('draws a small chart for every wave', async () => {
    await renderTrends();
    await screen.findByText(seed.trends[0]!.name);

    expect(screen.getAllByTestId('chart-bar').length).toBeGreaterThanOrEqual(
      seed.trends.length * 7,
    );
  });

  test('opens a wave when its row is pressed', async () => {
    const onOpenTrend = jest.fn();
    await renderTrends(createMemoryRepositories(seed), onOpenTrend);

    await fireEvent.press(await screen.findByTestId(`trend-row-${seed.trends[0]!.id}`));

    expect(onOpenTrend).toHaveBeenCalledWith(seed.trends[0]!.id);
  });

  test('a screen reader hears the name, the index and the growth of a wave', async () => {
    const repos = createMemoryRepositories(seed);
    await renderTrends(repos);
    const board = await loadTrendBoard(repos, NOW);
    const first = board[0]!;

    const row = await screen.findByTestId(`trend-row-${first.trend.id}`);

    expect(row.props.accessibilityLabel).toBe(
      `${first.trend.name}, ${ru.trends.index} ${formatCount(first.score)}, ${describeGrowth(first.growthPercent)}`,
    );
  });

  test('loads the waves again when the refresh key changes, keeping the old list meanwhile', async () => {
    const repos = createMemoryRepositories(seed);
    const listPublished = jest.spyOn(repos.videos, 'listPublished');
    const view = (refreshKey: number) => (
      <RepositoriesProvider repositories={repos}>
        <TrendsScreen onOpenTrend={jest.fn()} now={() => NOW} refreshKey={refreshKey} />
      </RepositoriesProvider>
    );
    const { rerender } = await render(view(0));
    await screen.findByText(seed.trends[0]!.name);
    const callsBefore = listPublished.mock.calls.length;

    await rerender(view(1));

    expect(screen.getByText(seed.trends[0]!.name)).toBeTruthy();
    await screen.findByText(seed.trends[0]!.name);
    expect(listPublished.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  test('explains that the score is not money', async () => {
    await renderTrends();

    expect(await screen.findByText(ru.trends.disclaimer)).toBeTruthy();
  });

  test('shows a message when there are no waves', async () => {
    await renderTrends(createMemoryRepositories());

    expect(await screen.findByText(ru.trends.empty)).toBeTruthy();
  });

  test('shows an error with a retry button and recovers', async () => {
    const repos = createMemoryRepositories(seed);
    const spy = jest.spyOn(repos.trends, 'list').mockRejectedValueOnce(new Error('disk error'));

    await renderTrends(repos);
    expect(await screen.findByText(ru.trends.error)).toBeTruthy();

    await fireEvent.press(screen.getByText(ru.trends.retry));

    expect(await screen.findByText(seed.trends[0]!.name)).toBeTruthy();
    spy.mockRestore();
  });
});
