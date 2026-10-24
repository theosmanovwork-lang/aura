import { Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { PressableScale } from '../../motion/PressableScale';

export type TradeMode = 'auctions' | 'market';

type TradeTabsProps = Readonly<{
  mode: TradeMode;
  onChange: (mode: TradeMode) => void;
  lotCount: number;
}>;

const MODES: readonly TradeMode[] = ['auctions', 'market'];

/** «Аукционы | Маркетплейс», the line under it and the sort button. */
export function TradeTabs({ mode, onChange, lotCount }: TradeTabsProps) {
  const styles = useStyles();
  const colors = useColors();
  const t = ru.community;
  return (
    <>
      <View accessibilityRole="tablist" accessibilityLabel={t.tabs.label} style={styles.tabs}>
        {MODES.map((id) => {
          const active = id === mode;
          return (
            <PressableScale
              key={id}
              testID={`trade-tab-${id}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.tabs[id]}</Text>
            </PressableScale>
          );
        })}
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{t.meta[mode].replace('{n}', String(lotCount))}</Text>
        <PressableScale
          disabled
          accessibilityState={{ disabled: true }}
          accessibilityRole="button"
          accessibilityLabel={t.sort[mode]}
          style={styles.sort}
        >
          <Text style={styles.sortText}>{t.sort[mode]}</Text>
          <Glyph name="chevronDown" size={14} color={colors.text} strokeWidth={2.4} />
        </PressableScale>
      </View>
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  tabs: {
    flexDirection: 'row',
    padding: 4,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },
  tab: { flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.textSecondary },
  tabTextActive: { color: colors.onPrimary },
  meta: { height: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.textMuted },
  sort: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
}));
