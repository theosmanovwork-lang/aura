import { Text, View } from 'react-native';

import { makeStyles, spacing, typography } from '../theme';

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    marginTop: spacing.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
}));
