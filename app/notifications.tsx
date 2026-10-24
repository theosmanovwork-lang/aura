import { router } from 'expo-router';

import type { DemoNotice } from '../src/data/seed/demoNotifications';
import { NotificationsScreen } from '../src/features/notifications/NotificationsScreen';

function open(notice: DemoNotice) {
  const param = notice.param ?? '';
  switch (notice.target) {
    case 'lot':
      return router.push({ pathname: '/lot/[id]', params: { id: param } });
    case 'user':
      return router.push({ pathname: '/user/[handle]', params: { handle: param } });
    case 'clan':
      return router.push({ pathname: '/clan/[id]', params: { id: param } });
    case 'cards':
      return router.dismissTo('/cards');
    default:
      return router.dismissTo('/');
  }
}

export default function NotificationsRoute() {
  return <NotificationsScreen onBack={() => router.back()} onOpen={open} />;
}
