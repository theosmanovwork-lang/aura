import {
  buyCost,
  maxBuyable,
  MAX_SHARES_PER_TRADE,
  sellNet,
  sharePrice,
} from '../../src/domain/shares';

describe('sharePrice', () => {
  test('starts at 10 and grows by 0.05 for every sold share', () => {
    expect(sharePrice(0)).toBe(10);
    expect(sharePrice(640)).toBeCloseTo(42, 10);
  });

  test('refuses a negative or fractional count', () => {
    expect(() => sharePrice(-1)).toThrow(RangeError);
    expect(() => sharePrice(1.5)).toThrow(RangeError);
  });
});

describe('buyCost', () => {
  test('one share costs the current price', () => {
    expect(buyCost(1, 640)).toBeCloseTo(sharePrice(640), 10);
  });

  test('several shares cost the sum of their prices', () => {
    const sum = Array.from({ length: 10 }, (_, i) => sharePrice(640 + i)).reduce(
      (a, b) => a + b,
      0,
    );
    expect(buyCost(10, 640)).toBeCloseTo(sum, 8);
  });

  test('zero shares cost nothing', () => {
    expect(buyCost(0, 640)).toBe(0);
  });
});

describe('sellNet', () => {
  test('selling brings the price of the last shares minus the 5% fee', () => {
    const gross = sharePrice(639) + sharePrice(638);
    expect(sellNet(2, 640)).toBeCloseTo(gross * 0.95, 8);
  });

  test('buying and selling the same shares at once loses at least the fee', () => {
    const paid = buyCost(10, 640);
    const back = sellNet(10, 650);
    expect(back).toBeCloseTo(paid * 0.95, 8);
  });

  test('cannot sell more than is sold', () => {
    expect(() => sellNet(5, 4)).toThrow(RangeError);
  });
});

describe('maxBuyable', () => {
  test('is the largest count the balance pays for', () => {
    const n = maxBuyable(1000, 640);
    expect(buyCost(n, 640)).toBeLessThanOrEqual(1000);
    expect(buyCost(n + 1, 640)).toBeGreaterThan(1000);
  });

  test('is zero when not even one share is affordable, and capped for huge balances', () => {
    expect(maxBuyable(5, 640)).toBe(0);
    expect(maxBuyable(1e12, 0)).toBe(MAX_SHARES_PER_TRADE);
  });
});
