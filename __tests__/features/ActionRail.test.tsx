import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ActionRail } from '../../src/features/feed/ActionRail';
import { formatCount } from '../../src/i18n/plural';
import { ru } from '../../src/i18n/ru';
import { colors, MIN_TOUCH_TARGET } from '../../src/theme';

const renderRail = async (props: Partial<Parameters<typeof ActionRail>[0]> = {}) => {
  const onToggleLike = jest.fn();
  const view = await render(
    <ActionRail liked={false} likeCount={260} onToggleLike={onToggleLike} {...props} />,
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

  test('the like is the Aura mark: muted before liking, bright after', async () => {
    const { view } = await renderRail();
    const mark = await screen.findByTestId('like-icon', { hidden: true });
    expect(StyleSheet.flatten(mark.props.style).color).toBe(colors.text);
    expect(StyleSheet.flatten(mark.props.style).opacity).toBeLessThan(1);
    expect(mark.props.accessibilityLabel).toBeUndefined();

    await view.rerender(<ActionRail liked likeCount={261} onToggleLike={jest.fn()} />);

    const liked = screen.getByTestId('like-icon', { hidden: true });
    expect(StyleSheet.flatten(liked.props.style).color).toBe(colors.like);
    expect(StyleSheet.flatten(liked.props.style).opacity).toBe(1);
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

  test('the rail holds only the Aura mark: no view counter', async () => {
    await renderRail();
    const rail = await screen.findByTestId('action-rail');

    expect(screen.queryByTestId('views-indicator')).toBeNull();
    expect(rail).toContainElement(screen.getByTestId('like-button'));
  });
});
