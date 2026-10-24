import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { CommunityScreen } from '../../src/features/community/CommunityScreen';

export default function CommunityTab() {
  const [refreshKey, setRefreshKey] = useState(0);
  // Tabs stay mounted, so read the ratings and the balance again each time this tab comes into view.
  useFocusEffect(useCallback(() => setRefreshKey((key) => key + 1), []));
  return (
    <CommunityScreen
      refreshKey={refreshKey}
      onOpenLot={(id) => router.push({ pathname: '/lot/[id]', params: { id } })}
      onOpenUser={(handle) => router.push({ pathname: '/user/[handle]', params: { handle } })}
      onOpenNotifications={() => router.push('/notifications')}
      onOpenClan={(id) => router.push({ pathname: '/clan/[id]', params: { id } })}
    />
  );
}
