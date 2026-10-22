/**
 * Light palette for the screens around the feed (Волны, Искры, Профиль).
 * The feed and the tab bar stay dark. Text pairs are checked in __tests__/theme/lightContrast.test.ts.
 */
export const lightColors = {
  background: '#F6F6F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EEEEF2',
  border: '#E3E3EA',

  text: '#14121F',
  textMuted: '#5F5C74',
  iconInactive: '#6B6880',

  primary: '#4F46E5',
  onPrimary: '#FFFFFF',
  primarySoft: '#E9E8FD',
  primarySoftText: '#3730A3',

  accentSoft: '#FEF3C7',
  accentSoftText: '#78350F',

  positive: '#047857',
  positiveSoft: '#D1FAE5',
  negative: '#BE123C',
  negativeSoft: '#FFE4E6',
  /** Banner that asks for attention (not an error). */
  alert: '#DC2626',
  onAlert: '#FFFFFF',
} as const;
