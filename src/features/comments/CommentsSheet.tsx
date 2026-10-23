import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Icon } from '../../components/Icon';
import { Message } from '../../components/Message';
import { useBottomInset } from '../../components/useBottomInset';
import { useRepositories } from '../../data/RepositoriesProvider';
import { CommentRuleError } from '../../domain/comment';
import { countLabel } from '../../i18n/plural';
import { ru } from '../../i18n/ru';
import { colors, iconSizes, MIN_TOUCH_TARGET, radii, spacing, typography } from '../../theme';
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
          <Text style={styles.title} accessibilityRole="header">
            {state.status === 'ready' && state.data.length > 0
              ? `${ru.comments.title} · ${countLabel(state.data.length, ru.comments.forms)}`
              : ru.comments.title}
          </Text>
          <Pressable
            testID="comments-close"
            accessibilityRole="button"
            accessibilityLabel={ru.comments.close}
            onPress={onClose}
            hitSlop={8}
            style={styles.close}
          >
            <Icon name="close" size={iconSizes.md} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.list}>
          <CommentList state={state} reload={reload} now={openedAt} />
        </View>
        <CommentInput sending={sending} error={error} onSend={send} />
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

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    height: SHEET_HEIGHT,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.panel,
    borderTopRightRadius: radii.panel,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.fieldBorder,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.titleSmall, color: colors.text },
  close: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { flex: 1 },
});
