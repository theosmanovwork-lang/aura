import RootLayout from '../app/_layout';
import TabsLayout from '../app/(tabs)/_layout';
import CardsTab from '../app/(tabs)/cards';
import ChatsTab from '../app/(tabs)/chats';
import CommunityTab from '../app/(tabs)/community';
import FeedTab from '../app/(tabs)/index';
import ProfileTab from '../app/(tabs)/profile';
import ChestRoute from '../app/chest';
import LotRoute from '../app/lot/[id]';
import SettingsRoute from '../app/settings';
import TopUpRoute from '../app/topup';
import VideoRoute from '../app/video/[id]';

/** Every screen of the app, for tests that open the app through the router. */
export const routes = {
  _layout: RootLayout,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': FeedTab,
  '(tabs)/community': CommunityTab,
  '(tabs)/chats': ChatsTab,
  '(tabs)/cards': CardsTab,
  '(tabs)/profile': ProfileTab,
  settings: SettingsRoute,
  topup: TopUpRoute,
  chest: ChestRoute,
  'lot/[id]': LotRoute,
  'video/[id]': VideoRoute,
};

/** The size a phone reports for the feed; tests have to tell it by hand. */
export const FEED_LAYOUT = { nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } } };
