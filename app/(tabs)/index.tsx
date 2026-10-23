import { router, useIsFocused } from 'expo-router';

import { FeedScreen } from '../../src/features/feed/FeedScreen';

export default function FeedTab() {
  return (
    <FeedScreen
      focused={useIsFocused()}
      onOpenVideo={(videoId) => router.push({ pathname: '/video/[id]', params: { id: videoId } })}
    />
  );
}
