import { resolveVideoSource } from '../../src/features/feed/videoSources';

describe('resolveVideoSource', () => {
  test('maps demo addresses to the bundled demo files', () => {
    for (let n = 1; n <= 8; n += 1) {
      expect(resolveVideoSource(`seed://video/${n}`)).toBeDefined();
    }
  });

  test('passes real file or web addresses through unchanged', () => {
    expect(resolveVideoSource('file:///videos/my.mp4')).toEqual({ uri: 'file:///videos/my.mp4' });
    expect(resolveVideoSource('https://example.com/a.mp4')).toEqual({
      uri: 'https://example.com/a.mp4',
    });
  });

  test('gives null for an unknown demo address instead of crashing', () => {
    expect(resolveVideoSource('seed://video/999')).toBeNull();
  });
});
