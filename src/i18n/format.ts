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
