import { render, screen, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { ru } from '../../src/i18n/ru';
import { TrendsScreen } from '../../src/features/trends/TrendsScreen';
import { loadTrendBoard } from '../../src/features/trends/trendService';
import { colors, radii } from '../../src/theme';

const NOW = Date.UTC(2027, 0, 1);
const styleOf = (element: { props: { style?: unknown } }) =>
  StyleSheet.flatten(element.props.style as never) as Record<string, unknown>;

async function renderBoard() {
  const repos = createMemoryRepositories(seed);
  await render(
    <RepositoriesProvider repositories={repos}>
      <TrendsScreen onOpenTrend={jest.fn()} now={() => NOW} />
    </RepositoriesProvider>,
  );
  const board = await loadTrendBoard(repos, NOW);
  await screen.findByText(board[0]!.trend.name);
  return board;
}

describe('trends list design', () => {
  test('numbers the waves 1, 2, 3 … in the order of the list', async () => {
    const board = await renderBoard();

    board.forEach((row, index) => {
      const badge = screen.getByTestId(`trend-rank-${row.trend.id}`, { hidden: true });
      expect(badge).toHaveTextContent(String(index + 1));
    });
  });

  test('the first place is the bright accent, the others are quiet', async () => {
    const board = await renderBoard();

    const first = screen.getByTestId(`trend-rank-${board[0]!.trend.id}`, { hidden: true });
    const second = screen.getByTestId(`trend-rank-${board[1]!.trend.id}`, { hidden: true });
    expect(styleOf(first).backgroundColor).toBe(colors.accent);
    expect(styleOf(second).backgroundColor).toBe(colors.surfaceMuted);
  });

  test('the rank badge is decoration: screen readers get the order from the list', async () => {
    const board = await renderBoard();

    const badge = screen.getByTestId(`trend-rank-${board[0]!.trend.id}`, { hidden: true });
    expect(badge.props.accessibilityElementsHidden).toBe(true);
    expect(badge.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  test('the rank number keeps inside its circle when the system font is very large', async () => {
    const board = await renderBoard();

    const badge = screen.getByTestId(`trend-rank-${board[0]!.trend.id}`, { hidden: true });
    expect(
      within(badge).getByText('1', { hidden: true }).props.maxFontSizeMultiplier,
    ).toBeLessThanOrEqual(1.5);
    expect(styleOf(badge).minWidth).toBeGreaterThanOrEqual(28);
  });

  test('has a short line under the title', async () => {
    await renderBoard();

    expect(screen.getByText(ru.trends.subtitle)).toBeTruthy();
  });

  test('growth sits in a green or red pill, grey when there is no change', async () => {
    const board = await renderBoard();

    for (const row of board) {
      const pill = screen.getByTestId(`growth-pill-${row.trend.id}`);
      const expected =
        row.growthPercent === null || row.growthPercent === 0
          ? colors.surfaceMuted
          : row.growthPercent > 0
            ? colors.positiveSoft
            : colors.negativeSoft;
      expect(styleOf(pill).backgroundColor).toBe(expected);
    }
  });

  test('every wave is a rounded card', async () => {
    const board = await renderBoard();

    const card = screen.getByTestId(`trend-row-${board[0]!.trend.id}`);
    expect(styleOf(card).borderRadius).toBe(radii.lg);
    expect(styleOf(card).backgroundColor).toBe(colors.surface);
  });

  test('the little chart is grey with a light newest bar', async () => {
    const board = await renderBoard();

    const bars = within(screen.getByTestId(`trend-row-${board[0]!.trend.id}`)).getAllByTestId(
      'chart-bar',
    );
    expect(styleOf(bars[0]!).backgroundColor).toBe(colors.chartBar);
    expect(styleOf(bars.at(-1)!).backgroundColor).toBe(colors.accent);
  });
});
