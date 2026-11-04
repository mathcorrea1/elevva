import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as Speech from 'expo-speech';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { Reading } from './Reading';
jest.mock('expo-speech', () => ({
  stop: jest.fn(async () => undefined),
  speak: jest.fn(),
  getAvailableVoicesAsync: jest.fn(async () => []),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));
jest.mock('@react-navigation/native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { useFocusEffect: (effect: () => void) => React.useEffect(effect, [effect]) };
});
beforeEach(() => {
  jest.clearAllMocks();
  (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([]);
});
test('missing PT-BR voice is explicit and never pretends to play', async () => {
  const view = render(
    <ThemeProvider>
      <Reading text="Escolha uma resposta." />
    </ThemeProvider>,
  );
  fireEvent.press(view.getByRole('button', { name: 'Ouvir instrução' }));
  await waitFor(() =>
    expect(view.getByText(/Voz em português brasileiro indisponível/)).toBeTruthy(),
  );
  expect(Speech.speak).not.toHaveBeenCalled();
});
test('assessment item without reading permission never exposes speech controls', async () => {
  const view = render(
    <ThemeProvider>
      <Reading text="Texto protegido da avaliação" allowed={false} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(view.queryByRole('button', { name: 'Ouvir instrução' })).toBeNull());
  expect(Speech.getAvailableVoicesAsync).not.toHaveBeenCalled();
});
test('PT-BR speech and stop use the platform adapter without pause claims', async () => {
  (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([
    { language: 'pt-BR', identifier: 'test-voice' },
  ]);
  const view = render(
    <ThemeProvider>
      <Reading text="Escolha uma resposta." />
    </ThemeProvider>,
  );
  fireEvent.press(view.getByRole('button', { name: 'Ouvir instrução' }));
  await waitFor(() =>
    expect(Speech.speak).toHaveBeenCalledWith(
      'Escolha uma resposta.',
      expect.objectContaining({ language: 'pt-BR', voice: 'test-voice' }),
    ),
  );
  fireEvent.press(view.getByRole('button', { name: 'Parar leitura' }));
  expect(Speech.stop).toHaveBeenCalled();
});
