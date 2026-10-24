import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuraCoin } from '../../components/AuraIcon';
import { Avatar } from '../../components/Avatar';
import { Glyph } from '../../components/Glyph';
import { SilverView } from '../../components/SilverView';
import { useBottomInset } from '../../components/useBottomInset';
import { useTopInset } from '../../components/useTopInset';
import { demoDialogs } from '../../data/seed/demoCommunity';
import { demoMessages, type DemoMessage } from '../../data/seed/demoPeople';
import { ru } from '../../i18n/ru';
import { fontFamilies, makeStyles, useColors } from '../../theme';
import { RARITY_STYLES } from '../cards/rarity';

type Trade = 'open' | 'accepted' | 'declined';

type DialogScreenProps = Readonly<{
  dialogId: string;
  onBack: () => void;
  onOpenProfile?: (name: string) => void;
}>;

/**
 * One conversation of the design. The messages are made up and what you write stays on the screen
 * only: nothing is sent or saved.
 */
export function DialogScreen({ dialogId, onBack, onOpenProfile }: DialogScreenProps) {
  const styles = useStyles();
  const colors = useColors();
  const top = useTopInset(-6);
  const bottom = useBottomInset();
  const t = ru.dialog;
  const dialog = demoDialogs.find((d) => d.id === dialogId) ?? demoDialogs[0]!;
  const [draft, setDraft] = useState('');
  const [mine, setMine] = useState<readonly string[]>([]);
  const [trade, setTrade] = useState<Trade>('open');
  const ready = draft.trim().length > 0;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMine((list) => [...list, text]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.page}
    >
      <View style={[styles.header, { paddingTop: top }]}>
        <Pressable
          testID="screen-back"
          accessibilityRole="button"
          accessibilityLabel={ru.common.back}
          onPress={onBack}
          style={styles.iconBtn}
        >
          <Glyph name="chevronLeft" size={22} color={colors.text} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          testID="dialog-profile"
          accessibilityRole="button"
          accessibilityLabel={t.openProfile.replace('{name}', dialog.name)}
          onPress={() => onOpenProfile?.(dialog.name)}
          style={styles.who}
        >
          <View>
            <Avatar initial={dialog.initial} tone={dialog.tone} size={40} square={dialog.clan} />
            {dialog.online ? <View style={styles.online} /> : null}
          </View>
          <View style={styles.whoText}>
            <Text style={styles.name}>{dialog.name}</Text>
            {dialog.online ? <Text style={styles.status}>{t.online}</Text> : null}
          </View>
        </Pressable>
        <View accessibilityLabel={t.more} style={styles.iconBtn}>
          <Glyph name="sliders" size={20} color={colors.text} />
        </View>
      </View>

      <ScrollView
        testID="dialog-scroll"
        contentContainerStyle={styles.messages}
        style={styles.list}
      >
        {demoMessages.map((message, index) => (
          <Message
            key={index}
            message={message}
            trade={trade}
            onAccept={() => setTrade('accepted')}
            onDecline={() => setTrade('declined')}
          />
        ))}
        {mine.map((text, index) => (
          <View key={`m${index}`} style={[styles.bubble, styles.out]}>
            <Text style={styles.outText}>{text}</Text>
          </View>
        ))}
        <Text style={styles.seen}>{t.read}</Text>
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: 8 + bottom }]}>
        <View accessibilityLabel={t.attach} style={styles.plus}>
          <Glyph name="plus" size={20} color={colors.text} strokeWidth={2.4} />
        </View>
        <TextInput
          testID="dialog-input"
          accessibilityLabel={t.message}
          placeholder={t.message}
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
          style={styles.input}
        />
        <Pressable
          testID="dialog-send"
          accessibilityRole="button"
          accessibilityLabel={t.send}
          accessibilityState={{ disabled: !ready }}
          disabled={!ready}
          onPress={send}
          style={[styles.send, ready ? styles.sendOn : styles.sendOff]}
        >
          <Glyph
            name="arrowUp"
            size={18}
            color={ready ? colors.onPrimary : colors.textMuted}
            strokeWidth={2.4}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

type MessageProps = Readonly<{
  message: DemoMessage;
  trade: Trade;
  onAccept: () => void;
  onDecline: () => void;
}>;

function Message({ message, trade, onAccept, onDecline }: MessageProps) {
  const styles = useStyles();
  if (message.kind === 'day') return <Text style={styles.day}>{message.text}</Text>;
  if (message.kind === 'in' || message.kind === 'out') {
    const mineText = message.kind === 'out';
    return (
      <View style={[styles.bubble, mineText ? styles.out : styles.inn]}>
        <Text style={mineText ? styles.outText : styles.innText}>{message.text}</Text>
      </View>
    );
  }
  if (message.kind === 'gift') return <Gift title={message.title} caption={message.caption} />;
  return (
    <TradeOffer
      give={message.give}
      take={message.take}
      trade={trade}
      onAccept={onAccept}
      onDecline={onDecline}
    />
  );
}

