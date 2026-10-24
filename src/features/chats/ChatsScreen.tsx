import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Glyph } from '../../components/Glyph';
import { useTabBarInset } from '../../components/useTabBarInset';
import { useTabScreenContent } from '../../components/useTabScreenContent';
import { demoDialogs } from '../../data/seed/demoCommunity';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { GlobalChatCard, MyClanCard } from './ChatCards';
import { DialogList } from './DialogList';
import { PressableScale } from '../../motion/PressableScale';

/** Chats of the design: the global chat, the clan invitation and the conversations (made up for now). */
type ChatsScreenProps = Readonly<{
  onOpenDialog?: (dialogId: string) => void;
  onOpenClan?: (clanId: string) => void;
}>;

export function ChatsScreen({ onOpenDialog, onOpenClan }: ChatsScreenProps) {
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
          <PressableScale
            disabled
            accessibilityState={{ disabled: true }}
            accessibilityRole="button"
            accessibilityLabel={ru.chats.search}
            style={styles.round}
          >
            <Glyph name="search" size={20} color={colors.text} strokeWidth={2.2} />
          </PressableScale>
        </View>
        <GlobalChatCard />
        <MyClanCard onOpen={onOpenClan} />
        <View style={styles.sectionHead}>
          <View style={styles.sectionTexts}>
            <Text accessibilityRole="header" style={styles.section}>
              {ru.chats.messages}
            </Text>
            <Text style={styles.sectionSub}>
              {ru.chats.messagesSub.replace('{n}', String(fresh))}
            </Text>
          </View>
        </View>
        <DialogList
          dialogs={dialogs}
          onOpen={(id) => {
            setRead((set) => new Set(set).add(id));
            onOpenDialog?.(id);
          }}
        />
      </ScrollView>
      <PressableScale
        disabled
        accessibilityState={{ disabled: true }}
        testID="chat-compose"
        accessibilityRole="button"
        accessibilityLabel={ru.chats.compose}
        style={[styles.fab, { bottom: bottom + 8 }]}
      >
        <Glyph name="pen" size={26} color={colors.onPrimary} strokeWidth={2.2} />
      </PressableScale>
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
    fontFamily: fontFamilies.bold,
    fontSize: 30,
    letterSpacing: -0.9,
    color: colors.text,
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sectionHead: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionTexts: { gap: 2 },
  section: { fontFamily: fontFamilies.bold, fontSize: 20, letterSpacing: -0.3, color: colors.text },
  sectionSub: { fontFamily: fontFamilies.medium, fontSize: 12, color: colors.textMuted },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 18,
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
