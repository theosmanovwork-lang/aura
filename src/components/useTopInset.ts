import { useContext } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { spacing } from '../theme';

/**
 * Space to leave at the top of a screen that has no header: the status bar, notch or Dynamic Island
 * (the top safe area) plus a margin. Without a safe-area provider (web, a test) only the margin counts.
 * `extra` is added below the margin.
 */
export function useTopInset(extra = 0): number {
  const insets = useContext(SafeAreaInsetsContext);
  return (insets?.top ?? 0) + spacing.md + extra;
}
