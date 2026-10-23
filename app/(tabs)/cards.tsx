import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { CardsScreen } from '../../src/features/cards/CardsScreen';

export default function CardsTab() {
  const [refreshKey, setRefreshKey] = useState(0);
  // Come back to the tab and the balance is read again.
  useFocusEffect(useCallback(() => setRefreshKey((key) => key + 1), []));
  return <CardsScreen refreshKey={refreshKey} />;
}
