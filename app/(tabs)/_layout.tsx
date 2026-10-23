import { Tabs } from 'expo-router/js-tabs';

import { Glyph, type GlyphName } from '../../src/components/Glyph';
import { TabBar } from '../../src/components/TabBar';
import { ru } from '../../src/i18n/ru';

type TabSpec = Readonly<{ name: string; title: string; glyph: GlyphName }>;

const TABS: readonly TabSpec[] = [
  { name: 'index', title: ru.tabs.feed, glyph: 'video' },
  { name: 'community', title: ru.tabs.community, glyph: 'community' },
  { name: 'chats', title: ru.tabs.chats, glyph: 'chat' },
  { name: 'cards', title: ru.tabs.cards, glyph: 'cards' },
  { name: 'profile', title: ru.tabs.profile, glyph: 'person' },
];

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      {TABS.map(({ name, title, glyph }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color }) => (
              <Glyph
                name={glyph}
                size={24}
                color={typeof color === 'string' ? color : '#000000'}
                strokeWidth={focused ? 2.4 : 2}
                filled={focused && glyph === 'person'}
                testID={`tab-icon-${glyph}${focused ? '-open' : ''}`}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
