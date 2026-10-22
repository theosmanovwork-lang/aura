export type LedgerAsset = 'POINTS';

export type LedgerKind = 'welcome_bonus' | 'prediction_stake' | 'prediction_payout';

export type LedgerEntry = Readonly<{
  id: string;
  userId: string;
  /** Whole number of points; positive adds, negative spends. Never zero. */
  amount: number;
  asset: LedgerAsset;
  kind: LedgerKind;
  refId?: string;
  createdAt: number;
}>;

export type LedgerEntryInput = Omit<LedgerEntry, 'asset'>;

/** Throws unless the entry is a whole, non-zero amount of POINTS. */
export function assertValidLedgerEntry(entry: LedgerEntry): void {
  if (!Number.isSafeInteger(entry.amount) || entry.amount === 0) {
    throw new Error('amount must be a non-zero whole number');
  }
  if (entry.asset !== 'POINTS') {
    throw new Error('asset must be POINTS');
  }
}

export function createLedgerEntry(input: LedgerEntryInput): LedgerEntry {
  const entry: LedgerEntry = { ...input, asset: 'POINTS' };
  assertValidLedgerEntry(entry);
  return entry;
}
