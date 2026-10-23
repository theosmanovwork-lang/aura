import type { Repositories } from '../../data/repositories';
import { NotFoundError } from '../../data/repositories';
import { rankAuthors } from '../../domain/ratings';
import { loadWallet } from '../wallet/walletService';

export type ProfileView = Readonly<{
  nickname: string;
  balance: number;
  /** Aura that is in videos right now (put in and not taken back). */
  inInvestments: number;
  /** Place among the authors by the price of their videos; null if the user has no published video. */
  rank: number | null;
}>;

/** The name, the balance and the numbers shown at the top of the profile. */
export async function loadProfile(
  repos: Repositories,
  userId: string,
  now: number,
): Promise<ProfileView> {
  const [user, wallet, positions, videos] = await Promise.all([
    repos.users.getById(userId),
    loadWallet(repos, userId, now),
    repos.investments.listByUser(userId),
    repos.videos.listPublished(),
  ]);
  if (!user) throw new NotFoundError('users', userId);
  const place = rankAuthors(videos).findIndex((author) => author.authorId === userId);
  return {
    nickname: user.nickname,
    balance: wallet.balance,
    inInvestments: positions.reduce((sum, position) => sum + position.invested, 0),
    rank: place === -1 ? null : place + 1,
  };
}
