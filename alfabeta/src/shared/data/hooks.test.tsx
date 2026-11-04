import { act, renderHook } from '@testing-library/react-native';
import { useCommand } from './hooks';
import { repository } from '@/shared/http/repository';
jest.mock('@/shared/http/repository', () => ({
  repository: { command: jest.fn() },
  operationId: jest.fn().mockReturnValueOnce('first-operation').mockReturnValue('next-operation'),
}));
test('a network retry preserves operation identity and reports saved only after confirmation', async () => {
  const send = repository.command as jest.Mock;
  send
    .mockRejectedValueOnce(new Error('Rede indisponível'))
    .mockResolvedValueOnce({ id: 'persisted-child' });
  const { result } = renderHook(() => useCommand());
  await act(async () => {
    await result.current.run('/students', { name: 'Lia' });
  });
  expect(result.current.message).toContain('não confirmado');
  await act(async () => {
    await result.current.run('/students', { name: 'Lia' });
  });
  expect(send.mock.calls[0][2]).toBe(send.mock.calls[1][2]);
  expect(result.current.message).toBe('Salvo.');
});
