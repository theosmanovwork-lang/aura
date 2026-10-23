import app from '../app.json';

describe('app config', () => {
  test('the app is dark on every phone: the system keyboard and dialogs follow it', () => {
    expect(app.expo.userInterfaceStyle).toBe('dark');
  });

  test('stays in portrait, which the layouts are built for', () => {
    expect(app.expo.orientation).toBe('portrait');
  });
});
