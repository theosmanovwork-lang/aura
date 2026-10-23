import { Platform } from 'react-native';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

/**
 * Type scale of the Prufbase design system, mobile column. Inter for text, JetBrains Mono for
 * numbers and labels. The design asks for the weights 510 and 590; the free static fonts offer 500
 * and 600, which are the closest steps. Sizes follow the system text-size setting.
 */
export const fontFamilies = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
  monoStrong: 'JetBrainsMono_600SemiBold',
} as const;

/** What `useFonts` loads at the start of the app. */
export const fontAssets = {
  [fontFamilies.regular]: Inter_400Regular,
  [fontFamilies.medium]: Inter_500Medium,
  [fontFamilies.semibold]: Inter_600SemiBold,
  [fontFamilies.mono]: JetBrainsMono_400Regular,
  [fontFamilies.monoStrong]: JetBrainsMono_600SemiBold,
};

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
  /** H1: 36/39, −2.2%. */
  display: { fontFamily: fontFamilies.medium, fontSize: 36, lineHeight: 39, letterSpacing: -0.79 },
  /** H2 of a section and the title of a screen: 30/36, −2.2%. */
  title: { fontFamily: fontFamilies.medium, fontSize: 30, lineHeight: 36, letterSpacing: -0.66 },
  /** H3 of a card: 18/28. */
  heading: { fontFamily: fontFamilies.semibold, fontSize: 18, lineHeight: 28 },
  lead: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 26 },
  body: { fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamilies.semibold, fontSize: 15, lineHeight: 24 },
  bodySmall: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20 },
  /** A name in a list. */
  titleSmall: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 16 },
  /** Label under an icon: 11/15, +2%. */
  tabLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.22,
  },
  labelCaps: {
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  eyebrow: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  /** A hero number (the balance, the index of a wave): mono, same size as the H1. */
  figureDisplay: {
    fontFamily: fontFamilies.monoStrong,
    fontSize: 36,
    lineHeight: 39,
    fontVariant: TABULAR,
  },
  figureXL: {
    fontFamily: fontFamilies.monoStrong,
    fontSize: 24,
    lineHeight: 32,
    fontVariant: TABULAR,
  },
  figure: {
    fontFamily: fontFamilies.monoStrong,
    fontSize: 14,
    lineHeight: 20,
    fontVariant: TABULAR,
  },
  figureSmall: {
    fontFamily: fontFamilies.monoStrong,
    fontSize: 11,
    lineHeight: 15,
    fontVariant: TABULAR,
  },
} satisfies Record<string, TypeStyle>;
