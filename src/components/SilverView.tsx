import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { silver } from '../theme';

type SilverViewProps = Readonly<{
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  testID?: string;
}>;

/** The silver gradient of the design (135°), under round buttons and top cards. */
export function SilverView({ style, children, testID }: SilverViewProps) {
  return (
    <LinearGradient
      testID={testID}
      colors={[...silver.colors] as [string, string, ...string[]]}
      locations={[...silver.locations] as [number, number, ...number[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
