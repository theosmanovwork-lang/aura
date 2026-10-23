import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { fontFamilies, makeStyles } from '../theme';

type EmptyStateProps = Readonly<{
  icon: ReactNode;
  title: string;
  text: string;
  /** A button under the text. */
  action?: ReactNode;
  testID?: string;
}>;

/** «Пока ничего нет»: a rounded icon box, a title, a hint and maybe one button. */
export function EmptyState({ icon, title, text, action, testID }: EmptyStateProps) {
  const styles = useStyles();
  return (
    <View testID={testID} style={styles.box}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {action}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  box: { alignItems: 'center', gap: 6, paddingTop: 20, paddingHorizontal: 24 },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  title: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
  },
  text: {
    maxWidth: 280,
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
}));
