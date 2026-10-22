import { assertValidLedgerEntry, type LedgerEntry, type LedgerKind } from '../../domain/ledger';
import type { WalletRepository } from '../repositories';
import type { SqlDatabase } from './database';
import { insertRow } from './support';

type LedgerRow = {
  id: string;
  user_id: string;
  amount: number;
  kind: string;
  ref_id: string | null;
  created_at: number;
};

const toEntry = (row: LedgerRow): LedgerEntry => ({
  id: row.id,
  userId: row.user_id,
  amount: row.amount,
  asset: 'POINTS',
  kind: row.kind as LedgerKind,
  ...(row.ref_id === null ? {} : { refId: row.ref_id }),
  createdAt: row.created_at,
});

export function createSqliteWalletRepository(db: SqlDatabase): WalletRepository {
  return {
    append: async (entry) => {
      assertValidLedgerEntry(entry);
      await insertRow(
        db,
        'ledger',
        `INSERT INTO ledger (id, user_id, amount, asset, kind, ref_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.userId,
          entry.amount,
          entry.asset,
          entry.kind,
          entry.refId ?? null,
          entry.createdAt,
        ],
        { id: entry.id },
      );
      return entry;
    },
    listByUser: async (userId) =>
      (
        await db.all<LedgerRow>('SELECT * FROM ledger WHERE user_id = ? ORDER BY seq', [userId])
      ).map(toEntry),
    getBalance: async (userId) => {
      const [row] = await db.all<{ balance: number }>(
        'SELECT COALESCE(SUM(amount), 0) AS balance FROM ledger WHERE user_id = ?',
        [userId],
      );
      return row?.balance ?? 0;
    },
  };
}
