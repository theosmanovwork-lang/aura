import { formatPoints } from '../../i18n/format';
import type { VideoSnapshot } from '../../domain/videoPrice';

export type Period = 'day' | 'week' | 'month' | 'all';

const DAY_MS = 24 * 60 * 60 * 1000;

export const PERIODS: readonly Readonly<{ key: Period; ms: number | null }>[] = [
  { key: 'day', ms: DAY_MS },
  { key: 'week', ms: 7 * DAY_MS },
  { key: 'month', ms: 30 * DAY_MS },
  { key: 'all', ms: null },
];

/** A price with a comma and two decimals: 5 269,82. */
export function formatPrice(price: number): string {
  const rounded = Math.round(price * 100) / 100;
  const whole = Math.trunc(rounded);
  const cents = String(Math.round((rounded - whole) * 100)).padStart(2, '0');
  return `${formatPoints(whole)},${cents}`;
}

/** The part of the history for the chart; keeps at least the last two points so a line can be drawn. */
export function filterHistory(
  history: readonly VideoSnapshot[],
  period: Period,
  now: number,
): VideoSnapshot[] {
  const ms = PERIODS.find((p) => p.key === period)?.ms ?? null;
  if (ms === null) return [...history];
  const recent = history.filter((snapshot) => snapshot.at >= now - ms);
  return recent.length >= 2 ? recent : history.slice(-2);
}
