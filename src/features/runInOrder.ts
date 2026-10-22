const queues = new Map<string, Promise<unknown>>();

/** Runs tasks with the same key one after another, so quick repeated taps cannot interleave. */
export function runInOrder<T>(key: string, task: () => Promise<T>): Promise<T> {
  const result = (queues.get(key) ?? Promise.resolve()).then(task, task);
  const tail = result.then(
    () => undefined,
    () => undefined,
  );
  queues.set(key, tail);
  void tail.then(() => {
    if (queues.get(key) === tail) queues.delete(key);
  });
  return result;
}
