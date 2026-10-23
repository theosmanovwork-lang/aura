import { Pressable } from 'react-native';

import { Glyph, type GlyphName } from '../../components/Glyph';
import { makeStyles } from '../../theme';

type TopButtonProps = Readonly<{ testID: string; glyph: GlyphName; label: string }>;

/** A rounded square over the video in a top corner («+» and search); drawn, switched off until they exist. */
export function TopButton({ testID, glyph, label }: TopButtonProps) {
  const styles = useStyles();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: true }}
      disabled
      style={styles.button}
    >
      <Glyph name={glyph} size={22} color="#FFFFFF" strokeWidth={2.2} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  button: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.onVideoPlate,
  },
}));
