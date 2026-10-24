import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Avatar } from '../../components/Avatar';
import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { useBottomInset } from '../../components/useBottomInset';
import { buyCost, maxBuyable, sellNet, sharePrice } from '../../domain/shares';
import { formatPoints } from '../../i18n/format';
import { pluralRu } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { success } from '../../motion/haptics';
import { PressableScale } from '../../motion/PressableScale';
import { fontFamilies, makeStyles, useColors } from '../../theme';

type Mode = 'buy' | 'sell';

/** Demo start: 640 shares sold, 25 of them are yours, bought for 450 in all, 12 480 Aura on the balance. */
const START = { sold: 640, held: 25, cost: 450, balance: 12480 } as const;
const CHART = [18, 19, 18.5, 21, 24, 23, 27, 31, 30, 36, 40, 42];
const QUICK = [1, 10, 50] as const;
const CHART_W = 330;
const CHART_H = 96;

const word = (n: number): string => pluralRu(n, ru.invest.forms);
const money = (n: number): string => formatPoints(Math.round(n));

type InvestScreenProps = Readonly<{
  /** `@name` and the title of the video, shown under the heading. */
  author: string;
  title: string;
  onClose: () => void;
}>;

/**
 * Shares of a video: the price on its curve, your position and a buy or sell form. It is drawn on
 * demo numbers (the formulas are in `domain/shares`): nothing is saved and the ledger is not touched.
 */
