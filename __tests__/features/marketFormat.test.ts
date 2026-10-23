import {
  filterHistory,
  formatPrice,
  PERIODS,
  type Period,
} from '../../src/features/market/marketFormat';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = 100 * DAY;

const snap = (hoursAgo: number, price = 1) => ({ videoId: 'v1', at: NOW - hoursAgo * HOUR, price });

describe('formatPrice', () => {
  test.each([
    [4701, '4 701,00'],
    [5269.82, '5 269,82'],
    [0.5, '0,50'],
    [1234567.891, '1 234 567,89'],
  ])('shows %s as %s', (value, expected) => {
    expect(formatPrice(value)).toBe(expected.replace(/ /g, '\u00A0'));
  });
});

describe('filterHistory', () => {
  const history = [snap(24 * 20), snap(24 * 8), snap(24 * 3), snap(5), snap(0)];

  test('the whole history for «Всё»', () => {
    expect(filterHistory(history, 'all', NOW)).toEqual(history);
  });

  test.each([
    ['day', 2],
    ['week', 3],
    ['month', 5],
  ] as const)('only the last %s for the chart', (period, count) => {
    expect(filterHistory(history, period as Period, NOW)).toHaveLength(count);
  });

  test('keeps at least the last two points so there is something to draw', () => {
    const sparse = [snap(24 * 30), snap(24 * 20), snap(0)];

    expect(filterHistory(sparse, 'day', NOW)).toHaveLength(2);
    expect(filterHistory([snap(0)], 'day', NOW)).toHaveLength(1);
    expect(filterHistory([], 'week', NOW)).toEqual([]);
  });

  test('does not change the list it was given', () => {
    const copy = [...history];
    filterHistory(history, 'day', NOW);
    expect(history).toEqual(copy);
  });

  test('offers four periods, the longest last', () => {
    expect(PERIODS.map((p) => p.key)).toEqual(['day', 'week', 'month', 'all']);
  });
});
