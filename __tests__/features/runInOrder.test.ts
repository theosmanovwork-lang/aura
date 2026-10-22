import { runInOrder } from '../../src/features/runInOrder';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('runInOrder', () => {
  test('runs tasks with the same key one after another', async () => {
    const log: string[] = [];
    const task = (name: string, ms: number) => async () => {
      log.push(`${name} start`);
      await delay(ms);
      log.push(`${name} end`);
    };

    await Promise.all([runInOrder('k', task('a', 15)), runInOrder('k', task('b', 1))]);

    expect(log).toEqual(['a start', 'a end', 'b start', 'b end']);
  });

  test('runs tasks with different keys at the same time', async () => {
    const log: string[] = [];
    const task = (name: string, ms: number) => async () => {
      log.push(`${name} start`);
      await delay(ms);
      log.push(`${name} end`);
    };

    await Promise.all([runInOrder('x', task('a', 15)), runInOrder('y', task('b', 1))]);

    expect(log.slice(0, 2)).toEqual(['a start', 'b start']);
  });

  test('gives every task its own result', async () => {
    const results = await Promise.all([
      runInOrder('k', async () => 1),
      runInOrder('k', async () => 2),
    ]);

    expect(results).toEqual([1, 2]);
  });

  test('a failed task does not block the ones behind it', async () => {
    const failing = runInOrder('k', async () => {
      throw new Error('boom');
    });
    const next = runInOrder('k', async () => 'ok');

    await expect(failing).rejects.toThrow('boom');
    await expect(next).resolves.toBe('ok');
  });
});
