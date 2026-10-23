import { fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { FeedScreen } from '../../src/features/feed/FeedScreen';
import { ru } from '../../src/i18n/ru';
import { resetPlayers } from '../../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../../test-utils/expoVideoMock'));

async function renderFeed() {
  await render(
    <RepositoriesProvider repositories={createMemoryRepositories(seed)}>
      <FeedScreen />
    </RepositoriesProvider>,
  );
  await fireEvent(await screen.findByTestId('feed-container'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } },
  });
  await screen.findByTestId('like-button');
}

beforeEach(resetPlayers);

describe('feed controls that are drawn but not working yet', () => {
  test('add and search sit in the top bar and are switched off', async () => {
    await renderFeed();

    for (const label of [ru.feed.soon.add, ru.feed.soon.search]) {
      const button = screen.getByRole('button', { name: label });
      expect(button.props.accessibilityState.disabled).toBe(true);
      expect(screen.getByTestId('feed-top-bar')).toContainElement(button);
    }
  });

  test('comments, repost and share sit under the like and views and are switched off', async () => {
    await renderFeed();

    for (const label of [ru.feed.soon.comments, ru.feed.soon.repost, ru.feed.soon.share]) {
      const button = screen.getByRole('button', { name: label });
      expect(button.props.accessibilityState.disabled).toBe(true);
      expect(screen.getByTestId('soon-rail')).toContainElement(button);
    }
  });

  test('the like still works next to them', async () => {
    await renderFeed();
    const before = screen.getByTestId('like-button').props.accessibilityValue.text;

    await fireEvent.press(screen.getByTestId('like-button'));

    expect(screen.getByTestId('like-button').props.accessibilityValue.text).not.toBe(before);
  });
});
