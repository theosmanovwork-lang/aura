import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { FeedScreen } from '../../src/features/feed/FeedScreen';
import { ru } from '../../src/i18n/ru';
import { colors, scrim } from '../../src/theme';
import { resetPlayers } from '../../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../../test-utils/expoVideoMock'));

const NEWEST = seed.videos.find((v) => v.id === 'video-7')!;

async function renderFeed() {
  await render(
    <RepositoriesProvider repositories={createMemoryRepositories(seed)}>
      <FeedScreen />
    </RepositoriesProvider>,
  );
  await fireEvent(await screen.findByTestId('feed-container'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } },
  });
  await screen.findByText(NEWEST.title);
}

beforeEach(resetPlayers);

describe('feed card design', () => {
  test('puts the like and the views in the right-hand action rail', async () => {
    await renderFeed();

    const rail = screen.getByTestId('action-rail');
    expect(rail).toContainElement(screen.getByTestId('like-button'));
    expect(rail).toContainElement(screen.getByTestId('views-indicator'));
  });

  test('has a dark fade at the top and at the bottom, and both let touches through', async () => {
    await renderFeed();

    for (const id of ['scrim-top', 'scrim-bottom']) {
      expect(screen.getByTestId(id).props.pointerEvents).toBe('none');
    }
  });

  test('the title may take two lines and has no flat box behind it', async () => {
    await renderFeed();

    const title = screen.getByText(NEWEST.title);
    expect(title.props.numberOfLines).toBe(2);
    const info = screen.getByTestId('video-info');
    expect(StyleSheet.flatten(info.props.style).backgroundColor).toBeUndefined();
  });

  test('the age rating and the AI note are chips; the AI chip uses the indigo fill', async () => {
    await renderFeed();

    const aiChip = screen.getByTestId('chip-ai');
    expect(StyleSheet.flatten(aiChip.props.style).backgroundColor).toBe(colors.primary);
    expect(screen.getByTestId('chip-age')).toHaveTextContent(NEWEST.ageRating);
  });

  test('a pause is shown as a play icon in a circle that screen readers skip', async () => {
    await renderFeed();
    expect(screen.queryByTestId('pause-indicator')).toBeNull();

    await fireEvent.press(screen.getByTestId('video-surface'));

    const indicator = screen.getByTestId('pause-indicator', { hidden: true });
    expect(indicator.props.accessibilityElementsHidden).toBe(true);
    expect(screen.getByLabelText(ru.feed.resume)).toBeTruthy();
  });

  test('the pause indicator disappears when the video plays again', async () => {
    await renderFeed();

    await fireEvent.press(screen.getByTestId('video-surface'));
    await fireEvent.press(screen.getByTestId('video-surface'));

    expect(screen.queryByTestId('pause-indicator')).toBeNull();
  });

  test('the play circle lets taps through so a tap on it resumes the video', async () => {
    await renderFeed();
    await fireEvent.press(screen.getByTestId('video-surface'));

    expect(screen.getByTestId('pause-indicator', { hidden: true }).props.pointerEvents).toBe(
      'none',
    );
  });

  test('the bottom fade has a middle step so the counts keep their contrast', async () => {
    await renderFeed();

    const fade = screen.getByTestId('scrim-bottom');
    expect(fade.props.colors).toHaveLength(3);
    expect(fade.props.locations).toEqual([...scrim.locations]);
  });

  test('the counts have a soft shadow for bright videos', async () => {
    await renderFeed();

    const count = screen.getByText(String(NEWEST.likeCount));
    expect(StyleSheet.flatten(count.props.style).textShadowRadius).toBeGreaterThan(0);
  });

  test('the age chip is read as "возраст 6+" and the views as plain text', async () => {
    await renderFeed();

    expect(screen.getByTestId('chip-age').props.accessibilityLabel).toBe(
      `${ru.feed.age} ${NEWEST.ageRating}`,
    );
    expect(screen.getByTestId('views-indicator').props.accessibilityRole).toBe('text');
  });
});
