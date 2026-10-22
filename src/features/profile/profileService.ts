import type { Repositories } from '../../data/repositories';
import { NotFoundError } from '../../data/repositories';
import { loadWallet } from '../wallet/walletService';

export type ProfileView = Readonly<{ nickname: string; balance: number }>;

/** The name and the balance of sparks shown at the top of the profile. */
export async function loadProfile(
  repos: Repositories,
  userId: string,
  now: number,
): Promise<ProfileView> {
  const [user, wallet] = await Promise.all([
    repos.users.getById(userId),
    loadWallet(repos, userId, now),
  ]);
  if (!user) throw new NotFoundError('users', userId);
  return { nickname: user.nickname, balance: wallet.balance };
}
