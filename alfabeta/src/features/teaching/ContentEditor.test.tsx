import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ContentEditor } from './ContentEditor';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import type { Content } from '@/shared/contracts';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));
const mockRun = jest.fn();
jest.mock('@/shared/data/hooks', () => ({ useCommand: () => ({ run: mockRun, busy: false }) }));
beforeEach(() => mockRun.mockClear());

test('two authored items retain independent choices and answers; incomplete item blocks saving', async () => {
  const view = render(
    <ThemeProvider>
      <ContentEditor saved={jest.fn()} cancel={jest.fn()} />
    </ThemeProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.press(view.getByRole('button', { name: 'Atividade' }));
  fireEvent.changeText(view.getByLabelText('Título'), 'Exemplo técnico');
  fireEvent.changeText(view.getByLabelText('Instruções / orientação'), 'Sem validade pedagógica.');
  fireEvent.changeText(view.getByLabelText('Pergunta do item'), 'Primeiro?');
  fireEvent.changeText(view.getByLabelText('Alternativa A'), 'A');
  fireEvent.changeText(view.getByLabelText('Alternativa B'), 'B');
  fireEvent.press(view.getByRole('button', { name: 'Adicionar item' }));
  expect(
    view.getByRole('button', { name: 'Salvar rascunho' }).props.accessibilityState.disabled,
  ).toBe(true);
  fireEvent.changeText(view.getByLabelText('Pergunta do item'), 'Segundo?');
  fireEvent.changeText(view.getByLabelText('Alternativa A'), 'C');
  fireEvent.changeText(view.getByLabelText('Alternativa B'), 'D');
  fireEvent.press(view.getByRole('button', { name: 'Gabarito: alternativa B' }));
  fireEvent.press(view.getByRole('button', { name: 'Salvar rascunho' }));
  const [path, body] = mockRun.mock.calls[0];
  expect(path).toBe('/content');
  expect(body.items).toHaveLength(2);
  expect(body.items[0].choices).toEqual(['A', 'B']);
  expect(body.items[0].answer).toBe(0);
  expect(body.items[1].answer).toBe(1);
  expect(body.items.every((item: { reading_allowed: boolean }) => !item.reading_allowed)).toBe(
    true,
  );
});

test('draft edit sends its known version and cancellation needs explicit discard', async () => {
  const cancel = jest.fn();
  const content: Content = {
    id: 'draft',
    version: 3,
    kind: 'guidance',
    status: 'draft',
    title: 'Orientação de teste',
    body: { instructions: 'Conteúdo inteiramente fictício.', items: [] },
  };
  const view = render(
    <ThemeProvider>
      <ContentEditor initial={content} saved={jest.fn()} cancel={cancel} />
    </ThemeProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.changeText(view.getByLabelText('Título'), 'Orientação ajustada');
  fireEvent.press(view.getByRole('button', { name: 'Salvar rascunho' }));
  expect(mockRun.mock.calls[0][0]).toBe('/content/draft/revisions');
  expect(mockRun.mock.calls[0][1]).toMatchObject({ version: 3, title: 'Orientação ajustada' });
  fireEvent.press(view.getByRole('button', { name: 'Cancelar edição' }));
  expect(cancel).not.toHaveBeenCalled();
  fireEvent.press(view.getByRole('button', { name: 'Descartar alterações não salvas' }));
  expect(cancel).toHaveBeenCalledTimes(1);
});
