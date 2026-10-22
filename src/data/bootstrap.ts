import type { SeedData } from './memory';
import type { Repositories } from './repositories';

type Atomically = <T>(work: () => Promise<T>) => Promise<T>;

const runDirectly: Atomically = (work) => work();

/**
 * Fills an empty database with the demo data. Does nothing if any trend already exists.
 * Pass `atomically` (a transaction) so a crash midway cannot leave half-filled data behind.
 */
export async function ensureSeeded(
  repos: Repositories,
  seed: SeedData,
  atomically: Atomically = runDirectly,
): Promise<void> {
  if ((await repos.trends.list()).length > 0) return;

  await atomically(async () => {
    for (const user of seed.users ?? []) await repos.users.create(user);
    for (const trend of seed.trends ?? []) await repos.trends.add(trend);
    for (const video of seed.videos ?? []) await repos.videos.add(video);
    for (const snapshot of seed.snapshots ?? []) await repos.snapshots.add(snapshot);
    for (const entry of seed.ledger ?? []) await repos.wallet.append(entry);
    for (const prediction of seed.predictions ?? []) await repos.predictions.add(prediction);
    for (const like of seed.likes ?? []) await repos.likes.add(like);
  });
}
