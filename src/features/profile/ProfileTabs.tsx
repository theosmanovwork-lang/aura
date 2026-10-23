import { Pressable, Text, View } from 'react-native';

import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';

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
          <Pressable
            key={key}
            testID={`profile-tab-${key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: open }}
            onPress={() => onSelect(key)}
            style={styles.tab}
          >
            <Text style={[styles.label, open && styles.labelOpen]}>
              {ru.screens.profile.tabs[key]}
            </Text>
            <View style={[styles.bar, open && styles.barOpen]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: 'row',
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'flex-end', gap: 9 },
  label: { fontFamily: fontFamilies.extrabold, fontSize: 14, color: colors.textMuted },
  labelOpen: { color: colors.text },
  bar: { width: 40, height: 3, borderRadius: 2, backgroundColor: 'transparent' },
  barOpen: { backgroundColor: colors.text },
}));
