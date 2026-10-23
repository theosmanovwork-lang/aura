import { Text, View } from 'react-native';

import { fontFamilies, makeStyles, radii, useScheme } from '../theme';
import { SilverView } from './SilverView';

export type AvatarTone = 'brand' | 'silver' | 'green' | 'ink' | 'amber' | 'red';

const TONES = {
  brand: { light: ['#3A3FD4', '#FFFFFF'], dark: ['#4A4FDC', '#FFFFFF'] },
  green: { light: ['#0B7D61', '#FFFFFF'], dark: ['#0B7D61', '#FFFFFF'] },
  ink: { light: ['#1A1A1A', '#FFFFFF'], dark: ['#3A352E', '#F5F1E8'] },
  amber: { light: ['#FFB020', '#1A1A1A'], dark: ['#FFB020', '#1A1A1A'] },
  red: { light: ['#E5483A', '#FFFFFF'], dark: ['#E5483A', '#FFFFFF'] },
  silver: { light: ['#C9CDD3', '#1A1A1A'], dark: ['#C9CDD3', '#1A1A1A'] },
} as const;

type AvatarProps = Readonly<{
  initial: string;
  tone: AvatarTone;
  size: number;
  /** A clan has a rounded square, a person a circle. */
  square?: boolean;
  testID?: string;
}>;

/** A round (or square) letter in a colour: stands in for a picture until people can upload one. */
export function Avatar({ initial, tone, size, square = false, testID }: AvatarProps) {
  const styles = useStyles();
  const scheme = useScheme();
  const [bg, fg] = TONES[tone][scheme];
  const shape = { width: size, height: size, borderRadius: square ? radii.lg : size / 2 };
  const letter = (
    <Text style={[styles.letter, { color: fg, fontSize: Math.round(size * 0.38) }]}>{initial}</Text>
  );

  if (tone === 'silver') {
    return (
      <SilverView testID={testID} style={[styles.center, shape]}>
        {letter}
      </SilverView>
    );
  }
  return (
    <View testID={testID} style={[styles.center, shape, { backgroundColor: bg }]}>
      {letter}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  center: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  letter: { fontFamily: fontFamilies.bold },
}));
