import { StyleSheet, type ViewStyle } from 'react-native';

import { contentColumn } from '../theme';
import { useTabBarInset } from './useTabBarInset';
import { useTopInset } from './useTopInset';

/**
 * Padding for the content of a tab screen: clear of the notch or Dynamic Island at the top, clear
 * of the floating tab bar at the bottom, and a centred column on wide screens.
 */
export function useTabScreenContent(base: ViewStyle = {}): ViewStyle {
  const topInset = useTopInset();
  const bottomInset = useTabBarInset();
  return {
    ...StyleSheet.flatten([
      base,
      { paddingTop: topInset, paddingBottom: bottomInset },
      contentColumn,
    ]),
  };
}
