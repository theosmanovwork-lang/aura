/** Made-up notifications for the screen of the design. Reading them is kept on the screen only. */
import type { AvatarTone } from '../../components/Avatar';

export type NoticeKind = 'outbid' | 'up' | 'letter' | 'chest' | 'sold';
export type NoticeFilter = 'all' | 'auction' | 'invest' | 'social';
export type NoticeTarget = 'lot' | 'invest' | 'user' | 'clan' | 'cards' | 'comments';

export type DemoNotice = Readonly<{
  id: string;
  group: 'today' | 'yesterday';
  kind: NoticeKind;
  letter?: string;
  tone?: AvatarTone;
  who: string;
  text: string;
  time: string;
  action?: string;
  silverAction?: boolean;
  target: NoticeTarget;
  /** The lot, the handle or the clan the notice leads to. */
  param?: string;
  unread: boolean;
}>;

/** Which filter shows which kind. Clan news only shows under «Все». */
export const NOTICE_FILTER_OF: Readonly<Record<NoticeKind, NoticeFilter | null>> = {
  outbid: 'auction',
  sold: 'auction',
  up: 'invest',
  letter: 'social',
  chest: null,
};

export const demoNotifications: readonly DemoNotice[] = [
  {
    id: 'n1',
    group: 'today',
    kind: 'outbid',
    who: 'Тебя перебили',
    text: 'на лоте «Дедова классика» — ставка 12 400 ауры',
    time: '2 мин назад',
    action: 'Перебить · 12 600',
    silverAction: true,
    target: 'lot',
    param: 'lot-1',
    unread: true,
  },
  {
    id: 'n2',
    group: 'today',
    kind: 'up',
    who: 'Твои доли выросли',
    text: 'на +133%: «Закат на крыше» от @mira.wav',
    time: '18 мин назад',
    action: 'Открыть доли',
    target: 'invest',
    unread: true,
  },
  {
    id: 'n3',
    group: 'today',
    kind: 'letter',
    letter: 'K',
    tone: 'brand',
    who: '@kira',
    text: 'подписалась на тебя и подарила 200 ауры',
    time: '1 ч назад',
    target: 'user',
    param: 'kira',
    unread: true,
  },
  {
    id: 'n4',
    group: 'today',
    kind: 'chest',
    who: 'Клан «Неон»:',
    text: 'сундук недели почти открыт — осталось 3 задания',
    time: '3 ч назад',
    target: 'clan',
    param: 'clan-neon',
    unread: false,
  },
  {
    id: 'n5',
    group: 'yesterday',
    kind: 'sold',
    who: 'Продано!',
    text: '«NPC-стрим» ушла за 2 800 ауры',
    time: 'вчера, 21:40',
    target: 'cards',
    unread: false,
  },
  {
    id: 'n6',
    group: 'yesterday',
    kind: 'letter',
    letter: 'L',
    tone: 'ink',
    who: '@lulu.mp4',
    text: 'ответила на твой комментарий: «звук из моего прошлого ролика»',
    time: 'вчера, 18:02',
    target: 'comments',
    unread: false,
  },
  {
    id: 'n7',
    group: 'yesterday',
    kind: 'chest',
    who: 'Квест дня',
    text: 'выполнен — забери 100 ауры',
    time: 'вчера, 09:00',
    action: 'Забрать',
    target: 'cards',
    unread: false,
  },
];
