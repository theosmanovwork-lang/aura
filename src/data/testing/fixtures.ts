import { createLedgerEntry, type LedgerEntry } from '../../domain/ledger';
import type { Investment } from '../../domain/investment';
import type { VideoSnapshot } from '../../domain/videoPrice';
import { createPrediction, type Prediction } from '../../domain/prediction';
import type { Trend } from '../../domain/trend';
import type { TrendSnapshot } from '../../domain/trendSnapshot';
import type { User } from '../../domain/user';
import type { Video } from '../../domain/video';

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  nickname: 'test_user',
  createdAt: 1000,
  ...overrides,
});

export const makeTrend = (overrides: Partial<Trend> = {}): Trend => ({
  id: 't1',
  slug: 'test-wave',
  name: 'Тестовая волна',
  createdAt: 1000,
  ...overrides,
});

export const makeVideo = (overrides: Partial<Video> = {}): Video => ({
  id: 'v1',
  authorId: 'u1',
  trendId: 't1',
  title: 'Тестовое видео',
  videoUri: 'seed://video/test',
  isAiGenerated: false,
  ageRating: '12+',
  moderationStatus: 'published',
  likeCount: 0,
  viewCount: 0,
  createdAt: 1000,
  ...overrides,
});

export const makeEntry = (overrides: Partial<LedgerEntry> = {}): LedgerEntry =>
  createLedgerEntry({
    id: 'l1',
    userId: 'u1',
    amount: 100,
    kind: 'welcome_bonus',
    createdAt: 1000,
    ...overrides,
  });

export const makePrediction = (overrides: Partial<Prediction> = {}): Prediction => ({
  ...createPrediction({
    id: 'p1',
    userId: 'u1',
    trendId: 't1',
    stake: 50,
    baselineScore: 10,
    createdAt: 1000,
    closesAt: 2000,
  }),
  ...overrides,
});

export const makeSnapshot = (overrides: Partial<TrendSnapshot> = {}): TrendSnapshot => ({
  trendId: 't1',
  at: 1000,
  score: 100,
  ...overrides,
});

export const makeInvestment = (overrides: Partial<Investment> = {}): Investment => ({
  id: 'i1',
  userId: 'u1',
  videoId: 'v1',
  invested: 100,
  units: 0.025,
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
});

export const makeVideoSnapshot = (overrides: Partial<VideoSnapshot> = {}): VideoSnapshot => ({
  videoId: 'v1',
  at: 1000,
  price: 4000,
  ...overrides,
});
