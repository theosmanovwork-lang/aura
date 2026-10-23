import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '../../components/Icon';
import { RevealLabel } from '../../components/RevealLabel';
import { ru } from '../../i18n/ru';
import {
  MIN_TOUCH_TARGET,
  iconSizes,
  makeStyles,
  radii,
  spacing,
  typography,
  useColors,
} from '../../theme';

export const PROFILE_TAB_KEYS = ['videos', 'investments', 'reposts'] as const;
export type ProfileTabKey = (typeof PROFILE_TAB_KEYS)[number];

const ICONS: Record<ProfileTabKey, Readonly<{ idle: IconName; open: IconName }>> = {
  videos: { idle: 'grid-outline', open: 'grid' },
  investments: { idle: 'stats-chart-outline', open: 'stats-chart' },
  reposts: { idle: 'repeat-outline', open: 'repeat' },
};

type ProfileTabsProps = Readonly<{
  selected: ProfileTabKey;
  onSelect: (key: ProfileTabKey) => void;
}>;

/** Small icons like on an Instagram profile; the open one shows its name beside the icon. */
export function ProfileTabs({ selected, onSelect }: ProfileTabsProps) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View accessibilityRole="tablist" style={styles.tabs}>
      {PROFILE_TAB_KEYS.map((key) => {
        const open = key === selected;
        const name = ru.screens.profile.tabs[key];
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={name}
            accessibilityState={{ selected: open }}
            onPress={() => onSelect(key)}
            style={[styles.tab, open && styles.tabOpen]}
          >
            <Icon
              name={open ? ICONS[key].open : ICONS[key].idle}
              size={iconSizes.sm}
              color={open ? colors.text : colors.iconInactive}
            />
            {open ? (
              <RevealLabel testID={`profile-tab-label-${key}`} text={name} style={styles.label} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabOpen: { borderBottomColor: colors.text, borderRadius: radii.control },
  label: { ...typography.titleSmall, color: colors.text },
}));
