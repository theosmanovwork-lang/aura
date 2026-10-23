import { Platform } from 'react-native';

/**
 * Type scale in the manner of Instagram and X: the phone's own font (San Francisco on iPhone,
 * Roboto on Android), sizes that follow the system text-size setting, numbers with equal-width
 * digits so columns line up.
 */

/** The currency word «Аура» in a serif italic, set apart from the sans text around it. */
export const auraWordStyle = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
  fontStyle: 'italic',
} as const;

type Weight = '400' | '500' | '600' | '700';

type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: Weight;
  letterSpacing?: number;
  textTransform?: 'uppercase';
  fontVariant?: 'tabular-nums'[];
};

const TABULAR: 'tabular-nums'[] = ['tabular-nums'];

export const typography = {
  /** The biggest text: a hero line. */
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -0.8 },
  /** The title of a screen. */
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  /** The title of a card or a sheet. */
  heading: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  lead: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  /** A name in a list. */
  titleSmall: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  /** Label under an icon. */
  tabLabel: { fontSize: 10, lineHeight: 14, fontWeight: '500' },
  labelCaps: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  /** A hero number (the balance, the index of a wave). */
  figureDisplay: { fontSize: 40, lineHeight: 46, fontWeight: '700', fontVariant: TABULAR },
  figureXL: { fontSize: 24, lineHeight: 32, fontWeight: '700', fontVariant: TABULAR },
  figure: { fontSize: 14, lineHeight: 20, fontWeight: '600', fontVariant: TABULAR },
  figureSmall: { fontSize: 11, lineHeight: 15, fontWeight: '600', fontVariant: TABULAR },
} satisfies Record<string, TypeStyle>;
