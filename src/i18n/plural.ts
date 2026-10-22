import { ru } from './ru';

export type PluralForms = readonly [one: string, few: string, many: string];

/** Picks the Russian word form for a whole number: 1 просмотр, 2 просмотра, 5 просмотров. */
export function pluralRu(n: number, [one, few, many]: PluralForms): string {
  const lastTwo = Math.abs(n) % 100;
  const last = lastTwo % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

const withComma = (value: number): string => String(value).replace('.', ',');

/** Short number for counters: 999, 4,1 тыс., 12 тыс., 1,5 млн. */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const thousands = Math.floor(n / 100) / 10;
    return `${withComma(thousands >= 10 ? Math.floor(thousands) : thousands)} ${ru.counts.thousand}`;
  }
  return `${withComma(Math.floor(n / 100_000) / 10)} ${ru.counts.million}`;
}

/** Counter with a word: "3 просмотра", "4,1 тыс. просмотров". */
export function countLabel(n: number, forms: PluralForms): string {
  return n >= 1000 ? `${formatCount(n)} ${forms[2]}` : `${n} ${pluralRu(n, forms)}`;
}
