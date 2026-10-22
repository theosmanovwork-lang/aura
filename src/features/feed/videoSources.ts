const DEMO_VIDEOS: Readonly<Record<string, number>> = {
  '1': require('../../../assets/demo/video-1.mp4'),
  '2': require('../../../assets/demo/video-2.mp4'),
  '3': require('../../../assets/demo/video-3.mp4'),
  '4': require('../../../assets/demo/video-4.mp4'),
  '5': require('../../../assets/demo/video-5.mp4'),
  '6': require('../../../assets/demo/video-6.mp4'),
  '7': require('../../../assets/demo/video-7.mp4'),
  '8': require('../../../assets/demo/video-8.mp4'),
};

const DEMO_PREFIX = 'seed://video/';

export type PlayableSource = number | { uri: string } | null;

/** Turns the address stored with a video into something the player can open. */
export function resolveVideoSource(videoUri: string): PlayableSource {
  if (videoUri.startsWith(DEMO_PREFIX)) {
    return DEMO_VIDEOS[videoUri.slice(DEMO_PREFIX.length)] ?? null;
  }
  return { uri: videoUri };
}
