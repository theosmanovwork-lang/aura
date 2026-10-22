import type { Repositories } from '../../data/repositories';
import { DuplicateKeyError } from '../../data/repositories';
import { createLedgerEntry, type LedgerEntry } from '../../domain/ledger';

/** Points every new user starts with. Virtual: they cannot be bought, withdrawn or exchanged. */
export const WELCOME_BONUS_POINTS = 1000;

/** Gives the welcome bonus once per user, however often this is called. */
export async function ensureWelcomeBonus(
  repos: Repositories,
  userId: string,
  now: number,
): Promise<void> {
  const entries = await repos.wallet.listByUser(userId);
  if (entries.some((entry) => entry.kind === 'welcome_bonus')) return;

  try {
    await repos.wallet.append(
      createLedgerEntry({
        id: `welcome-${userId}`,
        userId,
        amount: WELCOME_BONUS_POINTS,
        kind: 'welcome_bonus',
        createdAt: now,
      }),
    );
  } catch (error) {
    // A parallel call gave the bonus a moment ago: the user has it, which is all we want.
    if (!(error instanceof DuplicateKeyError)) throw error;
  }
}

export type WalletView = Readonly<{ balance: number; entries: readonly LedgerEntry[] }>;

/** The balance and the history (newest operation first). Gives the welcome bonus if due. */
export async function loadWallet(
  repos: Repositories,
  userId: string,
  now: number,
): Promise<WalletView> {
  await ensureWelcomeBonus(repos, userId, now);
  const entries = await repos.wallet.listByUser(userId);
  // The balance comes from the very entries that are shown, so the two can never disagree.
  const balance = entries.reduce((sum, entry) => sum + entry.amount, 0);
  return { balance, entries: [...entries].reverse() };
}
