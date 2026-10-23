import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { useTabBarInset } from '../../components/useTabBarInset';
import { useTabScreenContent } from '../../components/useTabScreenContent';
import { demoDialogs } from '../../data/seed/demoCommunity';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { ClanCard, GlobalChatCard } from './ChatCards';
import { DialogList } from './DialogList';

/** Chats of the design: the global chat, the clan invitation and the conversations (made up for now). */
type ChatsScreenProps = Readonly<{ onOpenDialog?: (dialogId: string) => void }>;

export function ChatsScreen({ onOpenDialog }: ChatsScreenProps) {
  const styles = useStyles();
  const colors = useColors();
  const content = useTabScreenContent(styles.content);
  const bottom = useTabBarInset();
  // Opening a conversation marks it as read: the only thing a made-up chat can do.
  const [read, setRead] = useState<ReadonlySet<string>>(new Set());
  const dialogs = demoDialogs.map((d) => (read.has(d.id) ? { ...d, unread: 0 } : d));
  const fresh = dialogs.filter((d) => d.unread > 0).length;

  return (
    <View style={styles.page}>
      <ScrollView testID="chats-scroll" contentContainerStyle={content}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            {ru.chats.title}
          </Text>
          <Pressable
            disabled
            accessibilityState={{ disabled: true }}
            accessibilityRole="button"
            accessibilityLabel={ru.chats.search}
            style={styles.round}
          >
            <Glyph name="search" size={20} color={colors.text} strokeWidth={2.2} />
          </Pressable>
        </View>
        <GlobalChatCard />
        <ClanCard />
        <View style={styles.sectionHead}>
          <Text accessibilityRole="header" style={styles.section}>
            {ru.chats.messages}
          </Text>
          {fresh > 0 ? (
            <View style={styles.count}>
              <Text style={styles.countText}>{ru.chats.fresh.replace('{n}', String(fresh))}</Text>
            </View>
          ) : null}
        </View>
        <DialogList
          dialogs={dialogs}
          onOpen={(id) => {
            setRead((set) => new Set(set).add(id));
            onOpenDialog?.(id);
          }}
        />
      </ScrollView>
      <Pressable
        disabled
        accessibilityState={{ disabled: true }}
        testID="chat-compose"
        accessibilityRole="button"
        accessibilityLabel={ru.chats.compose}
        style={[styles.fab, { bottom: bottom + 8 }]}
      >
        <Glyph name="pen" size={26} color={colors.onPrimary} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, gap: 12 },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamilies.extrabold,
    fontSize: 30,
    letterSpacing: -0.9,
    color: colors.text,
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sectionHead: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: { fontFamily: fontFamilies.extrabold, fontSize: 18, color: colors.text },
  count: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  countText: { fontFamily: fontFamilies.extrabold, fontSize: 12, color: colors.textSecondary },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
}));
