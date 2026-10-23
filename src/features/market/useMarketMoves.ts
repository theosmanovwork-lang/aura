import { useCallback, useRef, useState } from 'react';

import { InsufficientPointsError, type Repositories } from '../../data/repositories';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { formatPoints } from '../../i18n/format';
import { ru } from '../../i18n/ru';
import { InvestmentRuleError } from '../../domain/investment';
import { investInVideo, takeFromVideo } from '../investments/investmentService';

export type PadMode = 'invest' | 'take' | null;
export type Notice = Readonly<{ kind: 'done' | 'error'; text: string }>;

const messageOf = (error: unknown): string => {
  if (error instanceof InsufficientPointsError) return ru.market.errors.notEnough;
  if (error instanceof InvestmentRuleError) {
    if (error.code === 'over_cap') return ru.market.errors.cap;
    if (error.code === 'too_much') return ru.market.errors.tooMuch;
  }
  return ru.market.errors.generic;
};

/** The pad that is open, the move being saved and the notice after it; moves reload the page. */
export function useMarketMoves(
  repos: Repositories,
  videoId: string,
  now: () => number,
  reload: () => void,
) {
  const [mode, setMode] = useState<PadMode>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  // State updates after a render; this flag stops a second tap in the same frame.
  const busy = useRef(false);

  const confirm = useCallback(
    async (amount: number) => {
      if (busy.current) return;
      busy.current = true;
      const input = { userId: CURRENT_USER_ID, videoId, amount, now: now() };
      const taking = mode === 'take';
      setPending(true);
      try {
        if (taking) await takeFromVideo(repos, input);
        else await investInVideo(repos, input);
        const template = taking ? ru.market.done.taken : ru.market.done.invested;
        setNotice({ kind: 'done', text: template.replace('{amount}', formatPoints(amount)) });
        setMode(null);
        reload();
      } catch (error) {
        setNotice({ kind: 'error', text: messageOf(error) });
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [repos, videoId, now, mode, reload],
  );

  const open = useCallback((next: 'invest' | 'take') => {
    setNotice(null);
    setMode(next);
  }, []);
  const close = useCallback(() => setMode(null), []);
  const refuse = useCallback((text: string) => setNotice({ kind: 'error', text }), []);

  return { mode, pending, notice, confirm, open, close, refuse };
}
