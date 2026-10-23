/**
 * Made-up people, clans, chats and cards for the screens of the design (Community, Chats, Cards).
 * None of it is stored: it is the same on every start. Real data (balance, videos, comments,
 * investments) comes from the repositories.
 */

export type RarityKey = 'common' | 'rare' | 'special' | 'treasure';

export type DemoLot = Readonly<{
  id: string;
  rarity: RarityKey;
  no: string;
  name: string;
  grade: string;
  seller: string;
  run: string;
  time: string;
  bid: string;
  price: string;
}>;

const CAR_NAME = 'Дедова классика';

export const demoLots: readonly DemoLot[] = [
  {
    id: 'lot-1',
    rarity: 'treasure',
    no: '#071',
    name: CAR_NAME,
    grade: '10',
    seller: '@kira',
    run: '50',
    time: '02:14:38',
    bid: '12 400',
    price: '15 000',
  },
  {
    id: 'lot-2',
    rarity: 'special',
    no: '#071',
    name: CAR_NAME,
    grade: '9.5',
    seller: '@lulu.mp4',
    run: '500',
    time: '00:41:05',
    bid: '3 200',
    price: '3 900',
  },
  {
    id: 'lot-3',
    rarity: 'rare',
    no: '#071',
    name: CAR_NAME,
    grade: '9',
    seller: '@denis_f',
    run: '2 500',
    time: '05:02:11',
    bid: '860',
    price: '990',
  },
  {
    id: 'lot-4',
    rarity: 'common',
    no: '#071',
    name: CAR_NAME,
    grade: '8.5',
    seller: '@sasha.v',
    run: '10 000',
    time: '11:30:00',
    bid: '120',
    price: '150',
  },
];

export type DemoClan = Readonly<{
  id: string;
  name: string;
  initial: string;
  members: number;
  tone: 'silver' | 'ink' | 'brand';
}>;

export const demoClans: readonly DemoClan[] = [
  { id: 'clan-neon', name: 'Неон', initial: 'Н', members: 48, tone: 'silver' },
  { id: 'clan-midnight', name: 'Полночь', initial: 'П', members: 45, tone: 'ink' },
  { id: 'clan-storm', name: 'Шторм', initial: 'Ш', members: 39, tone: 'brand' },
];

export type DemoDialog = Readonly<{
  id: string;
  name: string;
  initial: string;
  tone: 'brand' | 'silver' | 'green' | 'ink' | 'amber';
  message: string;
  time: string;
  unread: number;
  online: boolean;
  clan?: boolean;
}>;

export const demoDialogs: readonly DemoDialog[] = [
  {
    id: 'd1',
    name: 'kira',
    initial: 'K',
    tone: 'brand',
    message: 'го в один клан? у нас уже 12',
    time: '19:42',
    unread: 2,
    online: true,
  },
  {
    id: 'd2',
    name: 'Клан «Неон»',
    initial: 'Н',
    tone: 'silver',
    message: 'denis_f: сундук недели открыт',
    time: '19:10',
    unread: 14,
    online: false,
    clan: true,
  },
  {
    id: 'd3',
    name: 'lulu.mp4',
    initial: 'L',
    tone: 'green',
    message: 'спасибо за 200 ауры!!',
    time: '18:03',
    unread: 1,
    online: true,
  },
  {
    id: 'd4',
    name: 'sasha.v',
    initial: 'S',
    tone: 'ink',
    message: 'Вы: меняю NPC-стрим на хлеб?',
    time: 'вчера',
    unread: 0,
    online: false,
  },
  {
    id: 'd5',
    name: 'denis_f',
    initial: 'D',
    tone: 'amber',
    message: 'посмотри мой новый ролик',
    time: 'вчера',
    unread: 0,
    online: true,
  },
  {
    id: 'd6',
    name: 'Поддержка Аура',
    initial: 'А',
    tone: 'ink',
    message: 'Привет! Чем можем помочь?',
    time: 'пн',
    unread: 0,
    online: false,
  },
];

export const demoGlobalChat = {
  online: 1284,
  author: 'kira',
  initial: 'K',
  message: 'кто на аукцион в 20:00? несу легенду',
} as const;

export const demoReferralCode = 'MIRA-77';

export type DemoCollectionCard =
  | Readonly<{
      kind: 'open';
      id: string;
      rarity: RarityKey;
      no: string;
      name: string;
      grade: string;
      run: string;
    }>
  | Readonly<{ kind: 'locked'; id: string; no: string }>;

export const demoCollection: readonly DemoCollectionCard[] = [
  {
    kind: 'open',
    id: 'c1',
    rarity: 'treasure',
    no: '#071',
    name: CAR_NAME,
    grade: '10',
    run: '50',
  },
  {
    kind: 'open',
    id: 'c2',
    rarity: 'special',
    no: '#071',
    name: CAR_NAME,
    grade: '9.5',
    run: '500',
  },
  {
    kind: 'open',
    id: 'c3',
    rarity: 'common',
    no: '#071',
    name: CAR_NAME,
    grade: '8.5',
    run: '10 000',
  },
  { kind: 'locked', id: 'c4', no: '#117' },
  { kind: 'locked', id: 'c5', no: '#156' },
  { kind: 'locked', id: 'c6', no: '#201' },
];

export const demoCollectionCounts = { have: 14, total: 60 } as const;

export const demoChests = 3;

/** The made-up details of the profile that the app does not store yet. */
export const demoProfile = {
  displayName: 'Мира',
  bio: 'Снимаю закаты и крыши · Москва',
  followers: 1204,
} as const;
