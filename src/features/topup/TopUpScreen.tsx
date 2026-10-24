import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Glyph } from '../../components/Glyph';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SilverView } from '../../components/SilverView';
import { useBottomInset } from '../../components/useBottomInset';
import { useTopInset } from '../../components/useTopInset';
import { DEFAULT_PACK, demoFreeAura, demoPacks, type DemoPack } from '../../data/seed/demoShop';
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { useBalance } from '../wallet/useBalance';

type TopUpScreenProps = Readonly<{ onBack: () => void }>;

/**
 * The top-up screen of the design. It only draws the packs: the buy button changes the text and
 * nothing more, there is no payment code and the ledger is not touched.
 */
export function TopUpScreen({ onBack }: TopUpScreenProps) {
  const styles = useStyles();
  const t = ru.topup;
  const balance = useBalance();
  const [pick, setPick] = useState(DEFAULT_PACK);
  const [bought, setBought] = useState(false);
  const top = useTopInset();
  const bottom = useBottomInset();
  const chosen = demoPacks[pick] as DemoPack;
  const shown = (balance ?? 0) + (bought ? chosen.amount : 0);

  return (
    <View style={styles.page}>
      <ScrollView
        testID="topup-scroll"
        contentContainerStyle={[styles.content, { paddingTop: top, paddingBottom: 140 + bottom }]}
      >
        <ScreenHeader title={t.title} backLabel={ru.common.back} onBack={onBack} />

        <View style={styles.balanceCard}>
          <View style={styles.balanceText}>
            <Text style={styles.balanceLabel}>{t.nowOnBalance}</Text>
            <Text testID="topup-balance" style={styles.balance}>
              {`${balance === null ? '—' : formatPoints(shown)} `}
              <Text style={styles.balanceWord}>{ru.cards.coinsWord}</Text>
            </Text>
          </View>
          <AuraCoin size={48} tone="light" />
        </View>

        <View style={styles.sectionRow}>
          <Text accessibilityRole="header" style={styles.section}>
            {t.packs}
          </Text>
          <Text style={styles.sectionHint}>{t.bonusGrows}</Text>
        </View>

        <View style={styles.grid}>
          {demoPacks.map((pack, index) => (
            <PackCard
              key={pack.amount}
              pack={pack}
              on={index === pick}
              onPick={() => {
                setPick(index);
                setBought(false);
              }}
            />
          ))}
        </View>

        <View style={styles.free}>
          <View style={styles.freeIcon}>
            <FreeIcon />
          </View>
          <View style={styles.freeTexts}>
            <Text style={styles.freeTitle}>{t.freeTitle}</Text>
            <Text style={styles.freeText}>{t.freeText}</Text>
          </View>
          <Text style={styles.freeProgress}>
            {t.freeProgress
              .replace('{done}', String(demoFreeAura.done))
              .replace('{total}', String(demoFreeAura.total))}
          </Text>
        </View>

        <Text style={styles.note}>{t.note}</Text>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: 12 + bottom }]}>
        <Pressable
          testID="topup-buy"
          accessibilityRole="button"
          onPress={() => setBought(true)}
          style={styles.buyWrap}
        >
          {bought ? (
            <View style={[styles.buy, styles.buyDone]}>
              <Text style={styles.buyDoneText}>
                {t.done.replace('{amount}', formatPoints(chosen.amount))}
              </Text>
            </View>
          ) : (
            <SilverView style={styles.buy}>
              <Text style={styles.buyText}>
                {t.buy
                  .replace('{amount}', formatPoints(chosen.amount))
                  .replace('{price}', chosen.price)}
              </Text>
            </SilverView>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function FreeIcon() {
  const colors = useColors();
  return <Glyph name="video" size={22} color={colors.textSecondary} />;
}

type PackCardProps = Readonly<{ pack: DemoPack; on: boolean; onPick: () => void }>;

function PackCard({ pack, on, onPick }: PackCardProps) {
  const styles = useStyles();
  const price = pack.price;
  return (
    <Pressable
      testID={`pack-${pack.amount}`}
      accessibilityRole="button"
      accessibilityLabel={ru.topup.packLabel
        .replace('{amount}', formatPoints(pack.amount))
        .replace('{price}', price)}
      accessibilityState={{ selected: on }}
      onPress={onPick}
      style={[styles.pack, on ? styles.packOn : styles.packOff]}
    >
      <View style={styles.packTop}>
        <View style={[styles.coins, pack.coins > 1 && { gap: -10 }]}>
          {Array.from({ length: pack.coins }, (_, i) => (
            <AuraCoin key={i} size={26} tone={on ? 'light' : 'dark'} />
          ))}
        </View>
        {pack.tag ? (
          <View style={[styles.tag, on ? styles.tagOn : styles.tagOff]}>
            <Text style={[styles.tagText, on ? styles.tagTextOn : styles.tagTextOff]}>
              {pack.tag}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.packMid}>
        <Text style={[styles.amount, on && styles.onInk]}>{formatPoints(pack.amount)}</Text>
        <Text style={[styles.bonus, on && styles.bonusOn]}>{pack.bonus}</Text>
      </View>
      <Text style={[styles.price, on && styles.onInk]}>{price}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, gap: 12 },
  balanceCard: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.heroCard,
  },
  balanceText: { gap: 4 },
  balanceLabel: { fontFamily: fontFamilies.semibold, fontSize: 13, color: colors.heroMuted },
  balance: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 28,
    letterSpacing: -0.8,
    color: colors.onHeroCard,
  },
  balanceWord: { color: '#D7DAE0' },
  sectionRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: { fontFamily: fontFamilies.bold, fontSize: 18, color: colors.text },
  sectionHint: { fontFamily: fontFamilies.semibold, fontSize: 13, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pack: {
    width: '47.5%',
    height: 148,
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'space-between',
  },
  packOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  packOff: { backgroundColor: colors.surface, borderColor: colors.surface },
  packTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  coins: { flexDirection: 'row' },
  tag: { height: 22, paddingHorizontal: 8, borderRadius: 11, justifyContent: 'center' },
  tagOn: { backgroundColor: colors.onPrimary },
  tagOff: { backgroundColor: colors.primary },
  tagText: { fontFamily: fontFamilies.bold, fontSize: 10 },
  tagTextOn: { color: colors.primary },
  tagTextOff: { color: colors.onPrimary },
  packMid: { gap: 2 },
  amount: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 20,
    letterSpacing: -0.6,
    color: colors.text,
  },
  bonus: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.textMuted },
  bonusOn: { color: '#D7DAE0' },
  price: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  onInk: { color: colors.onPrimary },
  free: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  freeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  freeTexts: { flex: 1, gap: 2 },
  freeTitle: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  freeText: { fontFamily: fontFamilies.medium, fontSize: 13, color: colors.textMuted },
  freeProgress: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.textSecondary },
  note: {
    paddingHorizontal: 4,
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  buyWrap: { borderRadius: 16, overflow: 'hidden' },
  buy: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buyDone: { backgroundColor: colors.primary },
  buyText: { fontFamily: fontFamilies.bold, fontSize: 16, color: '#1A1A1A' },
  buyDoneText: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.onPrimary },
}));
