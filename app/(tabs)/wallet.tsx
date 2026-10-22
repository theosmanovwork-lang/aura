import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { WalletScreen } from '../../src/features/wallet/WalletScreen';

export default function WalletTab() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Tabs stay mounted, so reload the wallet each time this tab comes back into view.
  useFocusEffect(useCallback(() => setRefreshKey((key) => key + 1), []));

  return <WalletScreen refreshKey={refreshKey} />;
}
