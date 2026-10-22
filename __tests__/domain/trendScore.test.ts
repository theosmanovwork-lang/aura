import {
  calcGrowthPercent,
  calcTrendScore,
  LIKE_WEIGHT,
  VIEW_WEIGHT,
} from '../../src/domain/trendScore';
import { makeVideo } from '../../src/data/testing/fixtures';

describe('calcTrendScore', () => {
  test('is zero for a trend without videos', () => {
    expect(calcTrendScore([])).toBe(0);
  });

  test('adds views and weighted likes of every video', () => {
    const videos = [
      makeVideo({ id: 'a', viewCount: 100, likeCount: 10 }),
      makeVideo({ id: 'b', viewCount: 50, likeCount: 2 }),
    ];

    expect(calcTrendScore(videos)).toBe((100 + 50) * VIEW_WEIGHT + (10 + 2) * LIKE_WEIGHT);
  });

  test('a like is worth more than a view', () => {
    expect(LIKE_WEIGHT).toBeGreaterThan(VIEW_WEIGHT);
  });

  test('counts only published videos', () => {
    const videos = [
      makeVideo({ id: 'a', viewCount: 100, likeCount: 0 }),
      makeVideo({ id: 'b', viewCount: 900, likeCount: 90, moderationStatus: 'pending' }),
      makeVideo({ id: 'c', viewCount: 900, likeCount: 90, moderationStatus: 'rejected' }),
    ];

    expect(calcTrendScore(videos)).toBe(100 * VIEW_WEIGHT);
  });

  test('always gives a whole number', () => {
    expect(Number.isInteger(calcTrendScore([makeVideo({ viewCount: 7, likeCount: 3 })]))).toBe(
      true,
    );
  });
});

describe('calcGrowthPercent', () => {
  test.each([
    [100, 150, 50],
    [200, 100, -50],
    [100, 100, 0],
    [3, 4, 33.3],
    [1000, 1001, 0.1],
  ])('from %i to %i is %f%%', (from, to, expected) => {
    expect(calcGrowthPercent(from, to)).toBe(expected);
  });

  test('is unknown (null) when there is nothing to compare with', () => {
    expect(calcGrowthPercent(0, 50)).toBeNull();
    expect(calcGrowthPercent(-5, 50)).toBeNull();
    expect(calcGrowthPercent(Number.NaN, 50)).toBeNull();
  });
});
