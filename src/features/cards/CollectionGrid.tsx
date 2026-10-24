import { Pressable, Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { demoCollection, demoCollectionCounts } from '../../data/seed/demoCommunity';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { CardSlab } from './CardSlab';

/** «Коллекция 14 / 60» with the filter button and the grid of cards (open ones and locked ones). */
export function CollectionGrid() {
  const styles = useStyles();
  const colors = useColors();
  const t = ru.cards;
  return (
    <>
      <View style={styles.head}>
        <View style={styles.title}>
          <Text accessibilityRole="header" style={styles.heading}>
            {t.collection}
          </Text>
          <Text style={styles.count}>
            {t.collectionSub
              .replace('{have}', String(demoCollectionCounts.have))
              .replace('{total}', String(demoCollectionCounts.total))}
          </Text>
        </View>
        <Pressable
          disabled
          accessibilityState={{ disabled: true }}
          accessibilityRole="button"
          accessibilityLabel={t.filter}
          style={styles.filter}
        >
          <Text style={styles.filterText}>{t.filter}</Text>
          <Glyph name="chevronDown" size={14} color={colors.text} strokeWidth={2.4} />
        </Pressable>
      </View>
      <View style={styles.grid}>
        {demoCollection.map((card) =>
          card.kind === 'open' ? (
            <View key={card.id} style={styles.cell} testID={`collection-${card.id}`}>
              <CardSlab
                size="small"
                rarity={card.rarity}
                no={card.no}
                name={card.name}
                grade={card.grade}
                rarityLabel={t.rarity[card.rarity]}
                carLabel={t.carAlt[card.rarity]}
              />
              <View style={styles.caption}>
                <Text numberOfLines={1} style={styles.rarity}>
                  {t.rarity[card.rarity]}
                </Text>
                <Text style={styles.run}>{t.run.replace('{n}', card.run)}</Text>
              </View>
            </View>
          ) : (
            <View
              key={card.id}
              style={[styles.cell, styles.lockedCell]}
              testID={`collection-${card.id}`}
            >
              <View style={styles.lockedSlab}>
                <View style={styles.lockedStrip}>
                  <Text style={styles.lockedNo}>{card.no}</Text>
                </View>
                <View style={styles.lockedArt}>
                  <Glyph name="lock" size={28} color={colors.textMuted} />
                </View>
              </View>
              <View style={styles.caption}>
                <Text style={styles.rarity}>{t.locked}</Text>
                <Text style={styles.run}>{t.notOpened}</Text>
              </View>
            </View>
          ),
        )}
      </View>
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  head: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: { gap: 2 },
  heading: { fontFamily: fontFamilies.bold, fontSize: 20, letterSpacing: -0.3, color: colors.text },
  count: { fontFamily: fontFamilies.medium, fontSize: 12, color: colors.textMuted },
  filter: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  filterText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '30.5%', gap: 6 },
  lockedCell: { opacity: 0.6 },
  lockedSlab: {
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D9D2C3',
    backgroundColor: '#F8F7FB',
    gap: 4,
  },
  lockedStrip: {
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 6,
    justifyContent: 'center',
    backgroundColor: '#8E8578',
  },
  lockedNo: { fontFamily: fontFamilies.bold, fontSize: 10, color: '#FFFFFF' },
  lockedArt: {
    height: 124,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E4DF',
  },
  caption: { paddingHorizontal: 2 },
  rarity: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.text },
  run: { fontFamily: fontFamilies.bold, fontSize: 11, color: colors.textMuted },
}));
