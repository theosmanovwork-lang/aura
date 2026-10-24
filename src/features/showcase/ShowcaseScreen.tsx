import { useState, type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Avatar } from '../../components/Avatar';
import { Glyph, GLYPH_NAMES } from '../../components/Glyph';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SilverView } from '../../components/SilverView';
import { useTopInset } from '../../components/useTopInset';
import { Skeleton } from '../../components/Skeleton';
import { ru } from '../../i18n/ru';
import { PressableScale } from '../../motion/PressableScale';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { CardSlab } from '../cards/CardSlab';

const RARITIES = ['common', 'rare', 'special', 'treasure'] as const;
const RARITY_GRADES = { common: '8.5', rare: '9', special: '9.5', treasure: '10' } as const;

type ShowcaseScreenProps = Readonly<{ onBack: () => void }>;

function Section({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Every building block of the design on one page: buttons, chips, avatars, coins, cards and all the icons. */
export function ShowcaseScreen({ onBack }: ShowcaseScreenProps) {
  const styles = useStyles();
  const colors = useColors();
  const top = useTopInset();
  const t = ru.showcase;
  const [segment, setSegment] = useState<'one' | 'two'>('one');
  return (
    <ScrollView
      testID="showcase-scroll"
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: top }]}
    >
      <ScreenHeader title={t.title} backLabel={ru.common.back} onBack={onBack} />

      <Section title={t.buttons}>
        <PressableScale accessibilityRole="button" style={[styles.button, styles.dark]}>
          <Text style={styles.onDark}>{t.primary}</Text>
        </PressableScale>
        <PressableScale accessibilityRole="button" style={styles.chromeWrap}>
          <SilverView style={styles.button}>
            <Text style={styles.onChrome}>{t.chrome}</Text>
          </SilverView>
        </PressableScale>
        <PressableScale accessibilityRole="button" style={[styles.button, styles.soft]}>
          <Text style={styles.onSoft}>{t.soft}</Text>
        </PressableScale>
        <View accessibilityState={{ disabled: true }} style={[styles.button, styles.off]}>
          <Text style={styles.onOff}>{t.disabled}</Text>
        </View>
        <View style={[styles.button, styles.dark]}>
          <Skeleton width={18} height={18} radius={9} />
          <Text style={styles.onDark}>{t.loading}</Text>
        </View>
      </Section>

      <Section title={t.chips}>
        <View style={styles.row}>
          <Text style={[styles.chip, styles.chipDark]}>{ru.cards.rarity.treasure}</Text>
          <Text style={styles.chip}>{ru.lot.grade.replace('{n}', '10')}</Text>
          <Text style={[styles.chip, styles.chipSoft]}>{t.badge}</Text>
        </View>
      </Section>

      <Section title={t.segmented}>
        <View accessibilityRole="tablist" style={styles.segmented}>
          {(['one', 'two'] as const).map((key) => (
            <PressableScale
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: key === segment }}
              onPress={() => setSegment(key)}
              style={[styles.segment, key === segment && styles.segmentOn]}
            >
              <Text style={[styles.segmentText, key === segment && styles.segmentTextOn]}>
                {t[key]}
              </Text>
            </PressableScale>
          ))}
        </View>
      </Section>

      <Section title={t.avatars}>
        <View style={styles.row}>
          {[28, 40, 52, 88].map((size) => (
            <Avatar key={size} initial="M" tone="brand" size={size} />
          ))}
          <Avatar initial={ru.showcase.clanInitial} tone="silver" size={52} square />
        </View>
      </Section>

      <Section title={t.coins}>
        <View style={styles.row}>
          <AuraCoin size={16} />
          <AuraCoin size={22} />
          <AuraCoin size={34} />
          <View style={styles.coinDark}>
            <AuraCoin size={34} tone="light" />
          </View>
          <Text style={styles.amount}>
            {t.amount} <Text style={styles.amountWord}>{ru.cards.coinsWord}</Text>
          </Text>
        </View>
      </Section>

      <Section title={t.slabs}>
        <View style={styles.slabs}>
          {RARITIES.map((rarity) => (
            <View key={rarity} style={styles.slab}>
              <CardSlab
                size="small"
                rarity={rarity}
                no="#071"
                name={ru.cards.rarity[rarity]}
                grade={RARITY_GRADES[rarity]}
                rarityLabel={ru.cards.rarity[rarity]}
                carLabel={ru.cards.carAlt[rarity]}
              />
            </View>
          ))}
        </View>
      </Section>

      <Section title={t.icons}>
        <View testID="showcase-icons" style={styles.icons}>
          {GLYPH_NAMES.map((name) => (
            <View key={name} testID={`icon-${name}`} style={styles.icon}>
              <Glyph name={name} size={24} color={colors.text} />
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 48, gap: 20 },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  button: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  chromeWrap: { borderRadius: 14, overflow: 'hidden' },
  dark: { backgroundColor: colors.primary },
  soft: { backgroundColor: colors.surfaceMuted },
  off: { backgroundColor: colors.border },
  onDark: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.onPrimary },
  onChrome: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#1A1A1A' },
  onSoft: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  onOff: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.textMuted },
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
  chipSoft: { color: colors.textSecondary, backgroundColor: colors.surfaceMuted },
  segmented: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentOn: { backgroundColor: colors.primary },
  segmentText: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.textSecondary },
  segmentTextOn: { color: colors.onPrimary },
  coinDark: { padding: 8, borderRadius: 14, backgroundColor: '#1A1A1A' },
  amount: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 22,
    letterSpacing: -0.5,
    color: colors.text,
  },
  amountWord: { color: colors.textMuted },
  slabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slab: { width: '47%' },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
}));
