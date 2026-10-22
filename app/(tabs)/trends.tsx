import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { TrendsScreen } from '../../src/features/trends/TrendsScreen';

export default function TrendsTab() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  // Tabs stay mounted, so reload the waves each time this tab comes back into view.
  useFocusEffect(useCallback(() => setRefreshKey((key) => key + 1), []));

  return (
    <TrendsScreen
      refreshKey={refreshKey}
      onOpenTrend={(id) => router.push({ pathname: '/trend/[id]', params: { id } })}
    />
  );
}
