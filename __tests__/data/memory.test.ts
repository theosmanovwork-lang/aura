import {
  createMemoryLikeRepository,
  createMemoryPredictionRepository,
  createMemoryRepositories,
  createMemoryTrendRepository,
  createMemoryTrendSnapshotRepository,
  createMemoryUserRepository,
  createMemoryVideoRepository,
  createMemoryWalletRepository,
} from '../../src/data/memory';
import {
  runLikeRepositoryContract,
  runPredictionRepositoryContract,
  runTrendRepositoryContract,
  runTrendSnapshotRepositoryContract,
  runUserRepositoryContract,
  runVideoRepositoryContract,
  runWalletRepositoryContract,
} from '../../src/data/testing/contracts';
import { makeTrend, makeUser, makeVideo } from '../../src/data/testing/fixtures';

runUserRepositoryContract(() => createMemoryUserRepository());
runTrendRepositoryContract(() => createMemoryTrendRepository());
runVideoRepositoryContract(() => createMemoryVideoRepository());
runWalletRepositoryContract(() => createMemoryWalletRepository());
runPredictionRepositoryContract(() => createMemoryPredictionRepository());
runLikeRepositoryContract(() => createMemoryLikeRepository());
runTrendSnapshotRepositoryContract(() => createMemoryTrendSnapshotRepository());

describe('createMemoryRepositories', () => {
  test('starts empty without a seed', async () => {
    const repos = createMemoryRepositories();

    expect(await repos.trends.list()).toEqual([]);
    expect(await repos.videos.listPublished()).toEqual([]);
    expect(await repos.users.getById('u1')).toBeNull();
  });

  test('loads the given seed data', async () => {
    const repos = createMemoryRepositories({
      users: [makeUser()],
      trends: [makeTrend()],
      videos: [makeVideo()],
    });

    expect(await repos.users.getById('u1')).toEqual(makeUser());
    expect(await repos.trends.getBySlug('test-wave')).toEqual(makeTrend());
    expect((await repos.videos.listPublished()).map((v) => v.id)).toEqual(['v1']);
  });

  test('rejects a seed with duplicate trend slugs', () => {
    const trends = [makeTrend({ id: 'a', slug: 'x' }), makeTrend({ id: 'b', slug: 'x' })];

    expect(() => createMemoryTrendRepository(trends)).toThrow('already exists');
  });

  test('does not share state between two instances', async () => {
    const first = createMemoryRepositories();
    const second = createMemoryRepositories();
    await first.trends.add(makeTrend());

    expect(await second.trends.list()).toEqual([]);
  });
});
