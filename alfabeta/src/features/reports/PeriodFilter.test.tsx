import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { PeriodFilter } from './PeriodFilter';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
test('period draft is discarded on cancel and applied only with a valid order', async () => {
  const apply = jest.fn();
  const view = render(
    <ThemeProvider>
      <PeriodFilter start="2026-10-01" end="2026-10-29" apply={apply} />
    </ThemeProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.press(view.getByRole('button', { name: 'Filtrar período' }));
  fireEvent.changeText(view.getByLabelText('Início (AAAA-MM-DD)'), '2026-11-01');
  expect(
    view.getByRole('button', { name: 'Aplicar período' }).props.accessibilityState.disabled,
  ).toBe(true);
  fireEvent.press(view.getByRole('button', { name: 'Cancelar alterações' }));
  expect(apply).not.toHaveBeenCalled();
  fireEvent.press(view.getByRole('button', { name: 'Filtrar período' }));
  expect(view.getByLabelText('Início (AAAA-MM-DD)').props.value).toBe('2026-10-01');
  fireEvent.changeText(view.getByLabelText('Início (AAAA-MM-DD)'), '2026-10-10');
  fireEvent.press(view.getByRole('button', { name: 'Aplicar período' }));
  expect(apply).toHaveBeenCalledWith('2026-10-10', '2026-10-29');
});
