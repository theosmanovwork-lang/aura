import type { Trend } from '../../domain/trend';
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

export const seed: SeedData & Required<Pick<SeedData, 'users' | 'trends' | 'videos'>> = {
  users,
  trends,
  videos,
};
