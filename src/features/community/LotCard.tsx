import { Pressable, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import type { DemoLot } from '../../data/seed/demoCommunity';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';
import { CardSlab } from '../cards/CardSlab';

type LotCardProps = Readonly<{
  lot: DemoLot;
  mode: 'auctions' | 'market';
  onOpen?: (lotId: string) => void;
}>;

/** One card for sale: the slab, who sells it, how many exist and the bid (auction) or the price (catalog). */
export function LotCard({ lot, mode, onOpen }: LotCardProps) {
  const styles = useStyles();
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
        topRight={auction ? lot.time : undefined}
      />
      <View style={styles.line}>
        <Text numberOfLines={1} style={styles.seller}>
          {lot.seller}
        </Text>
        <Text style={styles.run}>{ru.community.run.replace('{n}', lot.run)}</Text>
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
  run: { fontFamily: fontFamilies.bold, fontSize: 11, color: colors.textMuted },
  label: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.textMuted },
  value: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  valueText: { fontFamily: fontFamilies.extrabold, fontSize: 14, color: colors.text },
}));
