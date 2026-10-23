import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTabBarInset } from '../../src/components/useTabBarInset';
import { spacing, TAB_BAR_HEIGHT } from '../../src/theme';

const BAR = TAB_BAR_HEIGHT + spacing.sm * 2;

describe('useTabBarInset', () => {
  test('is the bar height plus its margins when there is no safe area', async () => {
    const { result } = await renderHook(() => useTabBarInset());

    expect(result.current).toBe(BAR);
  });

  test('adds the bottom safe area (the home indicator)', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        {children}
      </SafeAreaProvider>
    );
    const { result } = await renderHook(() => useTabBarInset(), { wrapper });

    expect(result.current).toBe(BAR + 34);
  });
});
