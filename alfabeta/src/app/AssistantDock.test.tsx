import { render, fireEvent } from '@testing-library/react-native';
import { AssistantDock } from './AssistantDock';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { LibrasContext } from '@/features/accessibility/libras-context';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));

test('icon shortcuts open separate destinations without rendering visible text', () => {
  const openAI = jest.fn(),
    openLibras = jest.fn();
  const view = render(
    <ThemeProvider>
      <LibrasContext.Provider value={{ open: openLibras, register: jest.fn(), clear: jest.fn() }}>
        <AssistantDock bottomInset={72} showAI openAI={openAI} />
      </LibrasContext.Provider>
    </ThemeProvider>,
  );
  fireEvent.press(view.getByRole('button', { name: 'Abrir recursos de inteligência artificial' }));
  expect(openAI).toHaveBeenCalledTimes(1);
  expect(openLibras).not.toHaveBeenCalled();
  fireEvent.press(view.getByRole('button', { name: 'Abrir apoio em Libras' }));
  expect(openLibras).toHaveBeenCalledTimes(1);
  expect(view.queryByText('Abrir recursos de inteligência artificial')).toBeNull();
});

test('focused student activity retains Libras without the adult AI destination', () => {
  const view = render(
    <ThemeProvider>
      <AssistantDock bottomInset={0} showAI={false} openAI={jest.fn()} />
    </ThemeProvider>,
  );
  expect(view.getByRole('button', { name: 'Abrir apoio em Libras' })).toBeTruthy();
  expect(
    view.queryByRole('button', { name: 'Abrir recursos de inteligência artificial' }),
  ).toBeNull();
});
