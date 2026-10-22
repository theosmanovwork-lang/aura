import type { LedgerEntry } from '../../domain/ledger';
import type { Like } from '../../domain/like';
import type { Prediction, PredictionStatus } from '../../domain/prediction';
import type { Trend } from '../../domain/trend';
import type { User } from '../../domain/user';
import type { ModerationStatus, Video } from '../../domain/video';

export { DuplicateKeyError, NotFoundError } from './errors';

/*
 * Rules for every implementation (memory, SQLite, server):
 * - no foreign-key checks: an entity may reference an id that is not stored yet;
 * - ids are unique (DuplicateKeyError), unknown ids throw NotFoundError;
 * - "insertion order" means the order of add/append calls (SQL: ORDER BY rowid or a sequence);
 * - list methods are unbounded for now; add limit/cursor before real data volumes;
 * - repositories do not re-validate domain rules, except WalletRepository.append,
 *   which rejects invalid ledger entries because the ledger is the weakest spot;
 *   create other objects with the domain factories (createPrediction, ...).
 */
export interface UserRepository {
  create(user: User): Promise<User>;
  getById(id: string): Promise<User | null>;
  rename(id: string, nickname: string): Promise<User>;
}

export interface TrendRepository {
  add(trend: Trend): Promise<Trend>;
  list(): Promise<Trend[]>;
  getById(id: string): Promise<Trend | null>;
  getBySlug(slug: string): Promise<Trend | null>;
}

export type VideoUpdate = Partial<
  Readonly<{ likeCount: number; viewCount: number; moderationStatus: ModerationStatus }>
>;

export interface VideoRepository {
  add(video: Video): Promise<Video>;
  getById(id: string): Promise<Video | null>;
  /** Only published videos, newest first; equal createdAt is ordered by id. */
  listPublished(): Promise<Video[]>;
  /** Sets absolute values (undefined keys are ignored). Atomic counters come with a server. */
  update(id: string, patch: VideoUpdate): Promise<Video>;
}

/** Append-only: entries can be added and read, never changed or removed. */
export interface WalletRepository {
  append(entry: LedgerEntry): Promise<LedgerEntry>;
  listByUser(userId: string): Promise<LedgerEntry[]>;
  getBalance(userId: string): Promise<number>;
}

export interface PredictionRepository {
  add(prediction: Prediction): Promise<Prediction>;
  getById(id: string): Promise<Prediction | null>;
  listByUser(userId: string): Promise<Prediction[]>;
  updateStatus(id: string, status: PredictionStatus): Promise<Prediction>;
}

export interface LikeRepository {
  /** One like per user and video: a second one throws DuplicateKeyError. */
  add(like: Like): Promise<Like>;
  /** Returns true if a like was removed, false if there was none. */
  remove(userId: string, videoId: string): Promise<boolean>;
  has(userId: string, videoId: string): Promise<boolean>;
  /** Video ids the user liked, in the order they were liked. */
  listVideoIds(userId: string): Promise<string[]>;
}

export type Repositories = Readonly<{
  users: UserRepository;
  trends: TrendRepository;
  videos: VideoRepository;
  wallet: WalletRepository;
  predictions: PredictionRepository;
  likes: LikeRepository;
}>;
