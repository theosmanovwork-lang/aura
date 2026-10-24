import { router } from 'expo-router';

import { ChatsScreen } from '../../src/features/chats/ChatsScreen';

export default function ChatsTab() {
  return (
    <ChatsScreen
      onOpenDialog={(id) => router.push({ pathname: '/chat/[id]', params: { id } })}
      onOpenClan={(id) => router.push({ pathname: '/clan/[id]', params: { id } })}
    />
  );
}
