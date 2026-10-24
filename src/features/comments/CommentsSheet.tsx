import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { Glyph } from '../../components/Glyph';
import { Message } from '../../components/Message';
import { useBottomInset } from '../../components/useBottomInset';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CommentRuleError } from '../../domain/comment';
import { countLabel } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { contentColumn, fontFamilies, makeStyles, spacing, useColors } from '../../theme';
import { useLoad } from '../useLoad';
import { CommentInput } from './CommentInput';
import { CommentRow } from './CommentRow';
import { loadComments, postComment } from './commentService';

const SHEET_HEIGHT = '70%';

type CommentsSheetProps = Readonly<{
  /** The video whose comments are shown; null keeps the sheet closed. */
  videoId: string | null;
  userId: string;
  onClose: () => void;
  /** Tells the feed the new total after the person sent a comment. */
  onCountChange: (videoId: string, count: number) => void;
}>;

/** The bottom sheet with the comments of one video, over the feed. */
export function CommentsSheet({ videoId, userId, onClose, onCountChange }: CommentsSheetProps) {
  // Keep showing the last video while the sheet slides out, so it does not go blank mid-animation.
  const [shownId, setShownId] = useState<string | null>(videoId);
  if (videoId !== null && videoId !== shownId) setShownId(videoId);
  return (
    <Modal
      visible={videoId !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {shownId === null ? null : (
        <SheetBody
          key={shownId}
          videoId={shownId}
          userId={userId}
          onClose={onClose}
          onCountChange={onCountChange}
        />
      )}
    </Modal>
  );
}

type SheetBodyProps = Readonly<Omit<CommentsSheetProps, 'videoId'> & { videoId: string }>;

function SheetBody({ videoId, userId, onClose, onCountChange }: SheetBodyProps) {
  const styles = useStyles();
  const colors = useColors();
  const repos = useRepositories();
  const bottomInset = useBottomInset();
  const [refreshKey, setRefreshKey] = useState(0);
  // The opening moment: times are shown relative to it (a fresh comment reads «только что»).
  const [openedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  // A second tap can arrive before `sending` has re-rendered, so guard with a ref as well.
  const sendingNow = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => loadComments(repos, videoId), [repos, videoId]);
  const { state, reload } = useLoad(load, refreshKey);
  const loadMe = useCallback(
    async () => (await repos.users.getById(userId).catch(() => null))?.nickname ?? '',
    [repos, userId],
  );
  const { state: me } = useLoad(loadMe);
  const initial = me.status === 'ready' ? me.data.slice(0, 1).toUpperCase() : '';

  const send = async (text: string): Promise<boolean> => {
    if (sendingNow.current) return false;
    sendingNow.current = true;
    setError(null);
    setSending(true);
    try {
      await postComment(repos, userId, videoId, text, Date.now());
    } catch (failure) {
      setError(
        failure instanceof CommentRuleError
          ? ru.comments.errors[failure.code]
          : ru.comments.errors.other,
      );
      return false;
    } finally {
      sendingNow.current = false;
      setSending(false);
    }
    setRefreshKey((n) => n + 1);
    const counts = await repos.comments.countByVideo([videoId]).catch(() => null);
    if (counts) onCountChange(videoId, counts[videoId] ?? 0);
    return true;
  };

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable
        testID="comments-backdrop"
        accessibilityRole="button"
        accessibilityLabel={ru.comments.close}
        accessible={false}
        importantForAccessibility="no"
        onPress={onClose}
        style={styles.backdrop}
      />
      <View testID="comments-sheet" style={[styles.sheet, { paddingBottom: bottomInset }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.close} />
          <Text style={styles.title} accessibilityRole="header">
            {state.status === 'ready' && state.data.length > 0
              ? countLabel(state.data.length, ru.comments.forms)
              : ru.comments.title}
          </Text>
          <Pressable
            testID="comments-close"
            accessibilityRole="button"
            accessibilityLabel={ru.comments.close}
            onPress={onClose}
            hitSlop={8}
            style={[styles.close, styles.closeBtn]}
          >
            <Glyph name="close" size={16} color={colors.text} strokeWidth={2.4} />
          </Pressable>
        </View>
        <View style={styles.list}>
          <CommentList state={state} reload={reload} now={openedAt} />
        </View>
        <CommentInput sending={sending} error={error} initial={initial} onSend={send} />
      </View>
    </KeyboardAvoidingView>
  );
}

type CommentListProps = Readonly<{
  state: ReturnType<typeof useLoad<Awaited<ReturnType<typeof loadComments>>>>['state'];
  reload: () => void;
  now: number;
}>;

function CommentList({ state, reload, now }: CommentListProps) {
  if (state.status === 'loading') return <Message text={ru.comments.loading} />;
  if (state.status === 'error') {
    return <Message text={ru.comments.error} action={{ label: ru.comments.retry, run: reload }} />;
  }
  if (state.data.length === 0) return <Message text={ru.comments.empty} />;
  return (
    <FlatList
      testID="comments-list"
      data={state.data}
      keyExtractor={(view) => view.comment.id}
      renderItem={({ item }) => <CommentRow view={item} now={now} />}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const useStyles = makeStyles((colors) => ({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    ...contentColumn,
    height: SHEET_HEIGHT,
    paddingHorizontal: spacing.gutter,
    paddingTop: 8,
    gap: 8,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D9D2C3',
  },
  header: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.text },
  close: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { borderRadius: 12, backgroundColor: colors.surfaceMuted },
  list: { flex: 1 },
}));
