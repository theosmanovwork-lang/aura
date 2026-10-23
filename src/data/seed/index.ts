import type { Comment } from '../../domain/comment';
import type { Trend } from '../../domain/trend';
import type { TrendSnapshot } from '../../domain/trendSnapshot';
import { videoPrice, type VideoSnapshot } from '../../domain/videoPrice';
import { calcTrendScore } from '../../domain/trendScore';
import type { User } from '../../domain/user';
import type { AgeRating, ModerationStatus, Video } from '../../domain/video';
import type { SeedData } from '../memory';

export const CURRENT_USER_ID = 'user-me';

const DAY = 24 * 60 * 60 * 1000;
const BASE_TIME = Date.UTC(2026, 0, 1);

const users: readonly User[] = [
  { id: CURRENT_USER_ID, nickname: 'гость', createdAt: BASE_TIME },
  { id: 'user-lis', nickname: 'нейро_лис', createdAt: BASE_TIME },
  { id: 'user-eter', nickname: 'тихий_эфир', createdAt: BASE_TIME },
  { id: 'user-mila', nickname: 'мила_в_кадре', createdAt: BASE_TIME },
  { id: 'user-ray', nickname: 'рэй_монтаж', createdAt: BASE_TIME },
];

const trends: readonly Trend[] = [
  { id: 'trend-neirokot', slug: 'neirokot', name: 'Нейрокот', createdAt: BASE_TIME },
  { id: 'trend-gorod', slug: 'gorod-buduschego', name: 'Город будущего', createdAt: BASE_TIME },
  {
    id: 'trend-probezhka',
    slug: 'utrennyaya-probezhka',
    name: 'Утренняя пробежка',
    createdAt: BASE_TIME,
  },
  { id: 'trend-kofe', slug: 'kofe-pod-dozhdem', name: 'Кофе под дождём', createdAt: BASE_TIME },
  { id: 'trend-roboty', slug: 'tanets-robotov', name: 'Танец роботов', createdAt: BASE_TIME },
];

type VideoDraft = readonly [
  n: number,
  authorId: string,
  trendId: string,
  title: string,
  isAiGenerated: boolean,
  ageRating: AgeRating,
  likeCount: number,
  viewCount: number,
  moderationStatus?: ModerationStatus,
];

const drafts: readonly VideoDraft[] = [
  [1, 'user-lis', 'trend-neirokot', 'Кот-астронавт летит к Луне', true, '0+', 320, 4100],
  [2, 'user-lis', 'trend-neirokot', 'Коты играют в шахматы', true, '0+', 210, 2900],
  [3, 'user-eter', 'trend-gorod', 'Летающие трамваи над рекой', true, '6+', 540, 7200],
  [4, 'user-eter', 'trend-gorod', 'Зелёный небоскрёб на рассвете', true, '6+', 180, 1900],
  [5, 'user-me', 'trend-probezhka', 'Пять километров до завтрака', false, '0+', 95, 800],
  [6, 'user-eter', 'trend-kofe', 'Тихий дождь и горячий кофе', false, '0+', 410, 5300],
  [7, 'user-lis', 'trend-roboty', 'Роботы танцуют вальс', true, '6+', 260, 3400],
  [8, 'user-me', 'trend-roboty', 'Робот-уборщик в ритме диско', true, '12+', 12, 90, 'pending'],
];

const videos: readonly Video[] = drafts.map(
  ([n, authorId, trendId, title, isAiGenerated, ageRating, likeCount, viewCount, status]) => ({
    id: `video-${n}`,
    authorId,
    trendId,
    title,
    videoUri: `seed://video/${n}`,
    isAiGenerated,
    ageRating,
    moderationStatus: status ?? 'published',
    likeCount,
    viewCount,
    createdAt: BASE_TIME + n * DAY,
  }),
);

/** How the index of each demo trend grew over 14 days, as a share of today's score. */
const HISTORY_CURVES: Readonly<Record<string, readonly number[]>> = {
  'trend-neirokot': [0.3, 0.34, 0.38, 0.41, 0.46, 0.5, 0.54, 0.58, 0.62, 0.67, 0.72, 0.76, 0.8, 1],
  'trend-gorod': [0.5, 0.52, 0.55, 0.58, 0.6, 0.64, 0.67, 0.7, 0.74, 0.78, 0.82, 0.86, 0.9, 1],
  'trend-probezhka': [0.9, 0.95, 0.92, 0.98, 1.0, 1.02, 1.0, 1.05, 1.03, 1.06, 1.04, 1.05, 1.04, 1],
  'trend-kofe': [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.18, 1.25, 1.3, 1.28, 1.22, 1.17, 1.12, 1],
  'trend-roboty': [0.4, 0.55, 0.5, 0.65, 0.6, 0.75, 0.7, 0.85, 0.8, 0.9, 0.84, 0.93, 0.95, 1],
};

/** How a video's price grew over its last 14 days, as shares of the price now. */
const VIDEO_CURVE: readonly number[] = [
  0.5, 0.56, 0.52, 0.6, 0.66, 0.62, 0.7, 0.76, 0.72, 0.8, 0.86, 0.9, 0.95, 1,
];

type CommentDraft = readonly [n: number, videoN: number, authorId: string, text: string];

/** Fictional demo comments: «n» is only used to build the id and the time (hours after the video). */
const commentDrafts: readonly CommentDraft[] = [
  [1, 1, 'user-mila', 'Кот в скафандре — это сильно'],
  [2, 1, 'user-ray', 'Музыка подходит идеально'],
  [3, 1, 'user-eter', 'Хочу продолжение с Марсом'],
  [4, 3, 'user-lis', 'Трамваи над рекой выглядят как мечта'],
  [5, 3, 'user-mila', 'Сколько времени ушло на монтаж?'],
  [6, 6, 'user-ray', 'Дождь за окном и этот ролик — идеальный вечер'],
  [7, 7, 'user-mila', 'Вальс получился лучше, чем у людей'],
];

const comments: readonly Comment[] = commentDrafts.map(([n, videoN, authorId, text]) => ({
  id: `comment-${n}`,
  videoId: `video-${videoN}`,
  authorId,
  text,
  createdAt: BASE_TIME + videoN * DAY + n * 60 * 60 * 1000,
}));

type SeedContent = SeedData &
  Required<
    Pick<SeedData, 'users' | 'trends' | 'videos' | 'snapshots' | 'videoSnapshots' | 'comments'>
  >;

/** Demo content whose 14-day growth history ends at `now` (the moment of the first start). */
export function createSeed(now: number): SeedContent {
  const snapshots: readonly TrendSnapshot[] = trends.flatMap((trend) => {
    const current = calcTrendScore(videos.filter((video) => video.trendId === trend.id));
    const curve = HISTORY_CURVES[trend.id] ?? [1];
    return curve.map((share, index) => ({
      trendId: trend.id,
      at: now - (curve.length - 1 - index) * DAY,
      score: Math.round(current * share),
    }));
  });
  const videoSnapshots: readonly VideoSnapshot[] = videos.flatMap((video) => {
    const current = videoPrice(video);
    const curve = VIDEO_CURVE;
    return curve.map((share, index) => ({
      videoId: video.id,
      at: now - (curve.length - 1 - index) * DAY,
      price: Math.max(1, Math.round(current * share * 100) / 100),
    }));
  });
  return { users, trends, videos, snapshots, videoSnapshots, comments };
}

/** A fixed moment, so tests and previews always see the same data. */
export const seed: SeedContent = createSeed(BASE_TIME + 23 * DAY);
