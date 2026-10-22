import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import {
  placePrediction,
  PREDICTION_DURATION_MS,
} from '../../src/features/predictions/predictionService';
import { loadWallet, WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';

describe('loadWallet and predictions', () => {
  test('closes the predictions that are due, so the balance already includes the payout', async () => {
    const repos = createMemoryRepositories(seed);
    await loadWallet(repos, 'user-me', 0);
    await placePrediction(repos, {
      userId: 'user-me',
      trendId: 'trend-neirokot',
      stake: 50,
      now: 100,
    });
    const video = (await repos.videos.getById('video-1'))!;
    await repos.videos.update('video-1', { viewCount: video.viewCount + 100 });

    const wallet = await loadWallet(repos, 'user-me', 100 + PREDICTION_DURATION_MS);

    expect(wallet.balance).toBe(WELCOME_BONUS_POINTS - 50 + 100);
    expect(wallet.entries.map((e) => e.kind)).toEqual([
      'prediction_payout',
      'prediction_stake',
      'welcome_bonus',
    ]);
  });

  test('still shows the balance when a prediction cannot be closed right now', async () => {
    const repos = createMemoryRepositories(seed);
    await loadWallet(repos, 'user-me', 0);
    await placePrediction(repos, {
      userId: 'user-me',
      trendId: 'trend-neirokot',
      stake: 50,
      now: 100,
    });
    jest.spyOn(repos.predictions, 'updateStatus').mockRejectedValue(new Error('disk error'));

    const wallet = await loadWallet(repos, 'user-me', 100 + PREDICTION_DURATION_MS);

    expect(wallet.balance).toBeGreaterThan(0);
    expect(wallet.entries.length).toBeGreaterThan(0);
  });
});
