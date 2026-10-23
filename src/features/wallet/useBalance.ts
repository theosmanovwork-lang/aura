import { useCallback } from 'react';

import { useRepositories } from '../../data/RepositoriesProvider';
import { CURRENT_USER_ID } from '../../data/seed'; // temporary: a real profile arrives with onboarding
import { useLoad } from '../useLoad';
import { loadWallet } from './walletService';

/** The user's balance in Aura, read from the ledger; `null` while it loads or if it could not be read. */
export function useBalance(refreshKey = 0): number | null {
  const repos = useRepositories();
  const load = useCallback(() => loadWallet(repos, CURRENT_USER_ID, Date.now()), [repos]);
  const { state } = useLoad(load, refreshKey);
  return state.status === 'ready' ? state.data.balance : null;
}
