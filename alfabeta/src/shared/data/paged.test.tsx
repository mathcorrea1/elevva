import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePaged } from './paged';
import { repository } from '@/shared/http/repository';
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    const react = jest.requireActual('react');
    react.useEffect(callback, [callback]);
  },
}));
jest.mock('@/shared/http/repository', () => ({ repository: { get: jest.fn() } }));
test('a stale command callback cannot reload the previous filter over the active paginated library', async () => {
  jest
    .mocked(repository.get)
    .mockImplementation(
      async (path) =>
        ({
          items: [{ id: path.includes('shared') ? 'received-version' : 'owned-version' }],
          total: 1,
          next_offset: null,
        }) as any,
    );
  const { result, rerender } = renderHook(
    ({ scope }: { scope: string }) => usePaged<{ id: string }>('/lessons?scope=' + scope),
    { initialProps: { scope: 'mine' } },
  );
  await waitFor(() => expect(result.current.items[0]?.id).toBe('owned-version'));
  const oldReload = result.current.reload;
  rerender({ scope: 'shared' });
  await waitFor(() => expect(result.current.items[0]?.id).toBe('received-version'));
  const requests = jest.mocked(repository.get).mock.calls.length;
  await act(async () => {
    await oldReload();
  });
  expect(result.current.items[0].id).toBe('received-version');
  expect(jest.mocked(repository.get).mock.calls.length).toBe(requests);
});
