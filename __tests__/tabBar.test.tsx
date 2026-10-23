import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';

import { ru } from '../src/i18n/ru';
import { darkColors, lightColors, MIN_TOUCH_TARGET, TAB_BAR_HEIGHT } from '../src/theme';
import { resetPlayers } from '../test-utils/expoVideoMock';
import { routes } from '../test-utils/appRoutes';

jest.mock('expo-video', () => jest.requireActual('../test-utils/expoVideoMock'));
jest.mock('../src/data/openRepositories', () => ({
  openRepositories: async () => {
    const { createMemoryRepositories } = jest.requireActual('../src/data/memory');
    const { seed } = jest.requireActual('../src/data/seed');
    return createMemoryRepositories(seed);
  },
}));

const TABS = [
  ['index', 'video', ru.tabs.feed],
  ['community', 'community', ru.tabs.community],
  ['chats', 'chat', ru.tabs.chats],
  ['cards', 'cards', ru.tabs.cards],
  ['profile', 'person', ru.tabs.profile],
] as const;

const tab = (position: number, title: string) =>
  screen.findByRole('button', { name: `Раздел ${title}, ${position} из 5` });
const labelColor = (name: string) =>
  StyleSheet.flatten(screen.getByTestId(`tab-label-${name}`, { hidden: true }).props.style).color;

beforeEach(resetPlayers);

describe('bottom tab bar', () => {
  test('has five sections with their names, in the order of the design', async () => {
    await renderRouter(routes);
    await screen.findByTestId('tab-bar', { hidden: true });

    const names = (await screen.findAllByRole('button', { name: /^Раздел .+, \d из \d$/ })).map(
      (t) => t.props.accessibilityLabel,
    );

    expect(names).toEqual(TABS.map(([, , title], i) => `Раздел ${title}, ${i + 1} из 5`));
  });

  test('every section has an icon with its own drawing', async () => {
    await renderRouter(routes);

    for (const [, glyph] of TABS) {
      const open = glyph === 'video' ? `tab-icon-${glyph}-open` : `tab-icon-${glyph}`;
      expect(await screen.findByTestId(open, { hidden: true })).toBeTruthy();
    }
  });

  test('the icons are hidden from screen readers, the tab keeps its spoken name', async () => {
    await renderRouter(routes);

    const icon = await screen.findByTestId('tab-icon-video-open', { hidden: true });

    expect(icon.props.accessibilityElementsHidden).toBe(true);
    expect((await tab(1, ru.tabs.feed)).props.accessibilityState.selected).toBe(true);
  });

  test('the open section is bold in the text colour, the others are quiet', async () => {
    await renderRouter(routes);
    await screen.findByTestId('tab-bar', { hidden: true });

    // The bar over the feed is always dark.
    expect(labelColor('index')).toBe(darkColors.text);
    expect(labelColor('chats')).toBe(darkColors.iconInactive);
  });

  test('pressing a section opens it, the name changes and the bar follows the phone theme', async () => {
    await renderRouter(routes);
    await fireEvent.press(await tab(4, ru.tabs.cards));

    expect(await screen.findByTestId('tab-icon-cards-open', { hidden: true })).toBeTruthy();
    expect(screen.getByTestId('tab-icon-video', { hidden: true })).toBeTruthy();
    // The jest phone is dark, so the bar here is the dark palette too; light is checked by palette tests.
    expect(labelColor('cards')).toBe(darkColors.text);
    expect(lightColors.tabBar).not.toBe(darkColors.tabBar);
  });

  test('pressing the open section keeps everything as it is', async () => {
    await renderRouter(routes);
    const feed = await tab(1, ru.tabs.feed);

    await fireEvent.press(feed);

    expect((await tab(1, ru.tabs.feed)).props.accessibilityState.selected).toBe(true);
  });

  test('is a flat bar of the set height with every item a comfortable target', async () => {
    await renderRouter(routes);
    const bar = await screen.findByTestId('tab-bar', { hidden: true });

    expect(bar.props.accessibilityRole).toBe('tablist');
    expect(StyleSheet.flatten(bar.props.style).height).toBe(TAB_BAR_HEIGHT);
    expect(StyleSheet.flatten(bar.props.style).borderRadius).toBeUndefined();
    for (const [name] of TABS) {
      const item = screen.getByTestId(`tab-item-${name}`, { hidden: true });
      expect(StyleSheet.flatten(item.props.style).minHeight).toBeGreaterThanOrEqual(
        MIN_TOUCH_TARGET,
      );
    }
  });
});
