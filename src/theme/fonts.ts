import {
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
} from '@expo-google-fonts/onest';
import { Unbounded_700Bold, Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded';

/** Onest for text, Unbounded for the big numbers and the names on cards (both open licence, with Cyrillic). */
export const fontFamilies = {
  regular: 'Onest_400Regular',
  medium: 'Onest_500Medium',
  semibold: 'Onest_600SemiBold',
  bold: 'Onest_700Bold',
  display: 'Unbounded_700Bold',
  displayHeavy: 'Unbounded_800ExtraBold',
} as const;

/** What `useFonts` loads at the start of the app. */
export const fontAssets = {
  [fontFamilies.regular]: Onest_400Regular,
  [fontFamilies.medium]: Onest_500Medium,
  [fontFamilies.semibold]: Onest_600SemiBold,
  [fontFamilies.bold]: Onest_700Bold,
  [fontFamilies.display]: Unbounded_700Bold,
  [fontFamilies.displayHeavy]: Unbounded_800ExtraBold,
};
