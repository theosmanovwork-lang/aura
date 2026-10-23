import { render, screen, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { formatCount } from '../../src/i18n/plural';
import { ru } from '../../src/i18n/ru';
import { TrendDetailScreen } from '../../src/features/trends/TrendDetailScreen';
import { loadTrendDetail } from '../../src/features/trends/trendService';
import { darkColors as colors, radii, typography } from '../../src/theme';

const NOW = Date.UTC(2027, 0, 1);
const styleOf = (element: { props: { style?: unknown } }) =>
  StyleSheet.flatten(element.props.style as never) as Record<string, unknown>;

async function renderDetail(trendId = 'trend-neirokot') {
  const repos = createMemoryRepositories(seed);
  await render(
    <RepositoriesProvider repositories={repos}>
      <TrendDetailScreen trendId={trendId} now={() => NOW} />
    </RepositoriesProvider>,
  );
  const { summary } = await loadTrendDetail(repos, trendId, NOW);
  await screen.findByText(summary.trend.name);
  return summary;
}

describe('trend detail design', () => {
  test('the index is the big number of the screen', async () => {
    const summary = await renderDetail();

    const score = screen.getByText(formatCount(summary.score));
    expect(styleOf(score).fontSize).toBe(typography.figureDisplay.fontSize);
  });

  test('the top part is a rounded card with the name, the index and the growth pill', async () => {
    const summary = await renderDetail();

    const hero = screen.getByTestId('trend-hero');
    expect(styleOf(hero).backgroundColor).toBe(colors.surface);
    expect(styleOf(hero).borderRadius).toBe(radii.panel);
    expect(within(hero).getByText(summary.trend.name)).toBeTruthy();
    expect(within(hero).getByTestId(`growth-pill-${summary.trend.id}`)).toBeTruthy();
  });

  test('the chart sits in its own card and uses the grey bars and a light newest bar', async () => {
    await renderDetail();

    const card = screen.getByTestId('trend-chart-card');
    expect(styleOf(card).borderRadius).toBe(radii.panel);
    const bars = within(card).getAllByTestId('chart-bar');
    expect(styleOf(bars[0]!).backgroundColor).toBe(colors.chartBar);
    expect(styleOf(bars.at(-1)!).backgroundColor).toBe(colors.primary);
  });

  test('the videos are a flat list (nothing that looks like a button) with a camera icon', async () => {
    await renderDetail();

    const row = screen.getByTestId('trend-video-video-1');
    expect(styleOf(row).backgroundColor).toBeUndefined();
    expect(styleOf(row).borderBottomWidth).toBeGreaterThan(0);
    expect(within(row).getByTestId('trend-video-icon-video-1', { hidden: true })).toBeTruthy();
    expect(within(row).getByText('Кот-астронавт летит к Луне')).toBeTruthy();
  });

  test('the name and the section titles are headings for screen readers', async () => {
    const summary = await renderDetail();

    expect(screen.getByText(summary.trend.name).props.accessibilityRole).toBe('header');
    expect(screen.getByText(ru.trends.historyTitle).props.accessibilityRole).toBe('header');
    expect(screen.getByText(ru.trends.videosTitle).props.accessibilityRole).toBe('header');
  });
});
