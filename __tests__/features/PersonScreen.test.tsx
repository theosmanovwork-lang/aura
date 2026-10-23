import { fireEvent, render, screen } from '@testing-library/react-native';

import { PersonScreen } from '../../src/features/person/PersonScreen';
import { ru } from '../../src/i18n/ru';

const renderPerson = (props: Partial<Parameters<typeof PersonScreen>[0]> = {}) =>
  render(<PersonScreen handle="kira" onBack={jest.fn()} {...props} />);

describe('PersonScreen', () => {
  test('shows the handle, the name, the rank and the four numbers', async () => {
    await renderPerson();

    expect(screen.getByText('@kira')).toBeTruthy();
    expect(screen.getByText('Кира')).toBeTruthy();
    expect(screen.getByText(ru.person.rankTag.replace('{n}', '1'))).toBeTruthy();
    expect(screen.getByTestId('person-following')).toHaveTextContent('318');
    expect(screen.getByTestId('person-cards')).toHaveTextContent('41');
    expect(screen.getByTestId('person-accuracy')).toHaveTextContent('84%');
  });

  test('following turns the button and adds one hundred followers (and unfollowing takes it back)', async () => {
    await renderPerson();
    const before = screen.getByTestId('person-followers').children.join('');

    await fireEvent.press(screen.getByTestId('person-follow'));
    expect(screen.getByText(ru.person.subscribed)).toBeTruthy();
    expect(screen.getByTestId('person-followers').children.join('')).not.toBe(before);

    await fireEvent.press(screen.getByTestId('person-follow'));
    expect(screen.getByText(ru.person.follow)).toBeTruthy();
    expect(screen.getByTestId('person-followers').children.join('')).toBe(before);
  });

  test('the video grid shows six tiles, the first one pinned; other tabs are empty', async () => {
    await renderPerson();

    expect(screen.getAllByTestId(/^person-tile-/)).toHaveLength(6);
    expect(screen.getAllByText(ru.person.pinned)).toHaveLength(1);

    await fireEvent.press(screen.getByTestId('person-tab-cards'));
    expect(screen.getByTestId('person-empty')).toBeTruthy();
    expect(screen.queryAllByTestId(/^person-tile-/)).toHaveLength(0);
  });

  test('the write button and the clan chip call their handlers', async () => {
    const onWrite = jest.fn();
    const onOpenClan = jest.fn();
    await renderPerson({ onWrite, onOpenClan });

    await fireEvent.press(screen.getByTestId('person-write'));
    await fireEvent.press(screen.getByTestId('person-clan'));

    expect(onWrite).toHaveBeenCalled();
    expect(onOpenClan).toHaveBeenCalled();
  });
});
