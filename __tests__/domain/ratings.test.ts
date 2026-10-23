import { rankAuthors, rankVideos, RATING_LIMIT } from '../../src/domain/ratings';
import { makeVideo } from '../../src/data/testing/fixtures';

const videos = [
  makeVideo({ id: 'a', authorId: 'u1', viewCount: 100, likeCount: 0 }),
  makeVideo({ id: 'b', authorId: 'u2', viewCount: 10, likeCount: 30 }),
  makeVideo({ id: 'c', authorId: 'u1', viewCount: 50, likeCount: 2 }),
  makeVideo({
    id: 'd',
    authorId: 'u3',
    viewCount: 9999,
    likeCount: 9999,
    moderationStatus: 'pending',
  }),
];

describe('rankVideos', () => {
  test('orders published videos by price, highest first, and skips unpublished ones', () => {
    const ranking = rankVideos(videos);

    expect(ranking.map((r) => r.video.id)).toEqual(['b', 'a', 'c']);
    expect(ranking.map((r) => r.price)).toEqual([160, 100, 60]);
  });

  test('equal prices are ordered by id, so the order is stable', () => {
    const tied = [makeVideo({ id: 'z', viewCount: 5 }), makeVideo({ id: 'y', viewCount: 5 })];

    expect(rankVideos(tied).map((r) => r.video.id)).toEqual(['y', 'z']);
  });

  test('keeps only the first RATING_LIMIT places', () => {
    const many = Array.from({ length: RATING_LIMIT + 5 }, (_, n) =>
      makeVideo({ id: `v${n}`, viewCount: n }),
    );

    expect(rankVideos(many)).toHaveLength(RATING_LIMIT);
  });

  test('does not change the list it was given', () => {
    const copy = [...videos];
    rankVideos(videos);
    expect(videos).toEqual(copy);
  });
});

describe('rankAuthors', () => {
  test("adds up the price of each author's published videos", () => {
    const ranking = rankAuthors(videos);

    expect(ranking.map((r) => [r.authorId, r.total, r.videoCount])).toEqual([
      ['u1', 160, 2],
      ['u2', 160, 1],
    ]);
  });

  test('returns an empty list when there are no published videos', () => {
    expect(rankAuthors([])).toEqual([]);
  });
});
