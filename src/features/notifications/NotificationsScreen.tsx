import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Glyph, type GlyphName } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { useTopInset } from '../../components/useTopInset';
import {
  demoNotifications,
  NOTICE_FILTER_OF,
  type DemoNotice,
  type NoticeFilter,
} from '../../data/seed/demoNotifications';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { PressableScale } from '../../motion/PressableScale';
import { Entrance } from '../../motion/Entrance';

const FILTERS: readonly NoticeFilter[] = ['all', 'auction', 'invest', 'social'];
const GROUPS = ['today', 'yesterday'] as const;
const ICONS: Readonly<Record<Exclude<DemoNotice['kind'], 'letter'>, GlyphName>> = {
  outbid: 'gavel',
  up: 'trend',
  chest: 'chest',
  sold: 'check',
};

type NotificationsScreenProps = Readonly<{
  onBack: () => void;
  onOpen?: (notice: DemoNotice) => void;
}>;

/** The list of news: filters on top, «today» and «yesterday» groups, red dots on unread ones. Read state stays on the screen. */
export function NotificationsScreen({ onBack, onOpen }: NotificationsScreenProps) {
  const styles = useStyles();
  const colors = useColors();
  const top = useTopInset();
  const t = ru.notifications;
  const [filter, setFilter] = useState<NoticeFilter>('all');
  const [readAll, setReadAll] = useState(false);
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());

  const visible = demoNotifications.filter(
    (n) => filter === 'all' || NOTICE_FILTER_OF[n.kind] === filter,
  );
  return (
    <ScrollView
      testID="notifications-scroll"
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: top }]}
    >
      <View style={styles.header}>
        <PressableScale
          testID="screen-back"
          accessibilityRole="button"
          accessibilityLabel={t.back}
          onPress={onBack}
          style={styles.round}
        >
          <Glyph name="chevronLeft" size={20} color={colors.text} strokeWidth={2.4} />
        </PressableScale>
        <Text accessibilityRole="header" style={styles.title}>
          {t.title}
        </Text>
        <PressableScale
          testID="read-all"
          accessibilityRole="button"
          onPress={() => setReadAll(true)}
          style={styles.readAll}
        >
          <Text style={styles.readAllText}>{t.readAll}</Text>
        </PressableScale>
      </View>

      <View accessibilityRole="tablist" accessibilityLabel={t.filtersLabel} style={styles.filters}>
        {FILTERS.map((key) => (
          <PressableScale
            key={key}
            testID={`filter-${key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: key === filter }}
            onPress={() => setFilter(key)}
            style={[styles.filter, key === filter && styles.filterOn]}
          >
            <Text style={[styles.filterText, key === filter && styles.filterTextOn]}>
              {t.filters[key]}
            </Text>
          </PressableScale>
        ))}
      </View>

      {visible.length === 0 ? <Text style={styles.empty}>{t.empty}</Text> : null}
      {GROUPS.map((group) => {
        const items = visible.filter((n) => n.group === group);
        if (items.length === 0) return null;
        return (
          <View key={group} style={styles.group}>
            <Text style={styles.groupTitle}>{t.groups[group]}</Text>
            <View style={styles.list}>
              {items.map((notice, index) => (
                <Entrance key={notice.id} index={index}>
                  <Row
                    notice={notice}
                    unread={notice.unread && !readAll && !seen.has(notice.id)}
                    onPress={() => {
                      setSeen((set) => new Set(set).add(notice.id));
                      onOpen?.(notice);
                    }}
                  />
                </Entrance>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

type RowProps = Readonly<{ notice: DemoNotice; unread: boolean; onPress: () => void }>;

function Row({ notice, unread, onPress }: RowProps) {
  const styles = useStyles();
  const colors = useColors();
  const kind = notice.kind;
  const iconColors = {
    outbid: [colors.negativeSoft, colors.destructive],
    up: [colors.positiveSoft, colors.positive],
    chest: [colors.surfaceMuted, colors.textSecondary],
    sold: [colors.surfaceMuted, colors.textSecondary],
  } as const;
  return (
    <PressableScale
      testID={`notice-${notice.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${notice.who} ${notice.text}, ${notice.time}${unread ? `, ${ru.notifications.unread}` : ''}`}
      onPress={onPress}
      style={[styles.row, unread && styles.rowUnread]}
    >
      {kind === 'letter' ? (
        <Avatar initial={notice.letter ?? ''} tone={notice.tone ?? 'ink'} size={40} square />
      ) : (
        <View style={[styles.icon, { backgroundColor: iconColors[kind][0] }]}>
          <Glyph name={ICONS[kind]} size={20} color={iconColors[kind][1]} strokeWidth={2.2} />
        </View>
      )}
      <View style={styles.texts}>
        <Text style={styles.text}>
          <Text style={styles.who}>{notice.who}</Text>
          {` ${notice.text}`}
        </Text>
        <Text style={styles.time}>{notice.time}</Text>
        {notice.action ? (
          notice.silverAction ? (
            <SilverView style={styles.action}>
              <Text style={[styles.actionText, styles.actionInk]}>{notice.action}</Text>
            </SilverView>
          ) : (
            <View style={[styles.action, styles.actionDark]}>
              <Text style={styles.actionText}>{notice.action}</Text>
            </View>
          )
        ) : null}
      </View>
      {unread ? <View testID={`unread-${notice.id}`} style={styles.dot} /> : null}
    </PressableScale>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  header: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    flex: 1,
    fontFamily: fontFamilies.bold,
    fontSize: 22,
    letterSpacing: -0.6,
    color: colors.text,
  },
  readAll: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  readAllText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  filters: { flexDirection: 'row', gap: 8 },
  filter: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  filterOn: { backgroundColor: colors.primary },
  filterText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.text },
  filterTextOn: { color: colors.onPrimary },
  empty: {
    paddingVertical: 32,
    textAlign: 'center',
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    color: colors.textMuted,
  },
  group: { marginTop: 8, gap: 8 },
  groupTitle: {
    paddingHorizontal: 4,
    fontFamily: fontFamilies.bold,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  list: { borderRadius: 20, overflow: 'hidden', backgroundColor: colors.surface },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: colors.surface,
  },
  rowUnread: { backgroundColor: colors.surfaceMuted },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, minWidth: 0, gap: 4 },
  text: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 20, color: colors.text },
  who: { fontFamily: fontFamilies.bold },
  time: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.textMuted },
  action: {
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  actionDark: { backgroundColor: colors.primary },
  actionText: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.onPrimary },
  actionInk: { color: '#1A1A1A' },
  dot: { width: 8, height: 8, marginTop: 6, borderRadius: 4, backgroundColor: '#E5483A' },
}));
