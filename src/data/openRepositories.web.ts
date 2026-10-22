import { createMemoryRepositories } from './memory';
import type { Repositories } from './repositories';
import { seed } from './seed';

/** In the browser (only used for quick previews) data lives in memory and is not saved. */
export const openRepositories = async (): Promise<Repositories> => createMemoryRepositories(seed);
