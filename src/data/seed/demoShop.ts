/**
 * Made-up top-up packs, bids and chest contents for the screens of the design (Top-up, Lot, Chest).
 * Nothing is bought or stored: the numbers are the same on every start.
 */
import type { RarityKey } from './demoCommunity';

export type DemoPack = Readonly<{
  amount: number;
  bonus: string;
  price: string;
  coins: 1 | 2 | 3;
  tag: string;
}>;

export const demoPacks: readonly DemoPack[] = [
  { amount: 500, bonus: 'базовый', price: '99 ₽', coins: 1, tag: '' },
  { amount: 1200, bonus: '+20% бонус', price: '199 ₽', coins: 1, tag: '' },
  { amount: 2600, bonus: '+30% бонус', price: '399 ₽', coins: 2, tag: 'Хит' },
  { amount: 5500, bonus: '+40% бонус', price: '799 ₽', coins: 2, tag: '' },
  { amount: 12000, bonus: '+50% бонус', price: '1 590 ₽', coins: 3, tag: 'Выгоднее всего' },
  { amount: 30000, bonus: '+60% и сундук', price: '3 790 ₽', coins: 3, tag: 'Сундук' },
];

/** The pack that is chosen when the screen opens. */
export const DEFAULT_PACK = 2;

export const demoFreeAura = { done: 1, total: 3 } as const;

export type DemoBid = Readonly<{
  initial: string;
  name: string;
  time: string;
  amount: string;
  color: 'green' | 'ink' | 'brand';
}>;

export const demoBidHistory: readonly DemoBid[] = [
  { initial: 'D', name: '@denis_f', time: '2 мин назад', amount: '12 400', color: 'green' },
  { initial: 'L', name: '@lulu.mp4', time: '9 мин назад', amount: '12 000', color: 'ink' },
  { initial: 'S', name: '@sasha.v', time: '21 мин назад', amount: '11 200', color: 'brand' },
  { initial: 'D', name: '@denis_f', time: '34 мин назад', amount: '10 500', color: 'green' },
];

export const demoBidCount = 18;
export const demoSeller = { deals: 214, clean: 98 } as const;
export const demoSerial = 7;

export const demoOdds: readonly { rarity: RarityKey; percent: number }[] = [
  { rarity: 'common', percent: 60 },
  { rarity: 'rare', percent: 28 },
  { rarity: 'special', percent: 11 },
  { rarity: 'treasure', percent: 1 },
];

/** The run (how many copies exist) of each rarity. */
export const RUNS: Readonly<Record<RarityKey, number>> = {
  common: 10000,
  rare: 2500,
  special: 500,
  treasure: 50,
};

export const demoChestCount = 3;
export const demoChestReward = {
  rarity: 'treasure' as RarityKey,
  no: '#071',
  name: 'Дедова классика',
  grade: '10',
  serial: 7,
  worth: '15 000',
};
