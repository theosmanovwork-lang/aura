import { ru } from './ru';

const NBSP = ' ';
const MINUS = '−';

/** Whole number with a non-breaking space between thousands: 1 234 567. */
export function formatPoints(n: number): string {
  const digits = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return n < 0 ? `${MINUS}${digits}` : digits;
}

/** +1 000 for earned points, −30 for spent ones. */
export function formatSignedPoints(n: number): string {
  return n > 0 ? `+${formatPoints(n)}` : formatPoints(n);
}

const twoDigits = (n: number): string => String(n).padStart(2, '0');

/** "22 октября, 21:05" in the phone's local time. */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const month = ru.months[date.getMonth()];
  return `${date.getDate()} ${month}, ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/** How long ago something happened, short: «только что», «5 мин», «3 ч», «5 д», «2 нед». */
export function formatAgo(now: number, then: number): string {
  const age = Math.max(0, now - then);
  const { justNow, minutes, hours, days, weeks } = ru.comments.ago;
  if (age < MINUTE_MS) return justNow;
  if (age < HOUR_MS) return minutes.replace('{n}', String(Math.floor(age / MINUTE_MS)));
  if (age < DAY_MS) return hours.replace('{n}', String(Math.floor(age / HOUR_MS)));
  if (age < WEEK_MS * 2) return days.replace('{n}', String(Math.floor(age / DAY_MS)));
  return weeks.replace('{n}', String(Math.floor(age / WEEK_MS)));
}
