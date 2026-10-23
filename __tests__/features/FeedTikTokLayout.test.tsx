import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { FeedScreen } from '../../src/features/feed/FeedScreen';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';
import { darkColors as colors, spacing } from '../../src/theme';
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

    expect(screen.getByText(AUTHOR.nickname)).toBeTruthy();
    expect(screen.getByText(NEWEST.title)).toBeTruthy();
  });

  test('on the right: the author avatar with a plus, switched off, and no music disc', async () => {
    await renderFeed();

    const follow = screen.getByRole('button', { name: ru.feed.soon.follow });
    expect(follow.props.accessibilityState.disabled).toBe(true);
    expect(screen.queryByTestId('music-disc', { hidden: true })).toBeNull();
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

    expect(screen.getByText(AUTHOR.nickname)).toBeTruthy();
  });

  test('the author name has no @ sign and sits close above the description', async () => {
    await renderFeed();

    expect(screen.queryByText(`@${AUTHOR.nickname}`)).toBeNull();
    const info = StyleSheet.flatten(screen.getByTestId('video-info').props.style);
    expect(info.gap).toBeLessThanOrEqual(spacing.xs);
    const name = StyleSheet.flatten(screen.getByText(AUTHOR.nickname).props.style);
    expect(name.fontSize).toBeLessThanOrEqual(14);
  });

  test('above the author name sits a plate with the Aura amount and a chevron', async () => {
    await renderFeed();

    const plate = screen.getByTestId('aura-plate');
    expect(plate.props.accessibilityLabel).toBe(`${formatPoints(NEWEST.likeCount)} Аура`);
    expect(plate.props.accessibilityState.disabled).toBe(true);
    const info = screen.getByTestId('video-info');
    expect(info).toContainElement(plate);
    expect(info).toContainElement(screen.getByText(AUTHOR.nickname));
    expect(plate).toHaveTextContent(formatPoints(NEWEST.likeCount), { exact: false });
  });

  test('the Aura word on the plate is set in the serif italic style', async () => {
    await renderFeed();

    const word = within(screen.getByTestId('aura-plate')).getByText('Аура');
    expect(StyleSheet.flatten(word.props.style).fontStyle).toBe('italic');
  });

  test('the first tab is called «Рекомендации»', async () => {
    await renderFeed();

    expect(ru.feed.tabs.forYou).toBe('Рекомендации');
    expect(screen.getByRole('tab', { name: 'Рекомендации' })).toBeTruthy();
  });

  test('the plate, the name and the description share one left margin', async () => {
    await renderFeed();

    const info = StyleSheet.flatten(screen.getByTestId('video-info').props.style);
    expect(info.paddingLeft).toBe(spacing.gutter);
    const plate = StyleSheet.flatten(screen.getByTestId('aura-plate').props.style);
    expect(plate.alignSelf).toBe('flex-start');
    expect(plate.marginBottom).toBeGreaterThanOrEqual(spacing.xs);
  });
});
