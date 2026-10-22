import * as SQLite from 'expo-sqlite';

import { openExpoDatabase } from '../../src/data/sqlite/expoDatabase';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));

const fakeNative = () => ({
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ changes: 2, lastInsertRowId: 7 }),
  getAllAsync: jest.fn().mockResolvedValue([{ id: 'a' }]),
});

describe('openExpoDatabase', () => {
  test('opens the named database and adapts the expo-sqlite calls', async () => {
    const native = fakeNative();
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(native);

    const db = await openExpoDatabase('aura.db');

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('aura.db');
    await db.exec('CREATE TABLE t (x)');
    expect(native.execAsync).toHaveBeenCalledWith('CREATE TABLE t (x)');
    expect(await db.run('DELETE FROM t WHERE x = ?', [1])).toBe(2);
    expect(native.runAsync).toHaveBeenCalledWith('DELETE FROM t WHERE x = ?', [1]);
    expect(await db.all('SELECT id FROM t', [])).toEqual([{ id: 'a' }]);
    expect(native.getAllAsync).toHaveBeenCalledWith('SELECT id FROM t', []);
  });

  test('passes an empty parameter list when none is given', async () => {
    const native = fakeNative();
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(native);

    const db = await openExpoDatabase('aura.db');
    await db.run('DELETE FROM t');
    await db.all('SELECT 1');

    expect(native.runAsync).toHaveBeenCalledWith('DELETE FROM t', []);
    expect(native.getAllAsync).toHaveBeenCalledWith('SELECT 1', []);
  });
});
