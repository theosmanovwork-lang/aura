import { formatDateTime, formatPoints, formatSignedPoints } from '../../src/i18n/format';

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
