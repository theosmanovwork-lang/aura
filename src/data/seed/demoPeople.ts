/**
 * Made-up conversation, clan and person for the Dialog, Clan and Profile screens of the design.
 * The same on every start; nothing is stored or sent.
 */
import type { AvatarTone } from '../../components/Avatar';

export type DemoMessage =
  | Readonly<{ kind: 'day'; text: string }>
  | Readonly<{ kind: 'in'; text: string }>
  | Readonly<{ kind: 'out'; text: string }>
  | Readonly<{ kind: 'gift'; title: string; caption: string }>
  | Readonly<{
      kind: 'trade';
      give: Readonly<{ rarity: 'rare' | 'common'; no: string; name: string }>;
      take: Readonly<{ rarity: 'rare' | 'common'; no: string; name: string }>;
    }>;

export const demoMessages: readonly DemoMessage[] = [
  { kind: 'day', text: 'Сегодня' },
  { kind: 'in', text: 'привет! видела твоё видео с закатом, топ' },
  { kind: 'out', text: 'спасибо! закинула ауру в него?' },
  { kind: 'gift', title: 'Подарок: 200 ауры', caption: 'kira · за лучший закат недели' },
  {
    kind: 'trade',
    give: { rarity: 'rare', no: '#233', name: 'NPC-стрим' },
    take: { rarity: 'common', no: '#008', name: 'Говорящий хлеб' },
  },
];

export type DemoClanMember = Readonly<{
  place: number;
  initial: string;
  name: string;
  meta: string;
  points: string;
  tone: AvatarTone;
  ring: string | null;
  role: 'leader' | 'officer' | null;
}>;

export const demoClanProfile = {
  id: 'clan-neon',
  name: 'Неон',
  initial: 'Н',
  rank: 1,
  members: 48,
  capacity: 50,
  level: 12,
  stats: { points: '128K', cards: '214', week: '+8%' },
  chest: { done: 7, total: 10, days: 2, next: 'Вместе вложить 5 000 ауры в один ролик' },
  tags: ['авто', 'мемы', 'рус'],
  about:
    'Ловим тренды раньше всех и собираем авто-серию. Активность — минимум 3 инвеста в неделю. Вход по заявке.',
  list: [
    {
      place: 1,
      initial: 'K',
      name: 'kira',
      meta: '312 инвестов · 41 карточка',
      points: '18,2K',
      tone: 'brand',
      ring: '#E8B04B',
      role: 'leader',
    },
    {
      place: 2,
      initial: 'D',
      name: 'denis_f',
      meta: '280 инвестов · 37 карточек',
      points: '15,9K',
      tone: 'green',
      ring: '#C9CDD3',
      role: 'officer',
    },
    {
      place: 3,
      initial: 'L',
      name: 'lulu.mp4',
      meta: '201 инвест · 29 карточек',
      points: '12,4K',
      tone: 'ink',
      ring: '#C9CDD3',
      role: null,
    },
    {
      place: 4,
      initial: 'S',
      name: 'sasha.v',
      meta: '177 инвестов · 22 карточки',
      points: '9,8K',
      tone: 'amber',
      ring: null,
      role: null,
    },
    {
      place: 5,
      initial: 'A',
      name: 'artem.z',
      meta: '150 инвестов · 18 карточек',
      points: '8,1K',
      tone: 'ink',
      ring: null,
      role: null,
    },
  ] as readonly DemoClanMember[],
};

export const demoPerson = {
  name: 'Кира',
  bio: 'Охочусь за трендами до того, как они стали трендами',
  rank: 1,
  clan: { initial: 'Н', name: 'Неон', role: 'leader' as const },
  followers: 12400,
  following: 318,
  cards: 41,
  accuracy: 84,
  tiles: [
    { bg: '#4E2273', views: '48K', pinned: true },
    { bg: '#3A3FD4', views: '12K', pinned: false },
    { bg: '#B98A2E', views: '9,1K', pinned: false },
    { bg: '#0B7D61', views: '204K', pinned: false },
    { bg: '#1A1A1A', views: '3,3K', pinned: false },
    { bg: '#7A3E2E', views: '27K', pinned: false },
  ],
};
