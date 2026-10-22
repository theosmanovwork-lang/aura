import {
  ensureWelcomeBonus,
  loadWallet,
  WELCOME_BONUS_POINTS,
} from '../../src/features/wallet/walletService';
import { createMemoryRepositories } from '../../src/data/memory';
import { createSqliteRepositories } from '../../src/data/sqlite';
import { migrate } from '../../src/data/sqlite/migrations';
import type { Repositories } from '../../src/data/repositories';
import { makeEntry } from '../../src/data/testing/fixtures';
import { createTestDatabase } from '../../src/data/testing/sqljs';

const memory = async (): Promise<Repositories> => createMemoryRepositories();
const sqlite = async (): Promise<Repositories> => {
  const db = await createTestDatabase();
  await migrate(db);
  return createSqliteRepositories(db);
};

describe.each([
  ['memory', memory],
  ['sqlite', sqlite],
])('wallet service on %s repositories', (_name, open) => {
  test('gives a new user the welcome bonus', async () => {
    const repos = await open();

    await ensureWelcomeBonus(repos, 'u1', 1000);

    expect(await repos.wallet.getBalance('u1')).toBe(WELCOME_BONUS_POINTS);
    const [entry] = await repos.wallet.listByUser('u1');
    expect(entry).toMatchObject({
      kind: 'welcome_bonus',
      amount: WELCOME_BONUS_POINTS,
      createdAt: 1000,
    });
  });

  test('gives the welcome bonus only once, however often it is asked for', async () => {
    const repos = await open();

    await ensureWelcomeBonus(repos, 'u1', 1000);
    await ensureWelcomeBonus(repos, 'u1', 2000);
    await Promise.all([
      ensureWelcomeBonus(repos, 'u1', 3000),
      ensureWelcomeBonus(repos, 'u1', 3000),
    ]);

    expect(await repos.wallet.listByUser('u1')).toHaveLength(1);
    expect(await repos.wallet.getBalance('u1')).toBe(WELCOME_BONUS_POINTS);
  });

  test('does not give the bonus again to a user who spent everything', async () => {
    const repos = await open();
    await ensureWelcomeBonus(repos, 'u1', 1000);
    await repos.wallet.append(
      makeEntry({ id: 's', amount: -WELCOME_BONUS_POINTS, kind: 'prediction_stake' }),
    );

    await ensureWelcomeBonus(repos, 'u1', 5000);

    expect(await repos.wallet.getBalance('u1')).toBe(0);
  });

  test('every user gets their own bonus', async () => {
    const repos = await open();

    await ensureWelcomeBonus(repos, 'u1', 1);
    await ensureWelcomeBonus(repos, 'u2', 2);

    expect(await repos.wallet.getBalance('u1')).toBe(WELCOME_BONUS_POINTS);
    expect(await repos.wallet.getBalance('u2')).toBe(WELCOME_BONUS_POINTS);
  });

  test('the balance is calculated from the very history that is shown', async () => {
    const repos = await open();
    const getBalance = jest.spyOn(repos.wallet, 'getBalance').mockResolvedValue(999999);

    const wallet = await loadWallet(repos, 'u1', 1000);

    expect(wallet.balance).toBe(WELCOME_BONUS_POINTS);
    getBalance.mockRestore();
  });

  test('loading the wallet gives the bonus first and returns balance and history', async () => {
    const repos = await open();

    const wallet = await loadWallet(repos, 'u1', 1000);

    expect(wallet.balance).toBe(WELCOME_BONUS_POINTS);
    expect(wallet.entries.map((e) => e.kind)).toEqual(['welcome_bonus']);
  });

  test('the balance always equals the sum of the history, newest operation first', async () => {
    const repos = await open();
    await ensureWelcomeBonus(repos, 'u1', 1000);
    await repos.wallet.append(
      makeEntry({ id: 'a', amount: -300, kind: 'prediction_stake', createdAt: 2000 }),
    );
    await repos.wallet.append(
      makeEntry({ id: 'b', amount: 450, kind: 'prediction_payout', createdAt: 3000 }),
    );

    const wallet = await loadWallet(repos, 'u1', 4000);

    expect(wallet.entries.map((e) => e.id)).toEqual(['b', 'a', 'welcome-u1']);
    expect(wallet.balance).toBe(wallet.entries.reduce((sum, e) => sum + e.amount, 0));
    expect(wallet.balance).toBe(WELCOME_BONUS_POINTS - 300 + 450);
  });
});
