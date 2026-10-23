import { render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { seed } from '../../src/data/seed';
import { ru } from '../../src/i18n/ru';
import { placePrediction } from '../../src/features/predictions/predictionService';
import { ensureWelcomeBonus } from '../../src/features/wallet/walletService';
import { TrendDetailScreen } from '../../src/features/trends/TrendDetailScreen';
import { WalletScreen } from '../../src/features/wallet/WalletScreen';

const NOW = Date.UTC(2027, 0, 1);

describe('predictions on the screens', () => {
  test('the wave screen has the "support this wave" block', async () => {
    await render(
      <RepositoriesProvider repositories={createMemoryRepositories(seed)}>
        <TrendDetailScreen trendId="trend-neirokot" now={() => NOW} />
      </RepositoriesProvider>,
    );

    expect(await screen.findByText(ru.predictions.title)).toBeTruthy();
    expect(await screen.findByTestId('place-prediction')).toBeTruthy();
  });

  test('the sparks screen lists the predictions between the balance and the history', async () => {
    const repos = createMemoryRepositories(seed);
    await ensureWelcomeBonus(repos, 'user-me', NOW);
    await placePrediction(repos, {
      userId: 'user-me',
      trendId: 'trend-neirokot',
      stake: 50,
      now: NOW,
    });

    await render(
      <RepositoriesProvider repositories={repos}>
        <WalletScreen now={() => NOW} />
      </RepositoriesProvider>,
    );

    expect(await screen.findByText(ru.predictions.myTitle)).toBeTruthy();
    expect(await screen.findByText(`50 аур · ${ru.predictions.status.open}`)).toBeTruthy();
    expect(screen.getByText(ru.wallet.kinds.prediction_stake)).toBeTruthy();
  });
});
