import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { RepositoriesProvider } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { makeEntry } from '../../src/data/testing/fixtures';
import { seed } from '../../src/data/seed';
import { formatPoints } from '../../src/i18n/format';
import { ru } from '../../src/i18n/ru';
import { PredictionPanel } from '../../src/features/predictions/PredictionPanel';
import {
  placePrediction,
  PREDICTION_DURATION_MS,
} from '../../src/features/predictions/predictionService';
import { ensureWelcomeBonus, WELCOME_BONUS_POINTS } from '../../src/features/wallet/walletService';

const USER = 'user-me';
const WAVE = 'trend-neirokot';
const NOW = 9_000_000;

const renderPanel = (repos = createMemoryRepositories(seed), trendId = WAVE) =>
  render(
    <RepositoriesProvider repositories={repos}>
      <PredictionPanel trendId={trendId} now={() => NOW} />
    </RepositoriesProvider>,
  );

const spend = (repos: ReturnType<typeof createMemoryRepositories>, amount: number) =>
  repos.wallet.append(
    makeEntry({ id: `spend-${amount}`, userId: USER, amount: -amount, kind: 'prediction_stake' }),
  );

describe('PredictionPanel', () => {
  test('explains the rules with the real waiting time', async () => {
    await renderPanel();

    expect(await screen.findByText(ru.predictions.title)).toBeTruthy();
    const minutes = PREDICTION_DURATION_MS / 60000;
    expect(
      screen.getByText(ru.predictions.rules.replace('{duration}', `${minutes} минут`)),
    ).toBeTruthy();
  });

  test('offers four amounts and a button with the chosen one', async () => {
    await renderPanel();

    for (const stake of [10, 50, 100, 250]) {
      expect(await screen.findByTestId(`stake-option-${stake}`)).toBeTruthy();
    }
    expect(screen.getByRole('button', { name: `${ru.predictions.place} 10 аур` })).toBeTruthy();
  });

  test('choosing another amount changes the button and marks the choice', async () => {
    await renderPanel();

    await fireEvent.press(await screen.findByTestId('stake-option-100'));

    expect(screen.getByRole('button', { name: `${ru.predictions.place} 100 аур` })).toBeTruthy();
    expect(screen.getByTestId('stake-option-100').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(screen.getByTestId('stake-option-10').props.accessibilityState).toMatchObject({
      selected: false,
    });
  });

  test('a prediction is made, paid for and then shown as waiting for its result', async () => {
    const repos = createMemoryRepositories(seed);
    await renderPanel(repos);
    await fireEvent.press(await screen.findByTestId('stake-option-50'));

    await fireEvent.press(screen.getByTestId('place-prediction'));

    expect(await screen.findByText(ru.predictions.accepted)).toBeTruthy();
    expect(screen.getByText(`${ru.predictions.resultIn} 10 минут`)).toBeTruthy();
    expect(screen.queryByTestId('place-prediction')).toBeNull();
    const [prediction] = await repos.predictions.listByUser(USER);
    expect(prediction).toMatchObject({ trendId: WAVE, stake: 50, status: 'open' });
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 50);
  });

  test('shows the waiting prediction instead of the buttons when one already exists', async () => {
    const repos = createMemoryRepositories(seed);
    await ensureWelcomeBonus(repos, USER, 0);
    await placePrediction(repos, { userId: USER, trendId: WAVE, stake: 100, now: NOW - 60_000 });

    await renderPanel(repos);

    expect(await screen.findByText(ru.predictions.accepted)).toBeTruthy();
    expect(screen.getByText(`${formatPoints(100)} аур`)).toBeTruthy();
    expect(screen.getByText(`${ru.predictions.resultIn} 9 минут`)).toBeTruthy();
    expect(screen.queryByTestId('place-prediction')).toBeNull();
  });

  test('says "less than a minute" when the result is about to come', async () => {
    const repos = createMemoryRepositories(seed);
    await ensureWelcomeBonus(repos, USER, 0);
    await placePrediction(repos, {
      userId: USER,
      trendId: WAVE,
      stake: 20,
      now: NOW - PREDICTION_DURATION_MS + 30_000,
    });

    await renderPanel(repos);

    expect(
      await screen.findByText(`${ru.predictions.resultIn} ${ru.predictions.lessThanMinute}`),
    ).toBeTruthy();
  });

  test('amounts above the balance cannot be chosen', async () => {
    const repos = createMemoryRepositories(seed);
    await repos.wallet.append(
      makeEntry({ id: 'bonus', userId: USER, amount: 60, kind: 'welcome_bonus' }),
    );
    await renderPanel(repos); // balance 60 + the welcome bonus is NOT given twice: bonus entry exists

    expect((await screen.findByTestId('stake-option-50')).props.accessibilityState).toMatchObject({
      disabled: false,
    });
    expect(screen.getByTestId('stake-option-100').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(screen.getByTestId('stake-option-250').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('with no sparks left nothing can be chosen and the button is off', async () => {
    const repos = createMemoryRepositories(seed);
    await ensureWelcomeBonus(repos, USER, 0);
    await spend(repos, WELCOME_BONUS_POINTS);

    await renderPanel(repos);

    expect(await screen.findByText(ru.predictions.notEnough)).toBeTruthy();
    for (const stake of [10, 50, 100, 250]) {
      expect(screen.getByTestId(`stake-option-${stake}`).props.accessibilityState).toMatchObject({
        disabled: true,
      });
    }
    expect(screen.getByTestId('place-prediction').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('tells the user when saving did not work and lets them try again', async () => {
    const repos = createMemoryRepositories(seed);
    await renderPanel(repos);
    await screen.findByTestId('place-prediction');
    jest.spyOn(repos.predictions, 'add').mockRejectedValueOnce(new Error('disk full'));

    await fireEvent.press(screen.getByTestId('place-prediction'));

    const message = await screen.findByText(ru.predictions.error);
    expect(message.props.accessibilityRole).toBe('alert');
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS);
    expect(screen.getByTestId('place-prediction')).toBeTruthy();
  });

  test('a second press while the first is still being saved does nothing', async () => {
    const repos = createMemoryRepositories(seed);
    await renderPanel(repos);
    const button = await screen.findByTestId('place-prediction');
    const add = repos.predictions.add.bind(repos.predictions);
    let finishSaving: () => void = () => {};
    const slowAdd = jest.spyOn(repos.predictions, 'add').mockImplementation(
      (prediction) =>
        new Promise((resolve) => {
          finishSaving = () => resolve(add(prediction));
        }),
    );

    await fireEvent.press(button);
    await fireEvent.press(button);
    await act(async () => {
      finishSaving();
    });
    await screen.findByText(ru.predictions.accepted);

    expect(slowAdd).toHaveBeenCalledTimes(1);
    expect(await repos.predictions.listByUser(USER)).toHaveLength(1);
    expect(await repos.wallet.getBalance(USER)).toBe(WELCOME_BONUS_POINTS - 10);
  });

  test('reads the amounts and the choice aloud', async () => {
    await renderPanel();

    const option = await screen.findByTestId('stake-option-50');
    expect(option.props.accessibilityLabel).toBe('50 аур');
    expect(screen.getByText(ru.predictions.amountLabel)).toBeTruthy();
  });
});
