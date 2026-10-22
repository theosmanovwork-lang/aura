import { useLocalSearchParams } from 'expo-router';

import { TrendDetailScreen } from '../../src/features/trends/TrendDetailScreen';

export default function TrendDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const trendId = Array.isArray(id) ? (id[0] ?? '') : id;
  return <TrendDetailScreen key={trendId} trendId={trendId} />;
}
