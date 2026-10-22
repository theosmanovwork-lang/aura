import { useState } from 'react';
import { View } from 'react-native';

export type FakePlayer = {
  loop: boolean;
  muted: boolean;
  play: jest.Mock;
  pause: jest.Mock;
};

/** Every player created through useVideoPlayer, so tests can check play/pause calls. */
export const players: FakePlayer[] = [];

export const resetPlayers = () => {
  players.length = 0;
};

export const VideoView = () => <View testID="video-view" />;

/** One player per component instance, like the real hook (not a new one on every render). */
export const useVideoPlayer = (_source: unknown, setup?: (player: FakePlayer) => void) => {
  const [player] = useState(() => {
    const created: FakePlayer = { loop: false, muted: false, play: jest.fn(), pause: jest.fn() };
    players.push(created);
    setup?.(created);
    return created;
  });
  return player;
};
