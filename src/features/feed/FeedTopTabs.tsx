import { Text, View } from 'react-native';

import { SilverView } from '../../components/SilverView';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';
import { PressableScale } from '../../motion/PressableScale';

/** «Подписки | Рекомендации» drawn like the design; both are switched off until feeds exist. */
export function FeedTopTabs() {
  const styles = useStyles();
  return (
    <View accessibilityRole="tablist" style={styles.tabs}>
      <PressableScale
        accessibilityRole="tab"
        accessibilityLabel={ru.feed.tabs.following}
        accessibilityState={{ disabled: true, selected: false }}
        disabled
        style={styles.tab}
      >
        <Text style={[styles.label, styles.idle]}>{ru.feed.tabs.following}</Text>
      </PressableScale>
      <PressableScale
        accessibilityRole="tab"
        accessibilityLabel={ru.feed.tabs.forYou}
        accessibilityState={{ disabled: true, selected: true }}
        disabled
        style={styles.tab}
      >
        <Text style={styles.label}>{ru.feed.tabs.forYou}</Text>
        <SilverView style={styles.indicator} />
      </PressableScale>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  tabs: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  tab: { minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontFamily: fontFamilies.bold, fontSize: 15, color: colors.onVideo },
  idle: { color: '#D6D0E2' },
  indicator: { width: 18, height: 3, borderRadius: 2 },
}));
