import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ActionRail } from '../../src/features/feed/ActionRail';
import { countLabel, formatCount } from '../../src/i18n/plural';
import { ru } from '../../src/i18n/ru';
import { colors, MIN_TOUCH_TARGET } from '../../src/theme';

const renderRail = async (props: Partial<Parameters<typeof ActionRail>[0]> = {}) => {
  const onToggleLike = jest.fn();
  const view = await render(
    <ActionRail
      liked={false}
      likeCount={260}
      viewCount={3401}
      onToggleLike={onToggleLike}
      {...props}
    />,
  );
  return { onToggleLike, view };
};

describe('ActionRail', () => {
  test('shows the like count and calls the handler when the like is pressed', async () => {
    const { onToggleLike } = await renderRail();
    await screen.findByText('260');

    await fireEvent.press(screen.getByLabelText(ru.feed.like));

    expect(onToggleLike).toHaveBeenCalledTimes(1);
  });

  test('uses an outlined heart before liking and a filled pink heart after', async () => {
    const { view } = await renderRail();
    const icon = await screen.findByTestId('like-icon', { hidden: true });
    expect(icon.props.children).not.toBe(undefined);
    expect(StyleSheet.flatten(icon.props.style).color).toBe(colors.text);
    expect(icon.props.accessibilityLabel).toBeUndefined();
    const before = icon.props.children;

    await view.rerender(
      <ActionRail liked likeCount={261} viewCount={3401} onToggleLike={jest.fn()} />,
    );

    const liked = screen.getByTestId('like-icon', { hidden: true });
    expect(StyleSheet.flatten(liked.props.style).color).toBe(colors.like);
    expect(liked.props.children).not.toBe(before);
    expect(screen.getByLabelText(ru.feed.unlike)).toBeTruthy();
  });

  test('tells screen readers the like count as a value', async () => {
    await renderRail({ likeCount: 4100 });

    expect((await screen.findByLabelText(ru.feed.like)).props.accessibilityValue).toEqual({
      text: formatCount(4100),
    });
  });

  test('the like button is at least 44 points big in both directions', async () => {
    await renderRail();

    const style = StyleSheet.flatten((await screen.findByTestId('like-button')).props.style);
    expect(style.minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(style.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });

  test('shows the views as a short number and reads them aloud as a sentence', async () => {
    await renderRail({ viewCount: 3401 });

    const views = await screen.findByTestId('views-indicator');

    expect(views).toHaveTextContent(formatCount(3401), { exact: false });
    expect(views.props.accessibilityLabel).toBe(countLabel(3401, ru.feed.views));
  });

  test('views are information only: they are not a button', async () => {
    await renderRail();

    expect((await screen.findByTestId('views-indicator')).props.accessibilityRole).not.toBe(
      'button',
    );
  });

  test('lists the like first and the views below it', async () => {
    await renderRail();
    const rail = await screen.findByTestId('action-rail');

    const order = rail.props.children.map(
      (child: { props: { testID: string } }) => child.props.testID,
    );

    expect(order).toEqual(['like-button', 'views-indicator']);
  });
});
