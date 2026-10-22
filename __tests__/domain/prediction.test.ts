import { createPrediction } from '../../src/domain/prediction';

const base = {
  id: 'p1',
  userId: 'u1',
  trendId: 't1',
  stake: 50,
  baselineScore: 10,
  createdAt: 1000,
  closesAt: 2000,
};

describe('createPrediction', () => {
  test('creates an open prediction', () => {
    expect(createPrediction(base)).toEqual({ ...base, status: 'open' });
  });

  test.each([0, -5, 2.5, Number.NaN, 1e300, 2 ** 53])('rejects stake %p', (stake) => {
    expect(() => createPrediction({ ...base, stake })).toThrow('stake');
  });

  test.each([1000, 999])('rejects closesAt %p that is not after createdAt', (closesAt) => {
    expect(() => createPrediction({ ...base, closesAt })).toThrow('closesAt');
  });
});
