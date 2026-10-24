import { fireEvent, render, screen } from '@testing-library/react-native';

import { ActionRail } from '../../src/features/feed/ActionRail';
import { formatCount } from '../../src/i18n/plural';
import { ru } from '../../src/i18n/ru';

const renderRail = async (props: Partial<Parameters<typeof ActionRail>[0]> = {}) => {
  const onOpenMarket = jest.fn();
  const onOpenComments = jest.fn();
  await render(
    <ActionRail
      holders={2400}
      commentCount={318}
      repostCount={96}
      shareCount={41}
      onOpenMarket={onOpenMarket}
      onOpenComments={onOpenComments}
      {...props}
    />,
  );
  return { onOpenMarket, onOpenComments };
};

describe('ActionRail', () => {
  test('shows the counts of the four buttons straight on the video', async () => {
    await renderRail();

    for (const text of [formatCount(2400), '318', '96', '41']) {
      expect(await screen.findByText(text)).toBeTruthy();
    }
  });

  test('the Aura coin opens the shares of the video and tells the holders to screen readers', async () => {
    const { onOpenMarket } = await renderRail();
    const button = await screen.findByTestId('aura-button');

    await fireEvent.press(button);

    expect(onOpenMarket).toHaveBeenCalledTimes(1);
    expect(button.props.accessibilityLabel).toBe(ru.feed.aura);
    expect(button.props.accessibilityValue.text).toBe(formatCount(2400));
  });

  test('without a handler the Aura coin is switched off', async () => {
    await renderRail({ onOpenMarket: undefined });

    expect((await screen.findByTestId('aura-button')).props.accessibilityState.disabled).toBe(true);
  });

  test('the comments button shows the count and opens the comments', async () => {
    const { onOpenComments } = await renderRail();

    const button = await screen.findByTestId('comments-button');
    await fireEvent.press(button);

    expect(button.props.accessibilityValue.text).toBe('318');
    expect(onOpenComments).toHaveBeenCalledTimes(1);
  });

  test('repost and share are drawn and switched off', async () => {
    await renderRail();

    for (const label of [ru.feed.soon.repost, ru.feed.soon.share]) {
      const button = await screen.findByRole('button', { name: label });
      expect(button.props.accessibilityState.disabled).toBe(true);
    }
  });
});
