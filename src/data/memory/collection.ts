import { DuplicateKeyError, NotFoundError } from '../repositories/errors';

/** Small in-memory table keyed by id. Always hands out copies. */
export function createCollection<T extends { readonly id: string }>(
  label: string,
  initial: readonly T[] = [],
) {
  const items = new Map<string, T>();

  const add = (item: T): T => {
    if (items.has(item.id)) throw new DuplicateKeyError(label, item.id);
    items.set(item.id, { ...item });
    return { ...item };
  };
  initial.forEach(add);

  const find = (id: string): T | null => {
    const item = items.get(id);
    return item ? { ...item } : null;
  };

  const replace = (id: string, change: (current: T) => T): T => {
    const current = items.get(id);
    if (!current) throw new NotFoundError(label, id);
    const next = change({ ...current });
    items.set(id, { ...next });
    return { ...next };
  };

  const all = (): T[] => [...items.values()].map((item) => ({ ...item }));

  return { add, find, replace, all };
}
