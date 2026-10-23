import { useContext } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { spacing } from '../theme';

/** Space under the content of a screen that has no tab bar: the home indicator plus a margin. */
export function useBottomInset(): number {
  const insets = useContext(SafeAreaInsetsContext);
  return (insets?.bottom ?? 0) + spacing.md;
}