export function InvestScreen({ author, title, onClose }: InvestScreenProps) {
  const styles = useStyles();
  const colors = useColors();
  const bottom = useBottomInset();
  const t = ru.invest;
  const [state, setState] = useState<{ sold: number; held: number; cost: number; balance: number }>(
    START,
  );
  const [mode, setMode] = useState<Mode>('buy');
  const [wanted, setWanted] = useState(10);
  const [message, setMessage] = useState('');

  const buying = mode === 'buy';
  const maxN = buying ? maxBuyable(state.balance, state.sold) : state.held;
  const n = Math.max(1, Math.min(wanted, Math.max(1, maxN)));
  const total = buying ? buyCost(n, state.sold) : state.held > 0 ? sellNet(n, state.sold) : 0;
  const value = state.held * sharePrice(state.sold);
  const pnl = value - state.cost;
  const pct = state.cost > 0 ? Math.round((pnl / state.cost) * 100) : 0;
  const canTrade = maxN >= 1;

  const choose = (next: Mode) => {
    setMode(next);
    setMessage('');
  };
  const setN = (value_: number) => {
    setWanted(Math.max(1, value_));
    setMessage('');
  };
  const confirm = () => {
    if (!canTrade) return;
    success();
    if (buying) {
      setState((s) => ({
        sold: s.sold + n,
        held: s.held + n,
        cost: s.cost + total,
        balance: s.balance - total,
      }));
      setMessage(t.bought_.replace('{n}', `${n} ${word(n)}`));
      return;
    }
    setState((s) => ({
      sold: s.sold - n,
      held: s.held - n,
      cost: s.cost - (s.cost / s.held) * n,
      balance: s.balance + total,
    }));
    setMessage(t.sold_.replace('{n}', `${n} ${word(n)}`));
  };

  const ctaText = message
    ? t.cta.done.replace('{msg}', message)
    : buying
      ? t.cta.buy.replace('{n}', `${money(n)} ${word(n)}`).replace('{total}', money(total))
      : t.cta.sell.replace('{n}', `${money(n)} ${word(n)}`).replace('{total}', money(total));

  return (
    <View style={styles.backdrop}>
      <Pressable
        testID="invest-backdrop"
        accessibilityRole="button"
        accessibilityLabel={t.close}
        onPress={onClose}
        style={styles.dismiss}
      />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView
          testID="invest-scroll"
          contentContainerStyle={[styles.content, { paddingBottom: 24 + bottom }]}
        >
          <View style={styles.head}>
            <Avatar initial={author.slice(0, 1).toUpperCase()} tone="brand" size={44} />
            <View style={styles.headTexts}>
              <Text accessibilityRole="header" style={styles.heading}>
                {t.title}
              </Text>
              <Text numberOfLines={1} style={styles.sub}>
                {t.sub.replace('{author}', author).replace('{title}', title)}
              </Text>
            </View>
            <PressableScale
              testID="invest-close"
              accessibilityRole="button"
              accessibilityLabel={t.close}
              onPress={onClose}
              style={styles.close}
            >
              <Glyph name="close" size={16} color={colors.text} strokeWidth={2.4} />
            </PressableScale>
          </View>

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.cap}>{t.price}</Text>
                <Text testID="share-price" style={styles.price}>
                  {`${money(sharePrice(state.sold))} `}
                  <Text style={styles.priceWord}>{t.word}</Text>
                </Text>
              </View>
              <View style={styles.priceRight}>
                <Text accessibilityLabel={t.changeSpoken} style={styles.up}>
                  {t.change}
                </Text>
                <Text style={styles.cap}>{t.period}</Text>
              </View>
            </View>
            <Chart label={t.chartLabel} />
            <View style={styles.chartLabels}>
              <Text style={styles.small}>{t.from}</Text>
              <Text style={styles.small}>{t.bought.replace('{price}', '18')}</Text>
              <Text style={styles.small}>{t.now}</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <Stat value={money(state.sold)} label={t.stats.sold} testID="stat-sold" />
            <Stat value={t.holdersValue} label={t.stats.holders} />
            <Stat value={t.stepValue} label={t.stats.step} />
          </View>

          <View testID="position" style={styles.position}>
            <View style={styles.positionLeft}>
              <Text style={styles.positionCap}>{t.mine}</Text>
              <Text style={styles.positionLine}>
                {t.mineLine
                  .replace('{held}', `${state.held} ${word(state.held)}`)
                  .replace('{avg}', state.held > 0 ? money(state.cost / state.held) : '—')}
              </Text>
            </View>
            <View style={styles.positionRight}>
              <Text style={styles.positionValue}>{money(value)}</Text>
              <Text style={[styles.pnl, pnl < 0 && styles.pnlDown]}>
                {`${pnl >= 0 ? '+' : '−'}${money(Math.abs(pnl))} (${pnl >= 0 ? '+' : '−'}${Math.abs(pct)}%)`}
              </Text>
            </View>
          </View>

          <View accessibilityRole="tablist" accessibilityLabel={t.modeLabel} style={styles.tabs}>
            {(['buy', 'sell'] as const).map((key) => (
              <PressableScale
                key={key}
                testID={`invest-mode-${key}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: key === mode }}
                onPress={() => choose(key)}
                style={[styles.tab, key === mode && styles.tabOn]}
              >
                <Text style={[styles.tabText, key === mode && styles.tabTextOn]}>{t[key]}</Text>
              </PressableScale>
            ))}
          </View>

          <View style={styles.stepper}>
            <PressableScale
              testID="invest-fewer"
              accessibilityRole="button"
              accessibilityLabel={t.fewer}
              onPress={() => setN(n - 1)}
              style={styles.stepBtn}
            >
              <Glyph name="minus" size={20} color={colors.text} strokeWidth={2.6} />
            </PressableScale>
            <View style={styles.count}>
              <Text testID="invest-count" style={styles.countValue}>
                {money(n)}
              </Text>
              <Text style={styles.countWord}>{word(n)}</Text>
            </View>
            <PressableScale
              testID="invest-more"
              accessibilityRole="button"
              accessibilityLabel={t.more}
              onPress={() => setN(n + 1)}
              style={styles.stepBtn}
            >
              <Glyph name="plus" size={20} color={colors.text} strokeWidth={2.6} />
            </PressableScale>
          </View>
          <View style={styles.quick}>
            {[
              ...QUICK.map((v) => ({ label: String(v), value: v })),
              { label: t.max, value: maxN },
            ].map((q) => (
              <PressableScale
                key={q.label}
                testID={`invest-quick-${q.label}`}
                accessibilityRole="button"
                onPress={() => setN(q.value)}
                style={styles.quickBtn}
              >
                <Text style={styles.quickText}>{q.label}</Text>
              </PressableScale>
            ))}
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{buying ? t.total : t.getNet}</Text>
              <Text testID="invest-total" style={styles.totalValue}>
                {`${money(total)} ${t.word}`}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{buying ? t.priceAfter : t.fees}</Text>
              <Text style={styles.totalLabel}>
                {buying
                  ? t.perShare.replace('{price}', money(sharePrice(state.sold + n)))
                  : t.balanceAfter.replace('{n}', money(state.balance + total))}
              </Text>
            </View>
          </View>

          <PressableScale
            testID="invest-confirm"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canTrade }}
            disabled={!canTrade}
            onPress={confirm}
            style={styles.ctaWrap}
          >
            {buying && !message ? (
              <SilverView style={[styles.cta, !canTrade && styles.ctaOff]}>
                <Text style={styles.ctaInk}>{canTrade ? ctaText : t.notEnough}</Text>
              </SilverView>
            ) : (
              <View style={[styles.cta, styles.ctaDark, !canTrade && styles.ctaOff]}>
                <Text style={styles.ctaLight}>{canTrade ? ctaText : t.nothing}</Text>
              </View>
            )}
          </PressableScale>
          <Text style={styles.disclaimer}>{t.disclaimer}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

function Stat({
  value,
  label,
  testID,
}: Readonly<{ value: string; label: string; testID?: string }>) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <Text testID={testID} style={styles.statValue}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Chart({ label }: Readonly<{ label: string }>) {
  const max = Math.max(...CHART);
  const min = Math.min(...CHART);
  const points = CHART.map((v, i) => ({
    x: (i / (CHART.length - 1)) * CHART_W,
    y: CHART_H - 8 - ((v - min) / (max - min)) * (CHART_H - 20),
  }));
  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${CHART_W} ${CHART_H} L0 ${CHART_H} Z`;
  const last = points[points.length - 1]!;
  return (
    <Svg
      accessibilityLabel={label}
      role="img"
      width="100%"
      height={CHART_H}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="investFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0B7D61" stopOpacity={0.22} />
          <Stop offset="1" stopColor="#0B7D61" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#investFill)" />
      <Path
        d={line}
        fill="none"
        stroke="#0B7D61"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle cx={points[0]!.x + 2} cy={points[0]!.y} r={3.5} fill="#1A1A1A" />
      <Circle cx={last.x - 2} cy={last.y} r={5} fill="#0B7D61" stroke="#FFFFFF" strokeWidth={2} />
    </Svg>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,9,8,0.6)' },
  dismiss: { height: 64 },
  sheet: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.background,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    marginBottom: 8,
    backgroundColor: '#D9D2C3',
  },
  content: { gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headTexts: { flex: 1, gap: 1 },
  heading: { fontFamily: fontFamilies.bold, fontSize: 18, letterSpacing: -0.3, color: colors.text },
  sub: { fontFamily: fontFamilies.medium, fontSize: 13, color: colors.textMuted },
  close: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  priceCard: { padding: 14, borderRadius: 18, gap: 8, backgroundColor: colors.surface },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  priceLeft: { gap: 2 },
  priceRight: { alignItems: 'flex-end', gap: 2 },
  cap: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.textMuted },
  price: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 30,
    letterSpacing: -1,
    color: colors.text,
  },
  priceWord: { fontSize: 16, color: colors.textMuted },
  up: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.positive },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { fontFamily: fontFamilies.bold, fontSize: 11, color: colors.textMuted },
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 1,
    backgroundColor: colors.surface,
  },
  statValue: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  statLabel: { fontFamily: fontFamilies.semibold, fontSize: 11, color: colors.textMuted },
  position: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: colors.heroCard,
  },
  positionLeft: { gap: 2 },
  positionRight: { alignItems: 'flex-end', gap: 2 },
  positionCap: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.heroMuted },
  positionLine: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.onHeroCard },
  positionValue: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 18,
    letterSpacing: -0.5,
    color: colors.onHeroCard,
  },
  pnl: { fontFamily: fontFamilies.bold, fontSize: 12, color: '#7FE0B8' },
  pnlDown: { color: '#FF8A80' },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  tab: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.primary },
  tabText: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.textSecondary },
  tabTextOn: { color: colors.onPrimary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  count: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
  },
  countValue: { fontFamily: fontFamilies.displayHeavy, fontSize: 20, color: colors.text },
  countWord: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.textMuted },
  quick: { flexDirection: 'row', gap: 8, marginTop: -4 },
  quickBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  quickText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.textSecondary },
  totals: { gap: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontFamily: fontFamilies.semibold, fontSize: 13, color: colors.textSecondary },
  totalValue: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  ctaWrap: { borderRadius: 16, overflow: 'hidden' },
  cta: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ctaDark: { backgroundColor: colors.primary },
  ctaOff: { opacity: 0.5 },
  ctaInk: { fontFamily: fontFamilies.bold, fontSize: 16, color: '#1A1A1A' },
  ctaLight: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.onPrimary },
  disclaimer: {
    textAlign: 'center',
    fontFamily: fontFamilies.medium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
  },
}));
