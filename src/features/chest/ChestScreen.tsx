import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AuraCoin } from '../../components/AuraIcon';
import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { useBottomInset } from '../../components/useBottomInset';
import { useTopInset } from '../../components/useTopInset';
import { demoChestCount, demoChestReward, demoOdds, RUNS } from '../../data/seed/demoShop';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';
import { CardSlab } from '../cards/CardSlab';
import { RARITY_STYLES } from '../cards/rarity';

/** The flash lasts this long before the reward shows. */
export const FLASH_MS = 800;

type Stage = 'closed' | 'flash' | 'reward';

const SCENE = '#141311';
const GOLD_GLOW = ['#FFF0C8', '#E8B04B'] as const;

type ChestScreenProps = Readonly<{ onClose: () => void }>;

/**
 * Opening a chest, three frames of the design: the closed chest with the odds, a short flash, the reward.
 * The reward is always the same demo card: nothing is stored and no Aura is spent.
 */
export function ChestScreen({ onClose }: ChestScreenProps) {
  const styles = useStyles();
  const t = ru.chest;
  const top = useTopInset();
  const bottom = useBottomInset();
  const [stage, setStage] = useState<Stage>('closed');
  const [left, setLeft] = useState(demoChestCount);

  useEffect(() => {
    if (stage !== 'flash') return;
    const timer = setTimeout(() => setStage('reward'), FLASH_MS);
    return () => clearTimeout(timer);
  }, [stage]);

  const opened = demoChestCount - left + 1;
  const keep = () => {
    if (left <= 1) return onClose();
    setLeft(left - 1);
    setStage('closed');
  };

  return (
    <View testID={`chest-${stage}`} style={styles.page}>
      <Glow stage={stage} />
      <View style={[styles.top, { top }]}>
        <Pressable
          testID="chest-close"
          accessibilityRole="button"
          accessibilityLabel={t.close}
          onPress={onClose}
          style={styles.closeBtn}
        >
          <Glyph name="close" size={18} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.counter}>
          {t.counter.replace('{n}', String(opened)).replace('{total}', String(demoChestCount))}
        </Text>
        <View style={styles.closeBtn} />
      </View>

      {stage === 'closed' ? <Closed bottom={bottom} onOpen={() => setStage('flash')} /> : null}
      {stage === 'flash' ? <Flash /> : null}
      {stage === 'reward' ? <Reward bottom={bottom} more={left - 1} onKeep={keep} /> : null}
    </View>
  );
}

function Glow({ stage }: Readonly<{ stage: Stage }>) {
  const styles = useStyles();
  const strong = stage !== 'closed';
  return (
    <View pointerEvents="none" style={styles.glow}>
      <Svg width={420} height={420} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop
              offset="0"
              stopColor={strong ? GOLD_GLOW[0] : '#D7DAE0'}
              stopOpacity={strong ? 0.9 : 0.22}
            />
            <Stop
              offset="0.35"
              stopColor={strong ? GOLD_GLOW[1] : '#D7DAE0'}
              stopOpacity={strong ? 0.5 : 0.1}
            />
            <Stop offset="1" stopColor={strong ? GOLD_GLOW[1] : '#D7DAE0'} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#glow)" />
      </Svg>
    </View>
  );
}

