import { Pressable, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Glyph } from '../../components/Glyph';
import type { DemoLot } from '../../data/seed/demoCommunity';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { CardSlab } from '../cards/CardSlab';

type LotCardProps = Readonly<{
  lot: DemoLot;
  mode: 'auctions' | 'market';
  onOpen?: (lotId: string) => void;
}>;

/** One card for sale: the slab, who sells it, how many exist and the bid (auction) or the price (catalog). */
export function LotCard({ lot, mode, onOpen }: LotCardProps) {
  const styles = useStyles();
  const colors = useColors();
  const rarityLabel = ru.cards.rarity[lot.rarity];
  const auction = mode === 'auctions';
  return (
    <Pressable
      onPress={() => onOpen?.(lot.id)}
      testID={`lot-${lot.id}`}
      accessibilityRole="button"
      accessibilityLabel={ru.community.openLot
        .replace('{name}', lot.name)
        .replace('{rarity}', rarityLabel)}
      style={styles.card}
    >
      <CardSlab
        rarity={lot.rarity}
        no={lot.no}
        name={lot.name}
        grade={lot.grade}
        rarityLabel={rarityLabel}
        carLabel={ru.cards.carAlt[lot.rarity]}
        topLeft={rarityLabel}
      />
      <View style={styles.line}>
        <Text numberOfLines={1} style={styles.seller}>
          {lot.seller}
        </Text>
        {auction ? (
          <View style={styles.time}>
            <Glyph name="clock" size={12} color={colors.text} strokeWidth={2.6} />
            <Text style={styles.timeText}>{lot.time}</Text>
          </View>
        ) : (
          <Text style={styles.run}>{ru.community.run.replace('{n}', lot.run)}</Text>
        )}
      </View>
      <View style={styles.line}>
        <Text style={styles.label}>{auction ? ru.community.bid : ru.community.price}</Text>
        <View style={styles.value}>
          <AuraCoin size={15} />
          <Text style={styles.valueText}>{auction ? lot.bid : lot.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderRadius: 20,
    gap: 8,
    backgroundColor: colors.surface,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 2,
  },
  seller: {
    flexShrink: 1,
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
  time: {
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceMuted,
  },
  timeText: { fontFamily: fontFamilies.bold, fontSize: 11, color: colors.text },
  run: { fontFamily: fontFamilies.bold, fontSize: 11, color: colors.textMuted },
  label: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.textMuted },
  value: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  valueText: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.text },
}));
