import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { useRepositories } from '../../src/data/RepositoriesProvider';
import { InvestScreen } from '../../src/features/invest/InvestScreen';
import { useLoad } from '../../src/features/useLoad';

/** The title and the author of the video, read once; the form itself works on demo numbers. */
export default function InvestRoute() {
  const { videoId } = useLocalSearchParams<{ videoId: string | string[] }>();
  const id = Array.isArray(videoId) ? (videoId[0] ?? '') : videoId;
  const repos = useRepositories();
  const load = useCallback(async () => {
    const video = await repos.videos.getById(id);
    const author = video ? await repos.users.getById(video.authorId) : null;
    return { title: video?.title ?? '', author: author?.nickname ?? '' };
  }, [repos, id]);
  const { state } = useLoad(load);
  const info = state.status === 'ready' ? state.data : { title: '', author: '' };
  return <InvestScreen author={info.author} title={info.title} onClose={() => router.back()} />;
}