function Closed({ bottom, onOpen }: Readonly<{ bottom: number; onOpen: () => void }>) {
  const styles = useStyles();
  const t = ru.chest;
  return (
    <>
      <Pressable
        testID="chest-body"
        accessibilityRole="button"
        accessibilityLabel={t.tap}
        onPress={onOpen}
        style={styles.chestArea}
      >
        <View style={styles.chestBox}>
          <Glyph name="chest" size={120} color="#D7DAE0" strokeWidth={1.6} />
        </View>
        <Text style={styles.tap}>{t.tap}</Text>
        <Text style={styles.inside}>{t.inside}</Text>
      </Pressable>
      <View style={[styles.odds, { bottom: 120 + bottom }]}>
        <Text style={styles.oddsTitle}>{t.odds}</Text>
        {demoOdds.map(({ rarity, percent }) => (
          <View key={rarity} style={styles.oddsRow}>
            <View style={[styles.swatch, { backgroundColor: RARITY_STYLES[rarity].art }]} />
            <Text style={styles.oddsName}>{ru.cards.rarity[rarity]}</Text>
            <View style={styles.oddsTrack}>
              <View
                style={[
                  styles.oddsFill,
                  { width: `${Math.max(percent, 3)}%`, backgroundColor: RARITY_STYLES[rarity].art },
                ]}
              />
            </View>
            <Text style={styles.oddsPercent}>{`${percent}%`}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.actions, { bottom: 48 + bottom }]}>
        <Pressable
          testID="chest-open"
          accessibilityRole="button"
          onPress={onOpen}
          style={styles.silverWrap}
        >
          <SilverView style={styles.primary}>
            <Text style={styles.primaryText}>{t.open}</Text>
          </SilverView>
        </Pressable>
      </View>
    </>
  );
}

function Flash() {
  const styles = useStyles();
  return (
    <View style={styles.flash}>
      <Text accessibilityLiveRegion="polite" style={styles.flashTitle}>
        {ru.chest.flash}
      </Text>
      <Text style={styles.inside}>{ru.chest.flashHint}</Text>
    </View>
  );
}

type RewardProps = Readonly<{ bottom: number; more: number; onKeep: () => void }>;

function Reward({ bottom, more, onKeep }: RewardProps) {
  const styles = useStyles();
  const t = ru.chest;
  const card = demoChestReward;
  const label = ru.cards.rarity[card.rarity];
  const percent = demoOdds.find((o) => o.rarity === card.rarity)?.percent ?? 0;
  return (
    <>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>{`${label.toUpperCase()} · ${percent}%`}</Text>
      </View>
      <View testID="chest-card" style={styles.card}>
        <CardSlab
          size="xl"
          showName
          rarity={card.rarity}
          no={card.no}
          name={card.name}
          grade={`GRADE ${card.grade}`}
          rarityLabel={label}
          carLabel={ru.cards.carAlt[card.rarity]}
          topLeft={label}
        />
      </View>
      <View style={styles.result}>
        <Text accessibilityRole="header" style={styles.resultName}>
          {card.name}
        </Text>
        <Text style={styles.resultInfo}>
          {t.serial
            .replace('{n}', String(card.serial))
            .replace('{run}', String(RUNS[card.rarity]))
            .replace('{grade}', card.grade)}
        </Text>
        <View style={styles.worth}>
          <AuraCoin size={14} tone="light" />
          <Text style={styles.worthText}>{t.worth.replace('{price}', card.worth)}</Text>
        </View>
      </View>
      <View style={[styles.actions, { bottom: 48 + bottom }]}>
        <Pressable
          testID="chest-keep"
          accessibilityRole="button"
          onPress={onKeep}
          style={styles.silverWrap}
        >
          <SilverView style={styles.primary}>
            <Text style={styles.primaryText}>{t.keep}</Text>
          </SilverView>
        </Pressable>
        <View style={styles.pair}>
          <Pressable
            testID="chest-more"
            accessibilityRole="button"
            accessibilityState={{ disabled: more < 1 }}
            disabled={more < 1}
            onPress={onKeep}
            style={[styles.second, styles.outline, more < 1 && styles.off]}
          >
            <Text style={styles.secondText}>
              {t.more.replace('{n}', String(Math.max(more, 0)))}
            </Text>
          </Pressable>
          <View
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            style={[styles.second, styles.plate, styles.off]}
          >
            <Glyph name="share" size={16} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.secondText}>{t.share}</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const useStyles = makeStyles(() => ({
  page: { flex: 1, backgroundColor: SCENE },
  glow: { position: 'absolute', left: '50%', top: 300, marginLeft: -210, marginTop: -210 },
  top: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  counter: { fontFamily: fontFamilies.extrabold, fontSize: 15, color: '#FFFFFF' },
  chestArea: { position: 'absolute', left: 0, right: 0, top: 150, alignItems: 'center', gap: 6 },
  chestBox: { height: 230, alignItems: 'center', justifyContent: 'center' },
  tap: { fontFamily: fontFamilies.extrabold, fontSize: 24, letterSpacing: -0.5, color: '#FFFFFF' },
  inside: { fontFamily: fontFamilies.medium, fontSize: 14, color: '#B5AC9D' },
  odds: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 20,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  oddsTitle: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#B5AC9D',
  },
  oddsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 14, height: 14, borderRadius: 4 },
  oddsName: { width: 84, fontFamily: fontFamilies.bold, fontSize: 13, color: '#FFFFFF' },
  oddsTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  oddsFill: { height: 6, borderRadius: 3 },
  oddsPercent: {
    width: 36,
    textAlign: 'right',
    fontFamily: fontFamilies.extrabold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  actions: { position: 'absolute', left: 16, right: 16, gap: 10 },
  silverWrap: { borderRadius: 16, overflow: 'hidden' },
  primary: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: fontFamilies.extrabold, fontSize: 16, color: '#1A1A1A' },
  flash: { position: 'absolute', left: 0, right: 0, top: 480, alignItems: 'center', gap: 6 },
  flashTitle: { fontFamily: fontFamilies.extrabold, fontSize: 26, color: '#FFE38A' },
  badgeRow: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  badge: {
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 13,
    overflow: 'hidden',
    lineHeight: 26,
    fontFamily: fontFamilies.extrabold,
    fontSize: 12,
    letterSpacing: 1,
    color: '#1A1A1A',
    backgroundColor: '#E8B04B',
  },
  card: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    width: 240,
    transform: [{ rotate: '-3deg' }],
  },
  result: { position: 'absolute', left: 0, right: 0, top: 520, alignItems: 'center', gap: 6 },
  resultName: {
    fontFamily: fontFamilies.displayHeavy,
    fontSize: 22,
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  resultInfo: { fontFamily: fontFamilies.semibold, fontSize: 14, color: '#CFC6B6' },
  worth: {
    marginTop: 6,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  worthText: { fontFamily: fontFamilies.bold, fontSize: 12, color: '#D7DAE0' },
  pair: { flexDirection: 'row', gap: 10 },
  second: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  outline: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  plate: { backgroundColor: 'rgba(255,255,255,0.1)' },
  off: { opacity: 0.6 },
  secondText: { fontFamily: fontFamilies.extrabold, fontSize: 15, color: '#FFFFFF' },
}));
