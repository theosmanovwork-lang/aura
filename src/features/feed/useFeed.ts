import { useCallback, useEffect, useRef, useState } from 'react';

import { useRepositories } from '../../data/RepositoriesProvider';
import { loadFeed, recordView, type FeedItem } from './feedService';

export type FeedState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'error' }>
  | Readonly<{ status: 'ready'; items: readonly FeedItem[] }>;

/** Loads the feed and keeps the counters in step with what was saved. */
export function useFeed(userId: string) {
  const repos = useRepositories();
  const [state, setState] = useState<FeedState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const viewed = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    loadFeed(repos, userId).then(
      (items) => !cancelled && setState({ status: 'ready', items }),
      () => !cancelled && setState({ status: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [repos, userId, attempt]);

  const changeItem = useCallback((videoId: string, change: (item: FeedItem) => FeedItem) => {
    setState((current) =>
      current.status === 'ready'
        ? {
            status: 'ready',
            items: current.items.map((item) => (item.video.id === videoId ? change(item) : item)),
          }
        : current,
    );
  }, []);

  const markViewed = useCallback(
    async (videoId: string) => {
      if (viewed.current.has(videoId)) return;
      viewed.current.add(videoId);
      try {
        const viewCount = await recordView(repos, videoId);
        changeItem(videoId, (item) => ({ ...item, video: { ...item.video, viewCount } }));
      } catch {
        // A missed view is not worth an error message; allow another try next time it is shown.
        viewed.current.delete(videoId);
      }
    },
    [repos, changeItem],
  );

  const setCommentCount = useCallback(
    (videoId: string, commentCount: number) =>
      changeItem(videoId, (item) => ({ ...item, commentCount })),
    [changeItem],
  );

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, markViewed, setCommentCount, reload };
}
