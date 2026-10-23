import { createMemoryRepositories } from '../../src/data/memory';
import { CURRENT_USER_ID, seed } from '../../src/data/seed';
import { investInVideo, takeFromVideo } from '../../src/features/investments/investmentService';
import { loadProfile } from '../../src/features/profile/profileService';
import { ensureWelcomeBonus } from '../../src/features/wallet/walletService';

const NOW = Date.UTC(2026, 5, 1);

describe('loadProfile', () => {
  test('gives the nickname, the balance and a zero amount in videos at the start', async () => {
    const repos = createMemoryRepositories(seed);

    const profile = await loadProfile(repos, CURRENT_USER_ID, NOW);

    expect(profile).toMatchObject({ nickname: 'mira.wav', balance: 1000, inInvestments: 0 });
  });

  test('counts what is in videos now, and less once some of it is taken back', async () => {
    const repos = createMemoryRepositories(seed);
    await ensureWelcomeBonus(repos, CURRENT_USER_ID, NOW);
    await investInVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-1',
      amount: 200,
      now: NOW,
    });
    expect((await loadProfile(repos, CURRENT_USER_ID, NOW)).inInvestments).toBe(200);

    await takeFromVideo(repos, {
      userId: CURRENT_USER_ID,
      videoId: 'video-1',
      amount: 100,
      now: NOW,
    });

    expect((await loadProfile(repos, CURRENT_USER_ID, NOW)).inInvestments).toBeLessThan(200);
  });

  test('the rank is the place among the authors by the price of their videos', async () => {
    const repos = createMemoryRepositories(seed);

    expect((await loadProfile(repos, CURRENT_USER_ID, NOW)).rank).toBe(3);
    expect((await loadProfile(repos, 'user-eter', NOW).catch(() => null))?.rank).toBe(1);
  });

  test('the rank is empty for somebody without a published video', async () => {
    const repos = createMemoryRepositories({ ...seed, videos: [] });

    expect((await loadProfile(repos, CURRENT_USER_ID, NOW)).rank).toBeNull();
  });

  test('an unknown user is an error, not an empty profile', async () => {
    const repos = createMemoryRepositories(seed);

    await expect(loadProfile(repos, 'nobody', NOW)).rejects.toThrow();
  });
});
