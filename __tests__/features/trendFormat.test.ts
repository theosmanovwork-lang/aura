import { barHeights } from '../../src/features/trends/chartMath';
import { describeGrowth, formatGrowth } from '../../src/features/trends/format';

describe('formatGrowth', () => {
  test.each([
    [16.3, '▲ 16,3%'],
    [50, '▲ 50%'],
    [-4.1, '▼ 4,1%'],
    [0, '0%'],
    [null, '—'],
  ])('%p -> %s', (value, expected) => {
    expect(formatGrowth(value)).toBe(expected);
  });
});

describe('barHeights', () => {
  test('gives nothing for no data', () => {
    expect(barHeights([], 100, 4)).toEqual([]);
  });

  test('scales the biggest value to the full height', () => {
    expect(barHeights([50, 100, 25], 100, 4)).toEqual([50, 100, 25]);
  });

  test('never makes a bar thinner than the minimum height', () => {
    expect(barHeights([0, 1, 1000], 100, 4)).toEqual([4, 4, 100]);
  });

  test('draws flat data as equal full bars, and all zeros as minimum bars', () => {
    expect(barHeights([7, 7, 7], 80, 4)).toEqual([80, 80, 80]);
    expect(barHeights([0, 0], 80, 4)).toEqual([4, 4]);
  });
});

describe('describeGrowth', () => {
  test.each([
    [16.3, 'рост 16,3% за сутки'],
    [-4.1, 'падение 4,1% за сутки'],
    [0, 'без изменений за сутки'],
    [null, 'рост пока неизвестен'],
  ])('%p -> %s', (value, expected) => {
    expect(describeGrowth(value)).toBe(expected);
  });
});
