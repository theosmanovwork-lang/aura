import { render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Platform, Text } from 'react-native';

import { GlassSurface } from '../../src/components/GlassSurface';

const mockIsLiquidGlassAvailable = jest.fn();

jest.mock('expo-glass-effect', () => {
  const { View } = jest.requireActual('react-native');
  return {
    isLiquidGlassAvailable: () => mockIsLiquidGlassAvailable(),
    GlassView: (props: object) => <View {...props} testID="glass-view" />,
  };
});
jest.mock('expo-blur', () => {
  const { View } = jest.requireActual('react-native');
  return { BlurView: (props: object) => <View {...props} testID="blur-view" /> };
});

const setReduceTransparency = (value: boolean | Error) =>
  jest
    .spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled')
    .mockImplementation(() =>
      value instanceof Error ? Promise.reject(value) : Promise.resolve(value),
    );

const renderSurface = () =>
  render(
    <GlassSurface testID="surface">
      <Text>внутри</Text>
    </GlassSurface>,
  );

beforeEach(() => {
  mockIsLiquidGlassAvailable.mockReturnValue(false);
  setReduceTransparency(false);
});
afterEach(() => jest.restoreAllMocks());

describe('GlassSurface', () => {
  test('uses liquid glass when the phone has it', async () => {
    mockIsLiquidGlassAvailable.mockReturnValue(true);
    await renderSurface();

    expect(await screen.findByTestId('glass-view')).toBeTruthy();
    expect(screen.getByText('внутри')).toBeTruthy();
  });

  test('uses a blur when there is no liquid glass', async () => {
    await renderSurface();

    expect(await screen.findByTestId('blur-view')).toBeTruthy();
    expect(screen.queryByTestId('glass-view')).toBeNull();
  });

  test('draws a plain solid surface when the user asked for less transparency', async () => {
    setReduceTransparency(true);
    await renderSurface();

    await screen.findByText('внутри');
    expect(screen.queryByTestId('glass-view')).toBeNull();
    expect(screen.queryByTestId('blur-view')).toBeNull();
    expect(screen.getByTestId('surface')).toBeTruthy();
  });

  test('stays readable when the transparency setting cannot be read', async () => {
    setReduceTransparency(new Error('unavailable'));
    await renderSurface();

    expect(await screen.findByText('внутри')).toBeTruthy();
  });

  test('uses a solid surface on Android, where blur needs extra setup', async () => {
    const original = Platform.OS;
    Platform.OS = 'android';
    try {
      await renderSurface();
      await screen.findByText('внутри');
      expect(screen.queryByTestId('blur-view')).toBeNull();
      expect(screen.queryByTestId('glass-view')).toBeNull();
    } finally {
      Platform.OS = original;
    }
  });

  test('still renders where the phone has no transparency setting (the web)', async () => {
    const original = AccessibilityInfo.isReduceTransparencyEnabled;
    // @ts-expect-error the web build of AccessibilityInfo has no such method
    AccessibilityInfo.isReduceTransparencyEnabled = undefined;
    try {
      await renderSurface();
      expect(await screen.findByTestId('blur-view')).toBeTruthy();
    } finally {
      AccessibilityInfo.isReduceTransparencyEnabled = original;
    }
  });
});
