import type { Repositories } from '../../data/repositories';
import { rankAuthors, rankVideos, type AuthorPlace, type VideoPlace } from '../../domain/ratings';

export type VideoRatingRow = VideoPlace & Readonly<{ authorName: string }>;
export type AuthorRatingRow = AuthorPlace & Readonly<{ name: string }>;
export type Ratings = Readonly<{
  videos: readonly VideoRatingRow[];
  authors: readonly AuthorRatingRow[];
}>;

/** Nicknames by author id; a missing author or a failed lookup leaves that name empty. */
async function namesOf(repos: Repositories, ids: readonly string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids)];
  const users = await Promise.all(unique.map((id) => repos.users.getById(id).catch(() => null)));
  return new Map(users.flatMap((user) => (user ? [[user.id, user.nickname] as const] : [])));
}

/** The two ratings of the Hub: best videos and best authors, with nicknames. */
export async function loadRatings(repos: Repositories): Promise<Ratings> {
  const all = await repos.videos.listPublished();
  const videos = rankVideos(all);
  const authors = rankAuthors(all);
  const names = await namesOf(repos, [
    ...videos.map((place) => place.video.authorId),
    ...authors.map((place) => place.authorId),
  ]);
  return {
    videos: videos.map((place) => ({
      ...place,
      authorName: names.get(place.video.authorId) ?? '',
    })),
    authors: authors.map((place) => ({ ...place, name: names.get(place.authorId) ?? '' })),
  };
}
