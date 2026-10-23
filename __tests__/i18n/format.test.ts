import { formatAgo, formatDateTime, formatPoints, formatSignedPoints } from '../../src/i18n/format';

describe('formatPoints', () => {
  test.each([
    [0, '0'],
    [999, '999'],
    [1000, '1 000'],
    [1234567, '1 234 567'],
    [-1500, '−1 500'],
  ])('%i -> %s', (n, expected) => {
    expect(formatPoints(n)).toBe(expected);
  });
});

describe('formatSignedPoints', () => {
  test('shows a plus for earned and a real minus sign for spent points', () => {
    expect(formatSignedPoints(1000)).toBe('+1 000');
    expect(formatSignedPoints(-30)).toBe('−30');
  });
});

describe('formatDateTime', () => {
  test('writes the date in Russian with the local time', () => {
    expect(formatDateTime(new Date(2026, 9, 22, 21, 5).getTime())).toBe('22 октября, 21:05');
    expect(formatDateTime(new Date(2027, 0, 3, 7, 45).getTime())).toBe('3 января, 07:45');
  });
});

describe('formatAgo', () => {
  const NOW = 10_000_000_000;
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  test.each([
    [0, 'только что'],
    [59_000, 'только что'],
    [5 * MIN, '5 мин'],
    [3 * HOUR, '3 ч'],
    [5 * DAY, '5 д'],
    [14 * DAY, '2 нед'],
    [60 * DAY, '8 нед'],
  ])('%i ms ago reads «%s»', (age, text) => {
    expect(formatAgo(NOW, NOW - age)).toBe(text);
  });

  test('a time in the future counts as just now', () => {
    expect(formatAgo(NOW, NOW + DAY)).toBe('только что');
  });
});
