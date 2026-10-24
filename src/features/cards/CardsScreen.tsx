import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { Wave } from '../../components/Wave';
import { useTabScreenContent } from '../../components/useTabScreenContent';
import { demoChests } from '../../data/seed/demoCommunity';
import { formatPoints } from '../../i18n/format';
import { countLabel } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';
import { useBalance } from '../wallet/useBalance';
import { CollectionGrid } from './CollectionGrid';
import { QuestsCard } from './QuestsCard';

type CardsScreenProps = Readonly<{
  /** Change it to read the balance again (for example every time the tab comes into view). */
  refreshKey?: number;
  onTopUp?: () => void;
  onOpenChests?: () => void;
}>;

export function CardsScreen({ refreshKey = 0, onTopUp, onOpenChests }: CardsScreenProps) {
  const styles = useStyles();
  const content = useTabScreenContent(styles.content);
  const balance = useBalance(refreshKey);
  const [claimed, setClaimed] = useState(false);
  const chests = countLabel(demoChests, ru.cards.chests);

  return (
    <ScrollView testID="cards-scroll" style={styles.page} contentContainerStyle={content}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          {ru.cards.title}
        </Text>
        <Pressable
          onPress={onOpenChests}
          testID="open-chests"
          accessibilityRole="button"
          accessibilityLabel={ru.cards.openChests.replace('{count}', chests)}
          style={styles.chests}
        >
          <SilverView style={styles.chestIcon}>
            <Glyph name="chest" size={18} color="#1A1A1A" strokeWidth={2.2} />
            <View style={styles.chestBadge}>
              <Text style={styles.chestBadgeText}>{demoChests}</Text>
            </View>
          </SilverView>
          <Text style={styles.chestsText}>{ru.cards.openChests.replace('{count}', chests)}</Text>
        </Pressable>
      </View>

      <View testID="balance-card" style={styles.balanceCard}>
        <Wave />
        <SilverView style={styles.dot} />
        <Text style={styles.balanceLabel}>{ru.cards.balance}</Text>
        <View style={styles.balanceRow}>
          <AuraCoin size={34} tone="light" />
          <Text testID="balance-value" style={styles.balance}>
            {balance === null ? '—' : `${formatPoints(balance)} `}
            <Text style={styles.balanceWord}>{ru.cards.coinsWord}</Text>
          </Text>
        </View>
        <Text style={styles.today}>{ru.cards.today}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onTopUp}
          testID="top-up"
          style={styles.topUpWrap}
        >
          <SilverView style={styles.topUp}>
            <Glyph name="plus" size={16} color="#1A1A1A" strokeWidth={2.6} />
            <Text style={styles.topUpText}>{ru.cards.topUp}</Text>
          </SilverView>
        </Pressable>
      </View>

      <QuestsCard claimed={claimed} onClaim={() => setClaimed(true)} />
      <CollectionGrid />

      <View style={styles.hint}>
        <View style={styles.hintIcon}>
          <Glyph name="chest" size={22} color="#4A4F57" strokeWidth={2.2} />
        </View>
        <View style={styles.hintTexts}>
          <Text style={styles.hintTitle}>{ru.cards.hint}</Text>
          <Text style={styles.hintText}>{ru.cards.hintMore}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, gap: 12 },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 30,
    letterSpacing: -0.9,
    color: colors.text,
  },
  chests: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: 22,
    backgroundColor: colors.primary,
  },
  chestIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5483A',
  },
  chestBadgeText: { fontFamily: fontFamilies.bold, fontSize: 10, color: '#FFFFFF' },
  chestsText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.onPrimary },
  balanceCard: {
    overflow: 'hidden',
    padding: 20,
    borderRadius: 20,
    gap: 6,
    backgroundColor: colors.heroCard,
  },
  dot: { position: 'absolute', right: 22, top: 20, width: 16, height: 16, borderRadius: 8 },
  balanceLabel: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.heroMuted },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  balance: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 34,
    letterSpacing: -1,
    color: colors.onHeroCard,
  },
  balanceWord: { color: '#D7DAE0' },
  today: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.heroMuted },
  topUpWrap: { marginTop: 14, borderRadius: 14, overflow: 'hidden' },
  topUp: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  topUpText: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#1A1A1A' },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D9D2C3',
  },
  hintIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  hintTexts: { flex: 1, gap: 2 },
  hintTitle: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.text },
  hintText: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.textMuted },
}));
