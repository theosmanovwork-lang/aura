import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

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

export type SettingsTarget = 'notifications' | 'onboarding' | 'states';

type Item = Readonly<{
  key: keyof typeof ru.settings.items;
  kind?: 'switch' | 'danger';
  /** Where the line leads; a line without a target is only drawn. */
  target?: SettingsTarget;
}>;

const GROUPS: readonly Readonly<{
  key: keyof typeof ru.settings.groups;
  items: readonly Item[];
}>[] = [
  { key: 'account', items: [{ key: 'predictions' }] },
  {
    key: 'content',
    items: [
      { key: 'notifications', target: 'notifications' },
      { key: 'darkMode', kind: 'switch' },
    ],
  },
  { key: 'help', items: [{ key: 'support' }, { key: 'legal' }] },
  { key: 'login', items: [{ key: 'logout', kind: 'danger' }] },
  {
    key: 'mockups',
    items: [
      { key: 'onboarding', target: 'onboarding' },
      { key: 'states', target: 'states' },
    ],
  },
];

type RowProps = Readonly<{ item: Item; onOpen?: (target: SettingsTarget) => void }>;

function Row({ item, onOpen }: RowProps) {
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
      accessibilityState={{ disabled: !item.target }}
      disabled={!item.target}
      onPress={item.target ? () => onOpen?.(item.target as SettingsTarget) : undefined}
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
type SettingsScreenProps = Readonly<{ onOpen?: (target: SettingsTarget) => void }>;

export function SettingsScreen({ onOpen }: SettingsScreenProps) {
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
            <Row key={item.key} item={item} onOpen={onOpen} />
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
  },
  label: { ...typography.body, color: colors.text, flexShrink: 1 },
  danger: { color: colors.destructive },
}));
