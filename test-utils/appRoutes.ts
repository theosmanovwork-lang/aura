import RootLayout from '../app/_layout';
import TabsLayout from '../app/(tabs)/_layout';
import CardsTab from '../app/(tabs)/cards';
import ChatsTab from '../app/(tabs)/chats';
import CommunityTab from '../app/(tabs)/community';
import FeedTab from '../app/(tabs)/index';
import ProfileTab from '../app/(tabs)/profile';
import ChatRoute from '../app/chat/[id]';
import ChestRoute from '../app/chest';
import ClanRoute from '../app/clan/[id]';
import LotRoute from '../app/lot/[id]';
import StatesRoute from '../app/dev/states';
import NotificationsRoute from '../app/notifications';
import OnboardingRoute from '../app/onboarding';
import SettingsRoute from '../app/settings';
import TopUpRoute from '../app/topup';
import UserRoute from '../app/user/[handle]';
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
  notifications: NotificationsRoute,
  onboarding: OnboardingRoute,
  'dev/states': StatesRoute,
  chest: ChestRoute,
  'lot/[id]': LotRoute,
  'chat/[id]': ChatRoute,
  'clan/[id]': ClanRoute,
  'user/[handle]': UserRoute,
  'video/[id]': VideoRoute,
};

/** The size a phone reports for the feed; tests have to tell it by hand. */
export const FEED_LAYOUT = { nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } } };
