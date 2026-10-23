import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuraText } from '../../components/AuraText';
import { Button } from '../../components/Button';
import { Message } from '../../components/Message';
import { useBottomInset } from '../../components/useBottomInset';
import { NotFoundError } from '../../data/repositories';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { MAX_INVESTMENT_PER_VIDEO, MIN_INVESTMENT } from '../../domain/investment';
import { videoPrice } from '../../domain/videoPrice';
import { formatDateTime } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { makeStyles, spacing, typography } from '../../theme';
import { SoonAction } from '../feed/SoonAction';
import { loadVideoMarket, type VideoMarket } from '../investments/investmentService';
import { useLatest } from '../useLatest';
import { useLoad } from '../useLoad';
import { calcGrowthPercent } from '../../domain/trendScore';
import { GrowthPill } from '../trends/GrowthPill';
import { AmountPad } from './AmountPad';
import { formatPrice } from './marketFormat';
import { PositionCard } from './PositionCard';
import { PriceChart } from './PriceChart';
import { useMarketMoves } from './useMarketMoves';

type VideoMarketScreenProps = Readonly<{
  videoId: string;
  now?: () => number;
  onOpenVideo?: (videoId: string) => void;
}>;

/** The change shown next to the price: since the user's own move when there is one, else since the first price. */
function changeOf(market: VideoMarket): { percent: number | null; label: string } {
  const { position, value, history } = market;
  if (position && position.units > 0 && position.invested > 0) {
    return {
      percent: Math.round(((value - position.invested) / position.invested) * 1000) / 10,
      label: ru.market.sinceYou,
    };
  }
  const first = history[0];
  return {
    percent: first ? calcGrowthPercent(first.price, market.price) : null,
    label: first
      ? ru.market.sinceDate.replace('{date}', formatDateTime(first.at).split(',')[0] ?? '')
      : '',
  };
}

function Header({ market }: Readonly<{ market: VideoMarket }>) {
  const styles = useStyles();
  return (
    <View style={styles.header}>
      <View style={styles.titles}>
        {market.authorName ? <Text style={styles.author}>{market.authorName}</Text> : null}
        <Text style={styles.title} accessibilityRole="header" numberOfLines={2}>
          {market.video.title}
        </Text>
      </View>
      <SoonAction testID="market-share" icon="arrow-redo-outline" label={ru.market.actions.share} />
    </View>
  );
}

function PriceBlock({ market }: Readonly<{ market: VideoMarket }>) {
  const styles = useStyles();
  const change = changeOf(market);
  return (
    <View style={styles.priceBlock}>
      <Text style={styles.label}>{ru.market.priceLabel}</Text>
      <Text testID="market-price" style={styles.price}>
        {formatPrice(market.price)}
      </Text>
      <View style={styles.change}>
        <GrowthPill percent={change.percent} trendId={market.video.id} large />
        <Text style={styles.label}>{change.label}</Text>
      </View>
    </View>
  );
}

type RelatedProps = Readonly<{ videos: VideoMarket['related']; onOpen?: (id: string) => void }>;

function Related({ videos, onOpen }: RelatedProps) {
  const styles = useStyles();
  return (
    <View style={styles.related}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {ru.market.related}
      </Text>
      {videos.length === 0 ? <Text style={styles.label}>{ru.market.noRelated}</Text> : null}
      {videos.map((video) => (
        <Pressable
          key={video.id}
          testID={`related-${video.id}`}
          accessibilityRole="button"
          accessibilityLabel={video.title}
          onPress={() => onOpen?.(video.id)}
          style={styles.relatedRow}
        >
          <Text style={styles.relatedTitle} numberOfLines={1}>
            {video.title}
          </Text>
          <Text style={styles.relatedPrice}>{formatPrice(videoPrice(video))}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function VideoMarketScreen({
  videoId,
  now = Date.now,
  onOpenVideo,
}: VideoMarketScreenProps) {
  const styles = useStyles();
  const repos = useRepositories();
  const clock = useLatest(now);
  const [refreshKey, setRefreshKey] = useState(0);
  const load = useCallback(
    () => loadVideoMarket(repos, CURRENT_USER_ID, videoId, clock.current()),
    [repos, videoId, clock],
  );
  const { state, reload } = useLoad(load, refreshKey);
  const bottomInset = useBottomInset();
  const moves = useMarketMoves(repos, videoId, now, () => setRefreshKey((key) => key + 1));

  if (state.status === 'loading') return <Message text={ru.market.loading} />;
  if (state.status === 'error') {
    if (state.error instanceof NotFoundError) return <Message text={ru.market.notFound} />;
    return <Message text={ru.market.error} action={{ label: ru.market.retry, run: reload }} />;
  }

  const market = state.data;
  const invested = market.position?.invested ?? 0;
  const room = Math.min(MAX_INVESTMENT_PER_VIDEO - invested, market.balance);
  const holding = (market.position?.units ?? 0) > 0;

  const startInvest = () => {
    if (MAX_INVESTMENT_PER_VIDEO - invested < MIN_INVESTMENT)
      return moves.refuse(ru.market.errors.cap);
    if (market.balance < MIN_INVESTMENT) return moves.refuse(ru.market.errors.notEnough);
    moves.open('invest');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
    >
      <Header market={market} />
      <PriceBlock market={market} />
      <PriceChart history={market.history} now={clock.current()} />
      {market.position && holding ? (
        <PositionCard position={market.position} value={market.value} />
      ) : null}

      {moves.mode === null ? (
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button
              label={holding ? ru.market.actions.investMore : ru.market.actions.invest}
              onPress={startInvest}
            />
          </View>
          <View style={styles.action}>
            <Button
              label={ru.market.actions.take}
              variant="chip"
              disabled={market.takable < 1}
              onPress={() => moves.open('take')}
            />
          </View>
        </View>
      ) : (
        <AmountPad
          mode={moves.mode}
          min={moves.mode === 'invest' ? MIN_INVESTMENT : 1}
          max={moves.mode === 'invest' ? room : market.takable}
          pending={moves.pending}
          onConfirm={(amount) => void moves.confirm(amount)}
          onCancel={moves.close}
        />
      )}

      {moves.notice ? (
        <AuraText
          accessibilityRole={moves.notice.kind === 'error' ? 'alert' : 'text'}
          accessibilityLiveRegion="polite"
          style={[styles.notice, moves.notice.kind === 'error' && styles.error]}
        >
          {moves.notice.text}
        </AuraText>
      ) : null}

      <Related videos={market.related} onOpen={onOpenVideo} />
      <AuraText style={styles.disclaimer}>{ru.market.disclaimer}</AuraText>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.gutter, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titles: { flex: 1, gap: spacing.xxs },
  author: { ...typography.caption, color: colors.textMuted },
  title: { ...typography.heading, color: colors.text },
  priceBlock: { gap: spacing.xs },
  label: { ...typography.caption, color: colors.textMuted },
  price: { ...typography.figureDisplay, color: colors.text },
  change: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
  notice: { ...typography.bodySmall, color: colors.text, textAlign: 'center' },
  error: { color: colors.destructive },
  related: { gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { ...typography.heading, color: colors.text },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  relatedTitle: { ...typography.body, color: colors.text, flex: 1 },
  relatedPrice: { ...typography.figure, color: colors.textMuted },
  disclaimer: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
}));
