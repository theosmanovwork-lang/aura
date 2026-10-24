/**
 * The launch screen and the welcome flow after it are shown at every start of the app. They are off
 * in tests, where screens are opened straight by their address.
 */
export const LAUNCH_ENABLED = process.env.NODE_ENV !== 'test';
