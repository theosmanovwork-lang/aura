import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { useTabBarInset } from '../../components/useTabBarInset';
import { ru } from '../../i18n/ru';
import {
  MIN_TOUCH_TARGET,
  iconSizes,
  makeStyles,
  spacing,
  typography,
  useColors,
} from '../../theme';

type Item = Readonly<{ key: keyof typeof ru.settings.items; kind?: 'switch' | 'danger' }>;

const GROUPS: readonly Readonly<{
  key: keyof typeof ru.settings.groups;
  items: readonly Item[];
}>[] = [
  { key: 'account', items: [{ key: 'predictions' }] },
  { key: 'content', items: [{ key: 'notifications' }, { key: 'darkMode', kind: 'switch' }] },
  { key: 'help', items: [{ key: 'support' }, { key: 'legal' }] },
  { key: 'login', items: [{ key: 'logout', kind: 'danger' }] },
];

function Row({ item }: Readonly<{ item: Item }>) {
  const styles = useStyles();
  const colors = useColors();
  const label = ru.settings.items[item.key];
  if (item.kind === 'switch') {
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          accessibilityLabel={label}
          accessibilityRole="switch"
          accessibilityState={{ checked: true, disabled: true }}
          value
          disabled
        />
      </View>
    );
  }
  const danger = item.kind === 'danger';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: true }}
      disabled
      style={styles.row}
    >
      <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
      {danger ? null : (
        <Icon name="chevron-forward" size={iconSizes.sm} color={colors.iconInactive} />
      )}
    </Pressable>
  );
}

/** The settings list of the reference; every line is drawn, none works yet. */
export function SettingsScreen() {
  const styles = useStyles();
  const bottomInset = useTabBarInset();
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
    >
      <Text style={styles.soon}>{ru.settings.soon}</Text>
      {GROUPS.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.groupTitle} accessibilityRole="header">
            {ru.settings.groups[group.key]}
          </Text>
          {group.items.map((item) => (
            <Row key={item.key} item={item} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.gutter, gap: spacing.md },
  soon: { ...typography.caption, color: colors.textMuted },
  group: { gap: spacing.xs },
  groupTitle: { ...typography.labelCaps, color: colors.textMuted, paddingVertical: spacing.sm },
  row: {
    minHeight: MIN_TOUCH_TARGET + spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: { ...typography.body, color: colors.text, flexShrink: 1 },
  danger: { color: colors.destructive },
}));
