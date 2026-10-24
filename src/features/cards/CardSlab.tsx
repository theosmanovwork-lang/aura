import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import type { RarityKey } from '../../data/seed/demoCommunity';
import { fontFamilies, makeStyles } from '../../theme';
import { CarIllustration } from './CarIllustration';
import { RARITY_STYLES, type RarityStyle } from './rarity';

const SPARKLE =
  'M12 2.5c.8 5.1 4.4 8.7 9.5 9.5-5.1.8-8.7 4.4-9.5 9.5-.8-5.1-4.4-8.7-9.5-9.5 5.1-.8 8.7-4.4 9.5-9.5z';

type Size = 'xl' | 'large' | 'small';

type CardSlabProps = Readonly<{
  rarity: RarityKey;
  no: string;
  name: string;
  grade: string;
  rarityLabel: string;
  carLabel: string;
  size?: Size;
  /** Draw the name over the picture (the lot page writes it under the card instead). */
  showName?: boolean;
  /** The rarity pill and the timer sit over the picture on the big card. */
  topLeft?: string;
  topRight?: string;
  testID?: string;
}>;

const SIZES = {
  xl: {
    pad: 6,
    stripH: 28,
    artH: 300,
    pip: 7,
    name: 16,
    radius: 18,
    stripRadius: 10,
    artRadius: 12,
    sparkle: 18,
  },
  large: {
    pad: 5,
    stripH: 22,
    artH: 150,
    pip: 5,
    name: 12,
    radius: 14,
    stripRadius: 8,
    artRadius: 10,
    sparkle: 11,
  },
  small: {
    pad: 4,
    stripH: 18,
    artH: 124,
    pip: 4,
    name: 10,
    radius: 12,
    stripRadius: 6,
    artRadius: 8,
    sparkle: 8,
  },
} as const;

function Pips({ r, size }: Readonly<{ r: RarityStyle; size: number }>) {
  return (
    <View style={{ flexDirection: 'row', gap: size - 1 }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: 1,
            transform: [{ rotate: '45deg' }],
            backgroundColor: i < r.pipsLit ? r.pipOn : r.pipOff,
          }}
        />
      ))}
    </View>
  );
}

/** A collectible card in its plastic slab: number and grade on top, the picture with the car, the name. */
export function CardSlab({
  rarity,
  no,
  name,
  grade,
  rarityLabel,
  carLabel,
  size = 'large',
  showName = true,
  topLeft,
  topRight,
  testID,
}: CardSlabProps) {
  const styles = useStyles();
  const r = RARITY_STYLES[rarity];
  const m = SIZES[size];
  const Art = r.silverArt ? SilverView : View;

  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={`${name}, ${rarityLabel}, ${no}`}
      style={[styles.slab, { padding: m.pad, borderRadius: m.radius, borderColor: r.slabBorder }]}
    >
      <View
        style={[
          styles.strip,
          { height: m.stripH, borderRadius: m.stripRadius, backgroundColor: r.stripBg },
        ]}
      >
        <Text style={[styles.stripText, { color: r.stripInk }]}>{no}</Text>
        <Pips r={r} size={m.pip} />
        <Text style={[styles.stripText, { color: r.stripInk }]}>{grade}</Text>
      </View>
      <Art
        style={[
          styles.art,
          { height: m.artH, borderRadius: m.artRadius },
          !r.silverArt && { backgroundColor: r.art },
        ]}
      >
        <View style={[styles.bigCircle, { backgroundColor: r.circle }]} />
        {r.sparkle ? (
          <>
            <Svg width={m.sparkle} height={m.sparkle} viewBox="0 0 24 24" style={styles.sparkleA}>
              <Path d={SPARKLE} fill={r.sparkle} />
            </Svg>
            <Svg
              width={m.sparkle - 2}
              height={m.sparkle - 2}
              viewBox="0 0 24 24"
              style={styles.sparkleB}
            >
              <Path d={SPARKLE} fill={r.sparkle} />
            </Svg>
          </>
        ) : null}
        <View style={[styles.band, { backgroundColor: r.band }]} />
        <CarIllustration car={r.car} label={carLabel} style={styles.car} />
        {r.foil ? (
          <LinearGradient
            pointerEvents="none"
            colors={[...r.foil] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fill}
          />
        ) : null}
        {topLeft ? (
          <View style={[styles.pill, styles.pillLeft, { backgroundColor: r.pillBg }]}>
            <Text style={[styles.pillText, { color: r.pillInk }]}>{topLeft}</Text>
          </View>
        ) : null}
        {topRight ? (
          <View style={[styles.pill, styles.pillRight]}>
            <Glyph name="clock" size={11} color="#FFFFFF" strokeWidth={2.8} />
            <Text style={[styles.pillText, styles.pillTextLight]}>{topRight}</Text>
          </View>
        ) : null}
        {showName ? (
          <Text numberOfLines={1} style={[styles.name, { color: r.ink, fontSize: m.name }]}>
            {name}
          </Text>
        ) : null}
      </Art>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  slab: { backgroundColor: '#F8F7FB', borderWidth: 2, gap: 4 },
  strip: {
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stripText: { fontFamily: fontFamilies.bold, fontSize: 10, letterSpacing: 0.3 },
  art: { overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  bigCircle: {
    position: 'absolute',
    right: '-28%',
    top: '-22%',
    width: '82%',
    aspectRatio: 1,
    borderRadius: 999,
  },
  sparkleA: { position: 'absolute', left: '12%', top: '36%' },
  sparkleB: { position: 'absolute', right: '14%', top: '40%' },
  band: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '24%' },
  car: { position: 'absolute', left: '3%', bottom: '14%', width: '94%', aspectRatio: 220 / 120 },
  pill: {
    position: 'absolute',
    top: 7,
    height: 20,
    paddingHorizontal: 7,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pillLeft: { left: 7 },
  pillRight: { right: 7, backgroundColor: 'rgba(26,26,26,0.72)' },
  pillText: { fontFamily: fontFamilies.bold, fontSize: 10 },
  pillTextLight: { color: '#FFFFFF' },
  name: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    fontFamily: fontFamilies.display,
    lineHeight: 14,
  },
}));
