import { Text, View } from 'react-native';

import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';
import { PressableScale } from '../../motion/PressableScale';

export const PROFILE_TAB_KEYS = ['posts', 'investments', 'reposts'] as const;
export type ProfileTabKey = (typeof PROFILE_TAB_KEYS)[number];

type ProfileTabsProps = Readonly<{
  selected: ProfileTabKey;
  onSelect: (key: ProfileTabKey) => void;
}>;

/** «Посты | Вложения | Репосты»: the open one is dark with a bar under it. */
export function ProfileTabs({ selected, onSelect }: ProfileTabsProps) {
  const styles = useStyles();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={ru.screens.profile.tabsLabel}
      style={styles.row}
    >
      {PROFILE_TAB_KEYS.map((key) => {
        const open = key === selected;
        return (
          <PressableScale
            key={key}
            testID={`profile-tab-${key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: open }}
            onPress={() => onSelect(key)}
            style={[styles.tab, open && styles.tabOpen]}
          >
            <Text style={[styles.label, open && styles.labelOpen]}>
              {ru.screens.profile.tabs[key]}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', gap: 6, marginTop: 4 },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  tabOpen: { backgroundColor: colors.primary },
  label: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.textSecondary },
  labelOpen: { color: colors.onPrimary },
}));
