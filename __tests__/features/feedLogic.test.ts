import { pickActiveIndex } from '../../src/features/feed/feedLogic';

describe('pickActiveIndex', () => {
  test('returns the index of the first visible item', () => {
    expect(
      pickActiveIndex([
        { index: 2, isViewable: true },
        { index: 3, isViewable: true },
      ]),
    ).toBe(2);
  });

  test('ignores items that are not viewable', () => {
    expect(
      pickActiveIndex([
        { index: 1, isViewable: false },
        { index: 2, isViewable: true },
      ]),
    ).toBe(2);
  });

  test('returns null when nothing is visible or the index is missing', () => {
    expect(pickActiveIndex([])).toBeNull();
    expect(pickActiveIndex([{ index: null, isViewable: true }])).toBeNull();
    expect(pickActiveIndex([{ index: 0, isViewable: false }])).toBeNull();
  });
});
