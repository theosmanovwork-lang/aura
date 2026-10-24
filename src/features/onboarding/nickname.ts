import { NICKNAME_PATTERN, takenNicknames } from '../../data/seed/demoOnboarding';

export type NicknameState = 'empty' | 'invalid' | 'taken' | 'free';

export function checkNickname(nick: string): NicknameState {
  if (nick.length === 0) return 'empty';
  if (!NICKNAME_PATTERN.test(nick)) return 'invalid';
  return takenNicknames.includes(nick.toLowerCase()) ? 'taken' : 'free';
}

/** Whole years between a birth date and today. */
export function ageOn(today: Date, day: number, month: number, year: number): number {
  const years = today.getFullYear() - year;
  const before = today.getMonth() < month || (today.getMonth() === month && today.getDate() < day);
  return before ? years - 1 : years;
}

export function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}
