import { useCallback, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { AuraText } from '../../components/AuraText';
import { Wave } from '../../components/Wave';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { formatDateTime } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, spacing, typography } from '../../theme';
import { formatPrice } from '../market/marketFormat';
import { useLoad } from '../useLoad';
import { loadMyInvestments, type InvestmentView } from './investmentService';
import { PressableScale } from '../../motion/PressableScale';

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
    <PressableScale
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
    </PressableScale>
  );
}

function Portfolio({ views }: Readonly<{ views: readonly InvestmentView[] }>) {
  const styles = useStyles();
  const held = views.filter((v) => v.open);
  const total = views.reduce((sum, v) => sum + v.result, 0);
  const put = held.reduce((sum, v) => sum + v.investment.invested, 0);
  return (
    <View testID="portfolio" style={styles.portfolio}>
      <Wave />
      <View style={styles.portfolioLeft}>
        <Text style={styles.portfolioLabel}>
          {ru.investments.portfolio.replace(
            '{n}',
            `${held.length} ${ru.investments.portfolioForms[0]}`,
          )}
        </Text>
        <Text style={styles.portfolioValue}>
          {`${formatPrice(put)} `}
          <Text style={styles.portfolioWord}>{ru.cards.coinsWord}</Text>
        </Text>
      </View>
      <View style={styles.portfolioRight}>
        <Text style={[styles.portfolioDelta, total < 0 && styles.negative]}>{signed(total)}</Text>
        <Text style={[styles.portfolioDeltaSmall, total < 0 && styles.negative]}>
          {ru.investments.total}
        </Text>
      </View>
    </View>
  );
}

type MyInvestmentsProps = Readonly<{
  refreshKey?: number;
  onOpenVideo?: (videoId: string) => void;
  /** What to show when there is nothing yet; a plain line by default. */
  renderEmpty?: () => ReactNode;
}>;

/** «Прошлые вложения»: every video the user put Aura into, with the result so far. */
export function MyInvestments({ refreshKey = 0, onOpenVideo, renderEmpty }: MyInvestmentsProps) {
  const styles = useStyles();
  const repos = useRepositories();
  const load = useCallback(() => loadMyInvestments(repos, CURRENT_USER_ID), [repos]);
  const { state } = useLoad(load, refreshKey);

  if (state.status === 'loading') return null;
  if (state.status === 'error') return <Text style={styles.caption}>{ru.investments.error}</Text>;
  if (state.data.length === 0) {
    return renderEmpty ? (
      <>{renderEmpty()}</>
    ) : (
      <Text style={styles.caption}>{ru.investments.empty}</Text>
    );
  }

  return (
    <View style={styles.section}>
      <Portfolio views={state.data} />
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
  section: { gap: 8, paddingTop: 4 },
  title: { ...typography.bodyStrong, color: colors.text, paddingTop: spacing.sm },
  portfolio: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.heroCard,
  },
  portfolioLeft: { gap: 2 },
  portfolioLabel: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.heroMuted },
  portfolioValue: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 20,
    letterSpacing: -0.5,
    color: colors.onHeroCard,
  },
  portfolioWord: { color: '#D7DAE0' },
  portfolioRight: { alignItems: 'flex-end', gap: 2 },
  portfolioDelta: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#7FE0B8' },
  portfolioDeltaSmall: { fontFamily: fontFamilies.bold, fontSize: 12, color: '#7FE0B8' },
  negative: { color: '#FF8A80' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  tileLetter: { ...typography.heading, color: colors.text },
  text: { flex: 1, gap: 1 },
  name: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.text },
  caption: { fontFamily: fontFamilies.medium, fontSize: 12, color: colors.textMuted },
  result: { alignItems: 'flex-end', gap: 1 },
  amount: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.text },
}));
