import { assertValidLedgerEntry, type LedgerEntry } from '../../domain/ledger';
import type { Like } from '../../domain/like';
import type { Prediction } from '../../domain/prediction';
import type { Trend } from '../../domain/trend';
import type { User } from '../../domain/user';
import type { Video } from '../../domain/video';
import { DuplicateKeyError } from '../repositories/errors';
import type {
  LikeRepository,
  PredictionRepository,
  Repositories,
  TrendRepository,
  UserRepository,
  VideoRepository,
  WalletRepository,
} from '../repositories';
import { createCollection } from './collection';

export type SeedData = Readonly<{
  users?: readonly User[];
  trends?: readonly Trend[];
  videos?: readonly Video[];
  ledger?: readonly LedgerEntry[];
  predictions?: readonly Prediction[];
  likes?: readonly Like[];
}>;

const definedOnly = <T extends object>(patch: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<T>;

export function createMemoryUserRepository(initial: readonly User[] = []): UserRepository {
  const users = createCollection<User>('users', initial);
  return {
    create: async (user) => users.add(user),
    getById: async (id) => users.find(id),
    rename: async (id, nickname) => users.replace(id, (user) => ({ ...user, nickname })),
  };
}

export function createMemoryTrendRepository(initial: readonly Trend[] = []): TrendRepository {
  const trends = createCollection<Trend>('trends');
  const findBySlug = (slug: string) => trends.all().find((trend) => trend.slug === slug) ?? null;
  const add = (trend: Trend): Trend => {
    if (findBySlug(trend.slug)) throw new DuplicateKeyError('trends', trend.slug);
    return trends.add(trend);
  };
  initial.forEach(add);
  return {
    add: async (trend) => add(trend),
    list: async () => trends.all(),
    getById: async (id) => trends.find(id),
    getBySlug: async (slug) => findBySlug(slug),
  };
}

export function createMemoryVideoRepository(initial: readonly Video[] = []): VideoRepository {
  const videos = createCollection<Video>('videos', initial);
  return {
    add: async (video) => videos.add(video),
    getById: async (id) => videos.find(id),
    listPublished: async () =>
      videos
        .all()
        .filter((video) => video.moderationStatus === 'published')
        .sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id)),
    update: async (id, patch) =>
      videos.replace(id, (video) => ({ ...video, ...definedOnly(patch) })),
  };
}

export function createMemoryWalletRepository(
  initial: readonly LedgerEntry[] = [],
): WalletRepository {
  const entries = createCollection<LedgerEntry>('ledger', initial);
  const byUser = (userId: string) => entries.all().filter((entry) => entry.userId === userId);
  return {
    append: async (entry) => {
      assertValidLedgerEntry(entry);
      return entries.add(entry);
    },
    listByUser: async (userId) => byUser(userId),
    getBalance: async (userId) => byUser(userId).reduce((sum, entry) => sum + entry.amount, 0),
  };
}

export function createMemoryPredictionRepository(
  initial: readonly Prediction[] = [],
): PredictionRepository {
  const predictions = createCollection<Prediction>('predictions', initial);
  return {
    add: async (prediction) => predictions.add(prediction),
    getById: async (id) => predictions.find(id),
    listByUser: async (userId) => predictions.all().filter((p) => p.userId === userId),
    updateStatus: async (id, status) => predictions.replace(id, (p) => ({ ...p, status })),
  };
}

export function createMemoryLikeRepository(initial: readonly Like[] = []): LikeRepository {
  const likes: Like[] = [];
  const same = (userId: string, videoId: string) => (like: Like) =>
    like.userId === userId && like.videoId === videoId;
  const add = (like: Like): Like => {
    if (likes.some(same(like.userId, like.videoId))) {
      throw new DuplicateKeyError('likes', `${like.userId}/${like.videoId}`);
    }
    likes.push({ ...like });
    return { ...like };
  };
  initial.forEach(add);
  return {
    add: async (like) => add(like),
    remove: async (userId, videoId) => {
      const index = likes.findIndex(same(userId, videoId));
      if (index === -1) return false;
      likes.splice(index, 1);
      return true;
    },
    has: async (userId, videoId) => likes.some(same(userId, videoId)),
    listVideoIds: async (userId) =>
      likes.filter((like) => like.userId === userId).map((like) => like.videoId),
  };
}

export function createMemoryRepositories(seed: SeedData = {}): Repositories {
  return {
    users: createMemoryUserRepository(seed.users),
    trends: createMemoryTrendRepository(seed.trends),
    videos: createMemoryVideoRepository(seed.videos),
    wallet: createMemoryWalletRepository(seed.ledger),
    predictions: createMemoryPredictionRepository(seed.predictions),
    likes: createMemoryLikeRepository(seed.likes),
  };
}
