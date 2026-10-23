import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTopInset } from '../../src/components/useTopInset';
import { spacing } from '../../src/theme';

const withTop = (top: number) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top, left: 0, right: 0, bottom: 34 },
        }}
      >
        {children}
      </SafeAreaProvider>
    );
  };

describe('useTopInset', () => {
  test('keeps a margin from the top when there is no safe area (web, previews)', async () => {
    const { result } = await renderHook(() => useTopInset());

    expect(result.current).toBe(spacing.md);
  });

  test('clears the Dynamic Island: the top safe area plus the margin', async () => {
    const { result } = await renderHook(() => useTopInset(), { wrapper: withTop(59) });

    expect(result.current).toBe(59 + spacing.md);
  });

  test('clears a small notch or an Android status bar the same way', async () => {
    const { result } = await renderHook(() => useTopInset(), { wrapper: withTop(24) });

    expect(result.current).toBe(24 + spacing.md);
  });

  test('a tiny inset still leaves a visible margin and extra space is added on top', async () => {
    const { result } = await renderHook(() => useTopInset(spacing.sm), { wrapper: withTop(0) });

    expect(result.current).toBe(spacing.md + spacing.sm);
  });
});
