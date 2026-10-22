import {
  assertValidStake,
  decidePrediction,
  MIN_STAKE,
  PAYOUT_MULTIPLIER,
  payoutFor,
} from '../../src/domain/predictionRules';

describe('decidePrediction', () => {
  test('comes true when the score grew', () => {
    expect(decidePrediction(100, 101)).toBe('won');
  });

  test('does not come true when the score fell', () => {
    expect(decidePrediction(100, 99)).toBe('lost');
    expect(decidePrediction(100, 0)).toBe('lost');
  });

  test('is a draw (void) when the score did not change', () => {
    expect(decidePrediction(100, 100)).toBe('void');
    expect(decidePrediction(0, 0)).toBe('void');
  });
});

describe('payoutFor', () => {
  test('returns the stake and the same amount on top when it came true', () => {
    expect(PAYOUT_MULTIPLIER).toBe(2);
    expect(payoutFor('won', 50)).toBe(100);
  });

  test('returns the stake in full on a draw', () => {
    expect(payoutFor('void', 50)).toBe(50);
  });

  test('pays nothing when it did not come true', () => {
    expect(payoutFor('lost', 50)).toBe(0);
  });

  test('pays nothing while the prediction is still open', () => {
    expect(payoutFor('open', 50)).toBe(0);
  });
});

describe('assertValidStake', () => {
  test('accepts the minimum and larger whole numbers', () => {
    expect(() => assertValidStake(MIN_STAKE)).not.toThrow();
    expect(() => assertValidStake(1000)).not.toThrow();
  });

  test.each([0, -10, MIN_STAKE - 1, 12.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53])(
    'rejects %p',
    (stake) => {
      expect(() => assertValidStake(stake)).toThrow('stake');
    },
  );
});
