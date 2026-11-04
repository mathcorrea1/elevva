import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { Activity } from './Activity';
import { newQuestion } from './defaults';
import type { ResponseValue } from './types';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));
jest.mock('@/shared/http/repository', () => ({
  repository: { get: jest.fn() },
  operationId: () => 'test-only',
}));
test('image-only association renders the source image and preserves its accessible meaning in the choice', () => {
  const q = {
    ...newQuestion('image-pairs', 'matching'),
    options: [
      { id: 'a', text: '', image: { builtin: 'sprout' as const, alt: 'Uma planta' } },
      { id: 'b', text: '', image: { builtin: 'boat' as const, alt: 'Um barco' } },
    ],
    targets: [
      { id: 'x', text: 'Planta' },
      { id: 'y', text: 'Barco' },
    ],
  };
  const view = render(
    <ThemeProvider>
      <Activity question={q} value={{}} onChange={() => {}} />
    </ThemeProvider>,
  );
  expect(view.getByLabelText('Uma planta', { exact: true })).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'Uma planta · escolher par' }));
  expect(view.getByText('Qual é o par de Uma planta?')).toBeTruthy();
  expect(view.getByRole('button', { name: 'Associar a Planta' })).toBeTruthy();
});

test('pair association supports touch/keyboard buttons and enforces one destination per origin without dragging', () => {
  const results: ResponseValue[] = [];
  const q = {
    ...newQuestion('q', 'matching'),
    options: [
      { id: 'a', text: 'CASA' },
      { id: 'b', text: 'BOLA' },
    ],
    targets: [
      { id: 'x', text: 'Casa' },
      { id: 'y', text: 'Bola' },
    ],
  };
  function Harness() {
    const [value, set] = useState<ResponseValue>({});
    return (
      <ThemeProvider>
        <Activity
          question={q}
          value={value}
          onChange={(v) => {
            results.push(v);
            set(v);
          }}
        />
      </ThemeProvider>
    );
  }
  const view = render(<Harness />);
  fireEvent.press(view.getByRole('button', { name: 'CASA · escolher par' }));
  fireEvent.press(view.getByRole('button', { name: 'Associar a Casa' }));
  fireEvent.press(view.getByRole('button', { name: 'BOLA · escolher par' }));
  fireEvent.press(view.getByRole('button', { name: 'Associar a Casa' }));
  expect(results[results.length - 1]).toEqual({ b: 'x' });
  fireEvent.press(view.getByRole('button', { name: 'CASA · escolher par' }));
  fireEvent.press(view.getByRole('button', { name: 'Associar a Bola' }));
  expect(results[results.length - 1]).toEqual({ b: 'x', a: 'y' });
});
