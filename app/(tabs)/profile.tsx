import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ProfileScreen } from '../../src/features/profile/ProfileScreen';

export default function ProfileTab() {
  const [refreshKey, setRefreshKey] = useState(0);
  // Come back to the tab and the balance is read again.
  useFocusEffect(useCallback(() => setRefreshKey((key) => key + 1), []));
  return (
    <ProfileScreen
      refreshKey={refreshKey}
      onOpenSettings={() => router.push('/settings')}
      onOpenVideo={(id) => router.push({ pathname: '/video/[id]', params: { id } })}
      onOpenFeed={() => router.navigate('/')}
    />
  );
}
