import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ru } from '../i18n/ru';
import { makeStyles, spacing, typography, useColors } from '../theme';
import { openRepositories } from './openRepositories';
import type { Repositories } from './repositories';

const RepositoriesContext = createContext<Repositories | null>(null);

type State =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'error' }>
  | Readonly<{ status: 'ready'; repositories: Repositories }>;

type Props = Readonly<{
  children: ReactNode;
  /** Ready-made storage (tests). When absent the provider opens the app storage itself. */
  repositories?: Repositories;
  open?: () => Promise<Repositories>;
}>;

/** Opens the storage once and shows the app only when it is ready. */
export function RepositoriesProvider({ children, repositories, open = openRepositories }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (repositories) return;
    let cancelled = false;
    open().then(
      (opened) => !cancelled && setState({ status: 'ready', repositories: opened }),
      () => !cancelled && setState({ status: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt, open, repositories]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  };

  const ready = repositories ?? (state.status === 'ready' ? state.repositories : null);
  if (ready) {
    return <RepositoriesContext.Provider value={ready}>{children}</RepositoriesContext.Provider>;
  }

  return (
    <View style={styles.container}>
      {state.status === 'error' ? (
        <>
          <Text style={styles.text}>{ru.app.storageError}</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.button}>
            <Text style={styles.buttonText}>{ru.app.retry}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.primaryText} />
          <Text style={styles.text}>{ru.app.loading}</Text>
        </>
      )}
    </View>
  );
}

export function useRepositories(): Repositories {
  const repositories = useContext(RepositoriesContext);
  if (!repositories) throw new Error('useRepositories must be used inside RepositoriesProvider');
  return repositories;
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  text: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
  },
  buttonText: { ...typography.body, color: colors.text },
}));
