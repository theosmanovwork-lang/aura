import { useContext } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { spacing, TAB_BAR_HEIGHT } from '../theme';

/**
 * Space the floating tab bar covers at the bottom of every tab screen; content keeps clear of it.
 * A screen shown without a safe-area provider (a test, a preview) counts no bottom inset.
 */
export function useTabBarInset(): number {
  const insets = useContext(SafeAreaInsetsContext);
  return TAB_BAR_HEIGHT + (insets?.bottom ?? 0) + spacing.sm * 2;
}
