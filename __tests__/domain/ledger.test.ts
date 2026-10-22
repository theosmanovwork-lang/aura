import { createLedgerEntry } from '../../src/domain/ledger';

const base = { id: 'l1', userId: 'u1', kind: 'welcome_bonus', createdAt: 1000 } as const;

describe('createLedgerEntry', () => {
  test('creates a POINTS entry with the given amount', () => {
    const entry = createLedgerEntry({ ...base, amount: 100 });

    expect(entry).toEqual({ ...base, amount: 100, asset: 'POINTS' });
  });

  test('allows a negative amount for spending points', () => {
    expect(createLedgerEntry({ ...base, kind: 'prediction_stake', amount: -30 }).amount).toBe(-30);
  });

  test.each([0, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 1e300, 2 ** 53, -(2 ** 53)])(
    'rejects amount %p',
    (amount) => {
      expect(() => createLedgerEntry({ ...base, amount })).toThrow('amount');
    },
  );

  test('keeps the optional refId', () => {
    const entry = createLedgerEntry({ ...base, kind: 'prediction_payout', amount: 5, refId: 'p1' });

    expect(entry.refId).toBe('p1');
  });
});
