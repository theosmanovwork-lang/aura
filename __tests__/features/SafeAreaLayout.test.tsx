import { fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTabScreenContent } from '../../src/components/useTabScreenContent';
import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { FeedScreen } from '../../src/features/feed/FeedScreen';
import { CONTENT_MAX_WIDTH, spacing, TAB_BAR_HEIGHT } from '../../src/theme';
import { resetPlayers } from '../../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../../test-utils/expoVideoMock'));

const ISLAND_TOP = 59;
const HOME_INDICATOR = 34;
const metrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: ISLAND_TOP, left: 0, right: 0, bottom: HOME_INDICATOR },
};

const Phone = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider initialMetrics={metrics}>{children}</SafeAreaProvider>
);

beforeEach(resetPlayers);

describe('screens under a Dynamic Island', () => {
  test('the feed top bar starts below the island, not at a fixed height', async () => {
    await render(
      <Phone>
        <RepositoriesProvider repositories={createMemoryRepositories(seed)}>
          <FeedScreen />
        </RepositoriesProvider>
      </Phone>,
    );
    await fireEvent(await screen.findByTestId('feed-container'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 393, height: 700 } },
    });

    const bar = StyleSheet.flatten(screen.getByTestId('feed-top-bar').props.style);

    expect(bar.top).toBe(ISLAND_TOP + spacing.md);
  });
});

describe('useTabScreenContent', () => {
  test('clears the island on top and the tab bar with the home indicator below', async () => {
    const { result } = await renderHook(() => useTabScreenContent({ padding: spacing.gutter }), {
      wrapper: Phone,
    });

    expect(result.current?.paddingTop).toBe(ISLAND_TOP + spacing.md);
    expect(result.current?.paddingBottom).toBe(TAB_BAR_HEIGHT + HOME_INDICATOR + spacing.sm * 2);
    expect(result.current?.padding).toBe(spacing.gutter);
  });

  test('is a centred column no wider than the cap, for tablets and wide windows', async () => {
    const { result } = await renderHook(() => useTabScreenContent(), { wrapper: Phone });

    expect(result.current?.maxWidth).toBe(CONTENT_MAX_WIDTH);
    expect(result.current?.alignSelf).toBe('center');
  });

  test('works without a safe-area provider, keeping a plain top margin', async () => {
    const { result } = await renderHook(() => useTabScreenContent());

    expect(result.current?.paddingTop).toBe(spacing.md);
  });
});
