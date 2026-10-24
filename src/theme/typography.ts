import { Platform } from 'react-native';

import { fontFamilies } from './fonts';

/**
 * Type scale of the owner's design: Onest for text (weights 500 to 800), Unbounded for the big
 * numbers, numbers with equal-width digits so columns line up. Sizes follow the system text-size setting.
 */

/** The currency word «Аура» in a serif italic, set apart from the sans text around it. */
export const auraWordStyle = {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
  fontStyle: 'italic',
} as const;

type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
  fontVariant?: 'tabular-nums'[];
};

const TABULAR: 'tabular-nums'[] = ['tabular-nums'];

export const typography = {
  /** The biggest text: a hero line. */
  display: { fontFamily: fontFamilies.bold, fontSize: 34, lineHeight: 40, letterSpacing: -1 },
  /** The title of a screen: «Сообщество», «Чаты». */
  title: { fontFamily: fontFamilies.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.9 },
  /** A section heading. */
  heading: { fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 24 },
  lead: { fontFamily: fontFamilies.medium, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fontFamilies.medium, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamilies.bold, fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: fontFamilies.medium, fontSize: 13, lineHeight: 18 },
  /** A name in a list. */
  titleSmall: { fontFamily: fontFamilies.bold, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fontFamilies.semibold, fontSize: 12, lineHeight: 16 },
  /** Label under an icon in the tab bar. */
  tabLabel: { fontFamily: fontFamilies.bold, fontSize: 10, lineHeight: 14 },
  labelCaps: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  eyebrow: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  /** A hero number (the balance): Unbounded. */
  figureDisplay: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
    fontVariant: TABULAR,
  },
  figureXL: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 22,
    lineHeight: 28,
    fontVariant: TABULAR,
  },
  figure: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 20,
    fontVariant: TABULAR,
  },
  figureSmall: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
    lineHeight: 15,
    fontVariant: TABULAR,
  },
  /** The name written on a card. */
  cardName: { fontFamily: fontFamilies.display, fontSize: 12, lineHeight: 13 },
} satisfies Record<string, TypeStyle>;
