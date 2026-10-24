import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { fontFamilies, makeStyles, useColors } from '../theme';
import { Glyph } from './Glyph';
import { PressableScale } from '../motion/PressableScale';

type ScreenHeaderProps = Readonly<{
  title: string;
  backLabel: string;
  onBack: () => void;
  /** A round button on the right (share, more); the left and the right keep the same width. */
  right?: ReactNode;
}>;

/** The top line of a screen that opens over the tabs: a round «back» button, the title, room for one more button. */
export function ScreenHeader({ title, backLabel, onBack, right }: ScreenHeaderProps) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={styles.row}>
      <PressableScale
        testID="screen-back"
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        style={styles.round}
      >
        <Glyph name="chevronLeft" size={20} color={colors.text} strokeWidth={2.4} />
      </PressableScale>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { height: 44, flexDirection: 'row', alignItems: 'center' },
  round: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.bold,
    fontSize: 17,
    color: colors.text,
  },
  side: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
}));
