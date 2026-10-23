import app from '../app.json';

describe('app config', () => {
  test('the app follows the light or dark setting of the phone', () => {
    expect(app.expo.userInterfaceStyle).toBe('automatic');
  });

  test('stays in portrait, which the layouts are built for', () => {
    expect(app.expo.orientation).toBe('portrait');
  });
});