function Gift({ title, caption }: Readonly<{ title: string; caption: string }>) {
  const styles = useStyles();
  return (
    <SilverView style={styles.gift}>
      <AuraCoin size={36} tone="dark" />
      <View>
        <Text style={styles.giftTitle}>{title}</Text>
        <Text style={styles.giftCaption}>{caption}</Text>
      </View>
    </SilverView>
  );
}

type OfferCard = Readonly<{ rarity: 'rare' | 'common'; no: string; name: string }>;

function MiniCard({ card }: Readonly<{ card: OfferCard }>) {
  const styles = useStyles();
  const r = RARITY_STYLES[card.rarity];
  const label = ru.cards.rarity[card.rarity];
  return (
    <View
      accessible
      accessibilityLabel={ru.dialog.cardSpoken
        .replace('{no}', card.no)
        .replace('{rarity}', label)
        .replace('{name}', card.name)}
      style={[styles.mini, { borderColor: r.slabBorder, backgroundColor: r.art }]}
    >
      <Text style={[styles.miniNo, { color: r.ink }]}>{`${card.no} · ${label}`}</Text>
      <Text style={[styles.miniName, { color: r.ink }]}>{card.name}</Text>
    </View>
  );
}

type TradeOfferProps = Readonly<{
  give: OfferCard;
  take: OfferCard;
  trade: Trade;
  onAccept: () => void;
  onDecline: () => void;
}>;

function TradeOffer({ give, take, trade, onAccept, onDecline }: TradeOfferProps) {
  const styles = useStyles();
  const colors = useColors();
  const t = ru.dialog;
  return (
    <View testID="trade-offer" style={styles.offer}>
      <Text style={styles.offerTitle}>{t.tradeOffer}</Text>
      <View style={styles.offerCards}>
        <MiniCard card={give} />
        <View accessibilityLabel={t.tradeFor} accessible>
          <Glyph name="swap" size={20} color={colors.text} strokeWidth={2.2} />
        </View>
        <MiniCard card={take} />
      </View>
      {trade === 'open' ? (
        <View style={styles.offerButtons}>
          <Pressable
            testID="trade-decline"
            accessibilityRole="button"
            onPress={onDecline}
            style={[styles.offerBtn, styles.decline]}
          >
            <Text style={styles.declineText}>{t.decline}</Text>
          </Pressable>
          <Pressable
            testID="trade-accept"
            accessibilityRole="button"
            onPress={onAccept}
            style={[styles.offerBtn, styles.accept]}
          >
            <Text style={styles.acceptText}>{t.accept}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.offerBtn, styles.result]}>
          <Text testID="trade-result" style={styles.resultText}>
            {trade === 'accepted' ? t.accepted : t.declined}
          </Text>
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  page: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  online: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background,
    backgroundColor: colors.online,
  },
  whoText: { gap: 1 },
  name: { fontFamily: fontFamilies.bold, fontSize: 16, color: colors.text },
  status: { fontFamily: fontFamilies.semibold, fontSize: 12, color: colors.positive },
  list: { flex: 1 },
  messages: { flexGrow: 1, justifyContent: 'flex-end', padding: 12, gap: 8 },
  day: {
    alignSelf: 'center',
    paddingVertical: 4,
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    color: colors.textMuted,
  },
  bubble: { maxWidth: '78%', paddingVertical: 10, paddingHorizontal: 14 },
  inn: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    backgroundColor: colors.surface,
  },
  out: {
    alignSelf: 'flex-end',
    borderRadius: 18,
    borderBottomRightRadius: 6,
    backgroundColor: colors.primary,
  },
  innText: { fontFamily: fontFamilies.medium, fontSize: 15, lineHeight: 21, color: colors.text },
  outText: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.onPrimary,
  },
  seen: {
    alignSelf: 'flex-end',
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    color: colors.textMuted,
  },
  gift: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 18,
  },
  giftTitle: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#1A1A1A' },
  giftCaption: { fontFamily: fontFamilies.semibold, fontSize: 12, color: '#4A4F57' },
  offer: {
    alignSelf: 'flex-start',
    width: 260,
    padding: 10,
    borderRadius: 18,
    gap: 10,
    backgroundColor: colors.surface,
  },
  offerTitle: { fontFamily: fontFamilies.bold, fontSize: 13, color: colors.textMuted },
  offerCards: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mini: {
    flex: 1,
    height: 86,
    padding: 6,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'space-between',
  },
  miniNo: { fontFamily: fontFamilies.bold, fontSize: 10 },
  miniName: { fontFamily: fontFamilies.display, fontSize: 11, lineHeight: 12 },
  offerButtons: { flexDirection: 'row', gap: 8 },
  offerBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decline: { borderWidth: 1.5, borderColor: colors.text, backgroundColor: colors.surface },
  declineText: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.text },
  accept: { backgroundColor: colors.primary },
  acceptText: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.onPrimary },
  result: { backgroundColor: colors.surfaceMuted },
  resultText: { fontFamily: fontFamilies.bold, fontSize: 14, color: colors.textSecondary },
  composer: {
    paddingTop: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plus: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendOn: { backgroundColor: colors.primary },
  sendOff: { backgroundColor: colors.surfaceMuted },
}));
