import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { useTabBarInset } from '../../components/useTabBarInset';
import { Message } from '../../components/Message';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import type { LedgerEntry } from '../../domain/ledger';
import { formatDateTime, formatPoints, formatSignedPoints } from '../../i18n/format';
import { pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import {
  iconSizes,
  lightColors as colors,
  MIN_TOUCH_TARGET,
  radii,
  spacing,
  typography,
} from '../../theme';
import { MyPredictions } from '../predictions/MyPredictions';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { loadWallet } from './walletService';

type WalletScreenProps = Readonly<{
  now?: () => number;
  /** Change it to load the wallet again (for example every time the tab comes into view). */
  refreshKey?: number;
}>;

const describeEntry = (entry: LedgerEntry): string => {
  const size = Math.abs(entry.amount);
  const sign = entry.amount > 0 ? ru.wallet.plus : ru.wallet.minus;
  return `${ru.wallet.kinds[entry.kind]}, ${formatDateTime(entry.createdAt)}, ${sign} ${formatPoints(size)} ${pluralRu(size, ru.wallet.sparks)}`;
};

function EntryRow({ entry }: Readonly<{ entry: LedgerEntry }>) {
  return (
    <View
      testID={`wallet-entry-${entry.id}`}
      accessible
      accessibilityLabel={describeEntry(entry)}
      style={styles.entry}
    >
      <View style={styles.entryText}>
        <Text style={styles.entryKind}>{ru.wallet.kinds[entry.kind]}</Text>
        <Text style={styles.entryDate}>{formatDateTime(entry.createdAt)}</Text>
      </View>
      <Text
        style={[styles.amount, { color: entry.amount > 0 ? colors.positive : colors.negative }]}
      >
        {formatSignedPoints(entry.amount)}
      </Text>
    </View>
  );
}

export function WalletScreen({ now = Date.now, refreshKey = 0 }: WalletScreenProps) {
  const repos = useRepositories();
  const clock = useLatest(now);
  const load = useCallback(
    () => loadWallet(repos, CURRENT_USER_ID, clock.current()),
    [repos, clock],
  );
  const { state, reload } = useLoad(load, refreshKey);
  const bottomInset = useTabBarInset();

  if (state.status === 'loading') return <Message light text={ru.wallet.loading} />;
  if (state.status === 'error') {
    return (
      <Message light text={ru.wallet.error} action={{ label: ru.wallet.retry, run: reload }} />
    );
  }

  const { balance, entries } = state.data;
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      data={entries}
      keyExtractor={(entry) => entry.id}
      renderItem={({ item }) => <EntryRow entry={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            {ru.wallet.title}
          </Text>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.sparkBadge}>
                <Icon name="sparkles" size={iconSizes.md} color={colors.accentSoftText} />
              </View>
              <Text style={styles.cardLabel}>{ru.wallet.balanceLabel}</Text>
            </View>
            <Text
              testID="wallet-balance"
              style={styles.balance}
              accessibilityLabel={`${formatPoints(balance)} ${pluralRu(balance, ru.wallet.sparks)}`}
            >
              {formatPoints(balance)}
            </Text>
          </View>
          <MyPredictions now={now} refreshKey={refreshKey} />
          <Text style={styles.section} accessibilityRole="header">
            {ru.wallet.historyTitle}
          </Text>
        </View>
      }
      ListFooterComponent={<Text style={styles.disclaimer}>{ru.wallet.disclaimer}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingTop: spacing.xl },
  header: { gap: spacing.md, marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text },
  card: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sparkBadge: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  cardLabel: { ...typography.caption, color: colors.textMuted },
  balance: { fontSize: 44, fontWeight: '700', color: colors.text },
  section: { ...typography.body, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  separator: { height: spacing.sm },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
  },
  entryText: { gap: spacing.xs },
  entryKind: { ...typography.body, color: colors.text },
  entryDate: { ...typography.caption, color: colors.textMuted },
  amount: { ...typography.body, fontWeight: '700' },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
