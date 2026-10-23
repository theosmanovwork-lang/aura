import {
  addToPosition,
  assertValidInvestAmount,
  MAX_INVESTMENT_PER_VIDEO,
  MIN_INVESTMENT,
  openPosition,
  positionValue,
  takableAmount,
  takeFromPosition,
} from '../../src/domain/investment';
import { videoPrice } from '../../src/domain/videoPrice';
import { makeVideo } from '../../src/data/testing/fixtures';

const base = { id: 'i1', userId: 'u1', videoId: 'v1' };

describe('videoPrice', () => {
  test('is the views plus five times the Aura of the video', () => {
    expect(videoPrice(makeVideo({ viewCount: 3401, likeCount: 260 }))).toBe(3401 + 5 * 260);
  });

  test('is never below 1, so a new video can be priced', () => {
    expect(videoPrice(makeVideo({ viewCount: 0, likeCount: 0 }))).toBe(1);
  });
});

describe('assertValidInvestAmount', () => {
  test('accepts whole amounts from the minimum up to the cap', () => {
    expect(() => assertValidInvestAmount(MIN_INVESTMENT, 0)).not.toThrow();
    expect(() => assertValidInvestAmount(MAX_INVESTMENT_PER_VIDEO, 0)).not.toThrow();
  });

  test.each([0, -5, 9, 10.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (amount) => {
    expect(() => assertValidInvestAmount(amount, 0)).toThrow();
  });

  test('rejects what would take the video over the cap', () => {
    expect(() => assertValidInvestAmount(100, MAX_INVESTMENT_PER_VIDEO - 99)).toThrow(/cap/);
    expect(() => assertValidInvestAmount(100, MAX_INVESTMENT_PER_VIDEO - 100)).not.toThrow();
  });
});

describe('a position', () => {
  test('opens with shares equal to the amount divided by the price', () => {
    const position = openPosition({ ...base, amount: 100, price: 4000, now: 10 });

    expect(position).toEqual({
      ...base,
      invested: 100,
      units: 100 / 4000,
      createdAt: 10,
      updatedAt: 10,
    });
  });

  test('is worth its shares times the current price', () => {
    const position = openPosition({ ...base, amount: 100, price: 4000, now: 10 });

    expect(positionValue(position, 4000)).toBeCloseTo(100, 6);
    expect(positionValue(position, 5000)).toBeCloseTo(125, 6);
    expect(positionValue(position, 2000)).toBeCloseTo(50, 6);
  });

  test('adding more at a new price adds shares and the invested total', () => {
    const first = openPosition({ ...base, amount: 100, price: 4000, now: 10 });

    const second = addToPosition(first, { amount: 100, price: 5000, now: 20 });

    expect(second.invested).toBe(200);
    expect(second.units).toBeCloseTo(100 / 4000 + 100 / 5000, 10);
    expect(second.createdAt).toBe(10);
    expect(second.updatedAt).toBe(20);
  });

  test('does not change the position it was given', () => {
    const first = openPosition({ ...base, amount: 100, price: 4000, now: 10 });
    const copy = { ...first };

    addToPosition(first, { amount: 50, price: 4000, now: 20 });
    takeFromPosition(first, { amount: 10, price: 4000, now: 20 });

    expect(first).toEqual(copy);
  });
});

describe('taking Aura back', () => {
  const position = openPosition({ ...base, amount: 100, price: 4000, now: 10 });

  test('the most you can take is the value rounded down to a whole number', () => {
    expect(takableAmount(position, 4000)).toBe(100);
    expect(takableAmount(position, 4399)).toBe(109);
    expect(takableAmount(position, 1)).toBe(0);
  });

  test('taking part leaves shares and the invested total in proportion', () => {
    const { position: rest, payout } = takeFromPosition(position, {
      amount: 40,
      price: 4000,
      now: 30,
    });

    expect(payout).toBe(40);
    expect(positionValue(rest, 4000)).toBeCloseTo(60, 6);
    expect(rest.invested).toBe(60);
    expect(rest.updatedAt).toBe(30);
  });

  test('taking everything closes the position', () => {
    const { position: rest, payout } = takeFromPosition(position, {
      amount: 100,
      price: 4000,
      now: 30,
    });

    expect(payout).toBe(100);
    expect(rest.units).toBe(0);
    expect(rest.invested).toBe(0);
  });

  test('after a rise you can take more than you put in, after a fall less', () => {
    expect(takeFromPosition(position, { amount: 125, price: 5000, now: 30 }).payout).toBe(125);
    expect(takableAmount(position, 3000)).toBe(75);
  });

  test.each([0, -1, 1.5, Number.NaN])('rejects the amount %s', (amount) => {
    expect(() => takeFromPosition(position, { amount, price: 4000, now: 30 })).toThrow();
  });

  test('rejects more than the position is worth', () => {
    expect(() => takeFromPosition(position, { amount: 101, price: 4000, now: 30 })).toThrow(
      /worth/,
    );
  });
});
