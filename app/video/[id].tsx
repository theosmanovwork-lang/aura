import { router, useLocalSearchParams } from 'expo-router';

import { VideoMarketScreen } from '../../src/features/market/VideoMarketScreen';

export default function VideoRoute() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const videoId = Array.isArray(id) ? (id[0] ?? '') : id;
  return (
    <VideoMarketScreen
      key={videoId}
      videoId={videoId}
      onOpenVideo={(next) => router.replace({ pathname: '/video/[id]', params: { id: next } })}
    />
  );
}
