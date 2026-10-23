import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { HubScreen } from '../../src/features/hub/HubScreen';

export default function HubTab() {
  const [refreshKey, setRefreshKey] = useState(0);
  // Tabs stay mounted, so read the ratings again each time this tab comes back into view.
  useFocusEffect(useCallback(() => setRefreshKey((key) => key + 1), []));
  return (
    <HubScreen
      refreshKey={refreshKey}
      onOpenChats={() => router.push('/chats')}
      onOpenCards={() => router.push('/cards')}
      onOpenVideo={(id) => router.push({ pathname: '/video/[id]', params: { id } })}
    />
  );
}
