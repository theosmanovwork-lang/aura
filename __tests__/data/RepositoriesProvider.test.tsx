import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { RepositoriesProvider, useRepositories } from '../../src/data/RepositoriesProvider';
import { createMemoryRepositories } from '../../src/data/memory';
import { ru } from '../../src/i18n/ru';

function Probe() {
  const repos = useRepositories();
  return <Text>{repos ? 'repos-ready' : 'none'}</Text>;
}

describe('RepositoriesProvider', () => {
  test('gives the children the repositories it was handed', async () => {
    await render(
      <RepositoriesProvider repositories={createMemoryRepositories()}>
        <Probe />
      </RepositoriesProvider>,
    );

    expect(screen.getByText('repos-ready')).toBeTruthy();
  });

  test('shows a loading message until the storage is open, then the children', async () => {
    let finish: (value: ReturnType<typeof createMemoryRepositories>) => void = () => {};
    const open = jest.fn(
      () => new Promise<ReturnType<typeof createMemoryRepositories>>((r) => (finish = r)),
    );

    await render(
      <RepositoriesProvider open={open}>
        <Probe />
      </RepositoriesProvider>,
    );
    expect(screen.getByText(ru.app.loading)).toBeTruthy();
    expect(screen.queryByText('repos-ready')).toBeNull();

    finish(createMemoryRepositories());
    expect(await screen.findByText('repos-ready')).toBeTruthy();
  });

  test('shows an error when the storage cannot be opened and retries on request', async () => {
    const open = jest
      .fn()
      .mockRejectedValueOnce(new Error('corrupt'))
      .mockResolvedValueOnce(createMemoryRepositories());

    await render(
      <RepositoriesProvider open={open}>
        <Probe />
      </RepositoriesProvider>,
    );
    expect(await screen.findByText(ru.app.storageError)).toBeTruthy();

    await fireEvent.press(screen.getByText(ru.app.retry));

    expect(await screen.findByText('repos-ready')).toBeTruthy();
    expect(open).toHaveBeenCalledTimes(2);
  });

  test('using the hook outside of the provider is a clear programming error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<Probe />)).rejects.toThrow('RepositoriesProvider');
    spy.mockRestore();
  });
});
