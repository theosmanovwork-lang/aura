import { countLabel, formatCount, pluralRu } from '../../src/i18n/plural';

const views = ['просмотр', 'просмотра', 'просмотров'] as const;

describe('pluralRu', () => {
  test.each([
    [0, 'просмотров'],
    [1, 'просмотр'],
    [2, 'просмотра'],
    [4, 'просмотра'],
    [5, 'просмотров'],
    [11, 'просмотров'],
    [12, 'просмотров'],
    [21, 'просмотр'],
    [22, 'просмотра'],
    [100, 'просмотров'],
    [101, 'просмотр'],
  ])('%i -> %s', (n, expected) => {
    expect(pluralRu(n, views)).toBe(expected);
  });
});

describe('formatCount', () => {
  test.each([
    [0, '0'],
    [999, '999'],
    [1000, '1 тыс.'],
    [4100, '4,1 тыс.'],
    [5000, '5 тыс.'],
    [12500, '12 тыс.'],
    [999999, '999 тыс.'],
    [1_000_000, '1 млн'],
    [1_500_000, '1,5 млн'],
  ])('%i -> %s', (n, expected) => {
    expect(formatCount(n)).toBe(expected);
  });
});

describe('countLabel', () => {
  test('uses the right word form for small numbers', () => {
    expect(countLabel(1, views)).toBe('1 просмотр');
    expect(countLabel(3, views)).toBe('3 просмотра');
    expect(countLabel(25, views)).toBe('25 просмотров');
  });

  test('switches to the compact form exactly at 1000 and at a million', () => {
    expect(countLabel(999, views)).toBe('999 просмотров');
    expect(countLabel(1000, views)).toBe('1 тыс. просмотров');
    expect(countLabel(1_000_000, views)).toBe('1 млн просмотров');
  });

  test('uses the genitive plural with compact numbers', () => {
    expect(countLabel(4100, views)).toBe('4,1 тыс. просмотров');
  });
});
