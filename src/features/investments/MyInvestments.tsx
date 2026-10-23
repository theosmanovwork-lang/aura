import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuraText } from '../../components/AuraText';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { formatDateTime } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { makeStyles, radii, spacing, typography } from '../../theme';
import { formatPrice } from '../market/marketFormat';
import { useLoad } from '../useLoad';
import { loadMyInvestments, type InvestmentView } from './investmentService';

const MINUS = '−';
const TILE = 40;

const signed = (value: number): string =>
  `${value > 0 ? '+' : value < 0 ? MINUS : ''}${formatPrice(Math.abs(value))}`;
const percentText = (percent: number | null): string =>
  percent === null ? '' : ` (${signed(percent)}%)`;

const spoken = (view: InvestmentView): string =>
  [
    view.title,
    formatDateTime(view.investment.updatedAt),
    view.open ? ru.investments.holding : ru.investments.closed,
    `${ru.investments.result} ${signed(view.result)} ${ru.wallet.sparks[0]}${percentText(view.percent)}`,
  ].join(', ');

function Row({ view, onOpen }: Readonly<{ view: InvestmentView; onOpen?: (id: string) => void }>) {
  const styles = useStyles();
  return (
    <Pressable
      testID={`investment-row-${view.investment.id}`}
      accessibilityRole="button"
      accessibilityLabel={spoken(view)}
      onPress={() => onOpen?.(view.investment.videoId)}
      style={styles.row}
    >
      <View style={styles.tile}>
        <Text style={styles.tileLetter}>{view.title.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {view.title}
        </Text>
        <Text style={styles.caption}>
          {`${formatDateTime(view.investment.updatedAt)} · ${view.open ? ru.investments.holding : ru.investments.closed}`}
        </Text>
      </View>
      <View style={styles.result}>
        <AuraText style={styles.amount}>{`${signed(view.result)} ${ru.wallet.sparks[0]}`}</AuraText>
        <Text style={styles.caption}>{percentText(view.percent).trim()}</Text>
      </View>
    </Pressable>
  );
}

type MyInvestmentsProps = Readonly<{
  refreshKey?: number;
  onOpenVideo?: (videoId: string) => void;
}>;

/** «Прошлые вложения»: every video the user put Aura into, with the result so far. */
export function MyInvestments({ refreshKey = 0, onOpenVideo }: MyInvestmentsProps) {
  const styles = useStyles();
  const repos = useRepositories();
  const load = useCallback(() => loadMyInvestments(repos, CURRENT_USER_ID), [repos]);
  const { state } = useLoad(load, refreshKey);

  if (state.status === 'loading') return null;
  if (state.status === 'error') return <Text style={styles.caption}>{ru.investments.error}</Text>;
  if (state.data.length === 0) return <Text style={styles.caption}>{ru.investments.empty}</Text>;

  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {ru.investments.title}
      </Text>
      {state.data.map((view) => (
        <Row key={view.investment.id} view={view} onOpen={onOpenVideo} />
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  section: { gap: spacing.sm },
  title: { ...typography.bodyStrong, color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radii.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  tileLetter: { ...typography.heading, color: colors.text },
  text: { flex: 1, gap: spacing.xxs },
  name: { ...typography.titleSmall, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted },
  result: { alignItems: 'flex-end', gap: spacing.xxs },
  amount: { ...typography.figure, color: colors.text },
}));
