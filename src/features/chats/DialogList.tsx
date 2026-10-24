import { Pressable, Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import type { DemoDialog } from '../../data/seed/demoCommunity';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles } from '../../theme';

type DialogListProps = Readonly<{
  dialogs: readonly DemoDialog[];
  onOpen: (id: string) => void;
}>;

/** The conversations in one white block, separated by thin lines; unread ones are bold with a count. */
export function DialogList({ dialogs, onOpen }: DialogListProps) {
  const styles = useStyles();
  return (
    <View style={styles.list}>
      {dialogs.map((dialog, index) => {
        const fresh = dialog.unread > 0;
        return (
          <Pressable
            key={dialog.id}
            testID={`dialog-${dialog.id}`}
            accessibilityRole="button"
            accessibilityLabel={`${dialog.name}, ${dialog.message}${fresh ? `, ${ru.chats.unread.replace('{n}', String(dialog.unread))}` : ''}`}
            onPress={() => onOpen(dialog.id)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.avatar}>
              <Avatar initial={dialog.initial} tone={dialog.tone} size={52} square />
              {dialog.online ? <View style={styles.online} /> : null}
            </View>
            <View style={styles.texts}>
              <View style={styles.top}>
                <Text numberOfLines={1} style={styles.name}>
                  {dialog.name}
                </Text>
                <Text style={[styles.time, fresh && styles.timeFresh]}>{dialog.time}</Text>
              </View>
              <View style={styles.top}>
                <Text numberOfLines={1} style={[styles.message, fresh && styles.messageFresh]}>
                  {dialog.message}
                </Text>
                {fresh ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{dialog.unread}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  list: { borderRadius: 20, overflow: 'hidden', backgroundColor: colors.surface },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  pressed: { backgroundColor: colors.hover },
  avatar: { width: 52, height: 52 },
  online: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: colors.surface,
    backgroundColor: colors.online,
  },
  texts: { flex: 1, minWidth: 0, gap: 3 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flexShrink: 1, fontFamily: fontFamilies.bold, fontSize: 15, color: colors.text },
  time: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.textMuted },
  timeFresh: { color: colors.textSecondary },
  message: { flex: 1, fontFamily: fontFamilies.medium, fontSize: 14, color: colors.textMuted },
  messageFresh: { fontFamily: fontFamilies.semibold, color: colors.text },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  badgeText: { fontFamily: fontFamilies.bold, fontSize: 12, color: colors.onPrimary },
}));
