import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Avatar } from '../../components/Avatar';
import { Glyph } from '../../components/Glyph';
import { Message } from '../../components/Message';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SilverView } from '../../components/SilverView';
import { useTopInset } from '../../components/useTopInset';
import { demoLots } from '../../data/seed/demoCommunity';
import {
  demoBidCount,
  demoBidHistory,
  demoSeller,
  demoSerial,
  RUNS,
} from '../../data/seed/demoShop';
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { CardSlab } from '../cards/CardSlab';
import { PressableScale } from '../../motion/PressableScale';
import { success } from '../../motion/haptics';

const BID_STEP = 100;
const QUICK_BIDS = [100, 500, 1000] as const;

const toNumber = (text: string): number => Number(text.replace(/\s/g, ''));

type LotScreenProps = Readonly<{
  lotId: string;
  onBack: () => void;
  onWriteSeller?: () => void;
}>;

/**
 * The page of one card for sale: the big slab, the current bid, the bid pad, the history and the seller.
 * Bidding is only drawn: the bid is kept on the screen, no Aura is frozen and nothing is saved.
 */
export function LotScreen({ lotId, onBack, onWriteSeller }: LotScreenProps) {
  const styles = useStyles();
  const t = ru.lot;
  const top = useTopInset();
  const lot = demoLots.find((item) => item.id === lotId);
  const current = lot ? toNumber(lot.bid) : 0;
  const minBid = current + BID_STEP;
  const [bid, setBid] = useState(minBid);
  const [placed, setPlaced] = useState(false);
  const colors = useColors();

  if (!lot) return <Message text={t.notFound} action={{ label: ru.common.back, run: onBack }} />;

  const rarityLabel = ru.cards.rarity[lot.rarity];
  const change = (next: number) => {
    setBid(Math.max(minBid, next));
    setPlaced(false);
  };
  return (
    <ScrollView
      testID="lot-scroll"
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: top }]}
    >
      <ScreenHeader
        title={t.title.replace('{no}', lot.no)}
        backLabel={ru.common.back}
        onBack={onBack}
        right={
          <View accessibilityLabel={t.share} style={styles.round}>
            <Glyph name="share" size={20} color={colors.text} />
          </View>
        }
      />

      <CardSlab
        size="xl"
        showName={false}
        rarity={lot.rarity}
        no={lot.no}
        name={lot.name}
        grade={`GRADE ${lot.grade}`}
        rarityLabel={rarityLabel}
        carLabel={ru.cards.carAlt[lot.rarity]}
        topLeft={rarityLabel}
        topRight={lot.time}
      />

      <View style={styles.titleBlock}>
        <Text accessibilityRole="header" style={styles.name}>
          {lot.name}
        </Text>
        <View style={styles.chips}>
          <Text style={[styles.chip, styles.chipDark]}>{rarityLabel}</Text>
          <Text style={styles.chip}>
            {t.serial.replace('{n}', String(demoSerial)).replace('{run}', String(RUNS[lot.rarity]))}
          </Text>
          <Text style={styles.chip}>{t.grade.replace('{n}', lot.grade)}</Text>
          <Text style={styles.chip}>{t.kind}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.row}>
          <Text style={styles.label}>{t.currentBid}</Text>
          <Text style={styles.timer}>{t.timer.replace('{time}', lot.time)}</Text>
        </View>
        <View style={styles.big}>
          <AuraCoin size={30} />
          <Text testID="lot-current-bid" style={styles.bigValue}>
            {`${lot.bid} `}
            <Text style={styles.bigWord}>{ru.cards.coinsWord}</Text>
          </Text>
        </View>
        <Text style={styles.bidInfo}>
          {t.bidInfo
            .replace('{who}', demoBidHistory[0]?.name ?? '')
            .replace('{ago}', demoBidHistory[0]?.time ?? '')
            .replace('{count}', String(demoBidCount))}
        </Text>

        <Text style={styles.label}>{t.yourBid}</Text>
        <View style={styles.stepper}>
          <PressableScale
            testID="bid-dec"
            accessibilityRole="button"
            accessibilityLabel={t.decrease}
            onPress={() => change(bid - BID_STEP)}
            style={styles.stepBtn}
          >
            <Glyph name="minus" size={20} color={colors.text} strokeWidth={2.6} />
          </PressableScale>
          <Text testID="bid-value" style={styles.bidField}>
            {formatPoints(bid)}
          </Text>
          <PressableScale
            testID="bid-inc"
            accessibilityRole="button"
            accessibilityLabel={t.increase}
            onPress={() => change(bid + BID_STEP)}
            style={styles.stepBtn}
          >
            <Glyph name="plus" size={20} color={colors.text} strokeWidth={2.6} />
          </PressableScale>
        </View>
        <View style={styles.quick}>
          {QUICK_BIDS.map((value) => (
            <PressableScale
              key={value}
              testID={`bid-add-${value}`}
              accessibilityRole="button"
              onPress={() => change(bid + value)}
              style={styles.quickBtn}
            >
              <Text style={styles.quickText}>{`+${formatPoints(value)}`}</Text>
            </PressableScale>
          ))}
        </View>

        <PressableScale
          testID="bid-place"
          accessibilityRole="button"
          onPress={() => {
            success();
            setPlaced(true);
          }}
          style={[styles.cta, placed ? styles.ctaDone : styles.ctaInk]}
        >
          <Text style={[styles.ctaText, placed ? styles.ctaDoneText : styles.ctaInkText]}>
            {placed
              ? t.placed.replace('{amount}', formatPoints(bid))
              : t.place.replace('{amount}', formatPoints(bid))}
          </Text>
        </PressableScale>
        <SilverView style={styles.cta}>
          <Text style={[styles.ctaText, styles.ctaSilverText]}>
            {t.buyNow.replace('{price}', lot.price)}
          </Text>
        </SilverView>
        <Text style={styles.note}>{t.frozenNote}</Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.row}>
          <Text accessibilityRole="header" style={styles.section}>
            {t.history}
          </Text>
          <Text style={styles.link}>{t.allBids.replace('{n}', String(demoBidCount))}</Text>
        </View>
        {demoBidHistory.map((item, index) => (
          <View key={`${item.name}-${item.amount}`} style={styles.history}>
            <Avatar initial={item.initial} tone={item.color} size={36} square />
            <View style={styles.historyText}>
              <View style={styles.historyName}>
                <Text style={styles.who}>{item.name}</Text>
                {index === 0 ? <Text style={styles.leads}>{t.leads}</Text> : null}
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.amount}>{item.amount}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.panel, styles.sellerPanel]}>
        <Avatar initial={lot.seller.slice(1, 2).toUpperCase()} tone="brand" size={48} />
        <View style={styles.historyText}>
          <Text style={styles.sellerName}>{t.seller.replace('{who}', lot.seller)}</Text>
          <Text style={styles.time}>
            {t.deals
              .replace('{deals}', String(demoSeller.deals))
              .replace('{clean}', String(demoSeller.clean))}
          </Text>
        </View>
        <PressableScale
          testID="lot-write"
          accessibilityRole="button"
          onPress={onWriteSeller}
          style={styles.write}
        >
          <Text style={styles.writeText}>{t.write}</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  titleBlock: { gap: 10 },
  name: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 22,
    letterSpacing: -0.5,
    color: colors.text,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    overflow: 'hidden',
    lineHeight: 26,
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  chipDark: { color: '#E8B04B', backgroundColor: colors.primary },
  panel: { padding: 16, borderRadius: 20, gap: 14, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.textMuted },
  timer: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    lineHeight: 24,
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceMuted,
  },
  big: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bigValue: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 32,
    letterSpacing: -1,
    color: colors.text,
  },
  bigWord: { color: colors.textMuted },
  bidInfo: {
    marginTop: -10,
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  bidField: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 45,
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 20,
    color: colors.text,
  },
  quick: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  quickText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.textSecondary },
  cta: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctaInk: { backgroundColor: colors.primary },
  ctaDone: { backgroundColor: colors.surfaceMuted },
  ctaText: { fontFamily: fontFamilies.bold, fontSize: 16 },
  ctaInkText: { color: colors.onPrimary },
  ctaDoneText: { color: colors.textSecondary },
  ctaSilverText: { color: '#1A1A1A' },
  note: { fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  section: { fontFamily: fontFamilies.bold, fontSize: 18, color: colors.text },
  link: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  history: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyText: { flex: 1, gap: 1 },
  historyName: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  who: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.text },
  leads: {
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    overflow: 'hidden',
    lineHeight: 18,
    fontFamily: fontFamilies.bold,
    fontSize: 10,
    color: colors.onPrimary,
    backgroundColor: colors.primary,
  },
  time: { fontFamily: fontFamilies.medium, fontSize: 12, color: colors.textMuted },
  amount: { fontFamily: fontFamilies.displayHeavy, fontSize: 14, color: colors.text },
  sellerPanel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerName: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  write: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  writeText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.onPrimary },
}));
