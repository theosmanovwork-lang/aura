import { fireEvent, render, screen } from '@testing-library/react-native';

import { ActionRail } from '../../src/features/feed/ActionRail';
import { formatCount } from '../../src/i18n/plural';
import { ru } from '../../src/i18n/ru';

const renderRail = async (props: Partial<Parameters<typeof ActionRail>[0]> = {}) => {
  const onToggleLike = jest.fn();
  const onOpenComments = jest.fn();
  await render(
    <ActionRail
      liked={false}
      likeCount={260}
      commentCount={3}
      onToggleLike={onToggleLike}
      onOpenComments={onOpenComments}
      {...props}
    />,
  );
  return { onToggleLike, onOpenComments };
};

describe('ActionRail', () => {
  test('shows the like count and calls the handler when the Aura button is pressed', async () => {
    const { onToggleLike } = await renderRail();
    await screen.findByText('260');

    await fireEvent.press(screen.getByLabelText(ru.feed.like));

    expect(onToggleLike).toHaveBeenCalledTimes(1);
  });

  test('the like is drawn on silver before liking and dark after', async () => {
    await renderRail();
    expect(await screen.findByTestId('like-icon', { hidden: true })).toBeTruthy();
    expect(screen.queryByTestId('like-icon-on', { hidden: true })).toBeNull();

    await renderRail({ liked: true });

    expect(await screen.findByTestId('like-icon-on', { hidden: true })).toBeTruthy();
  });

  test('tells screen readers the like count and whether it is selected', async () => {
    await renderRail({ liked: true, likeCount: 1500 });

    const button = await screen.findByTestId('like-button');

    expect(button.props.accessibilityValue.text).toBe(formatCount(1500));
    expect(button.props.accessibilityLabel).toBe(ru.feed.unlike);
    expect(button.props.accessibilityState.selected).toBe(true);
  });

  test('the comments button shows the count and opens the comments', async () => {
    const { onOpenComments } = await renderRail({ commentCount: 318 });

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
