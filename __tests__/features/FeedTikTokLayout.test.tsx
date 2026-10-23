import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, StyleSheet } from 'react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { FeedScreen } from '../../src/features/feed/FeedScreen';
import { ru } from '../../src/i18n/ru';
import { colors } from '../../src/theme';
import { resetPlayers } from '../../test-utils/expoVideoMock';

jest.mock('expo-video', () => jest.requireActual('../../test-utils/expoVideoMock'));

const NEWEST = seed.videos.find((v) => v.id === 'video-7')!;
const AUTHOR = seed.users.find((u) => u.id === NEWEST.authorId)!;

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
afterEach(() => jest.restoreAllMocks());

describe('feed in the TikTok layout', () => {
  test('the top has two tabs, «Для вас» is the open one and both are switched off', async () => {
    await renderFeed();

    const following = screen.getByRole('tab', { name: ru.feed.tabs.following });
    const forYou = screen.getByRole('tab', { name: ru.feed.tabs.forYou });
    expect(following.props.accessibilityState.disabled).toBe(true);
    expect(forYou.props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('feed-top-bar')).toContainElement(forYou);
  });

  test('bottom left shows @author and the description', async () => {
    await renderFeed();

    expect(screen.getByText(`@${AUTHOR.nickname}`)).toBeTruthy();
    expect(screen.getByText(NEWEST.title)).toBeTruthy();
  });

  test('on the right: the author avatar with a plus (switched off) and the disc as decoration', async () => {
    await renderFeed();

    const follow = screen.getByRole('button', { name: ru.feed.soon.follow });
    expect(follow.props.accessibilityState.disabled).toBe(true);
    const disc = screen.getByTestId('music-disc', { hidden: true });
    expect(disc.props.accessibilityElementsHidden).toBe(true);
    expect(disc.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  test('the like is the Aura mark: brighter and selected once pressed, counter changes', async () => {
    await renderFeed();
    const idle = screen.getByTestId('like-icon', { hidden: true });
    expect(StyleSheet.flatten(idle.props.style).fontStyle).toBe('italic');
    expect(StyleSheet.flatten(idle.props.style).color).toBe(colors.text);
    const before = screen.getByTestId('like-button').props.accessibilityValue.text;

    await fireEvent.press(screen.getByTestId('like-button'));

    expect(screen.getByTestId('like-button').props.accessibilityState.selected).toBe(true);
    expect(
      StyleSheet.flatten(screen.getByTestId('like-icon', { hidden: true }).props.style).color,
    ).toBe(colors.like);
    expect(screen.getByTestId('like-button').props.accessibilityValue.text).not.toBe(before);
  });

  test('the author name is still there after a like', async () => {
    await renderFeed();

    await fireEvent.press(screen.getByTestId('like-button'));

    expect(screen.getByText(`@${AUTHOR.nickname}`)).toBeTruthy();
  });

  test('the disc does not spin when the phone asks for less motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    await renderFeed();

    const disc = screen.getByTestId('music-disc', { hidden: true });
    await screen.findByTestId('music-disc', { hidden: true });
    expect(StyleSheet.flatten(disc.props.style).transform).toBeUndefined();
  });
});
