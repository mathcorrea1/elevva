import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PlayerScreen } from './PlayerScreen';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { repository } from '@/shared/http/repository';
import { ApiError } from '@/shared/http/errors';
import { newQuestion } from './defaults';
import type { LessonAttempt } from './types';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));
jest.mock('@react-navigation/native', () => ({
  NavigationContext: jest.requireActual('react').createContext(undefined),
  useFocusEffect: (callback: () => void) => {
    const react = jest.requireActual('react');
    react.useEffect(callback, [callback]);
  },
}));
jest.mock('./YouTube', () => ({ YouTube: () => null }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-speech', () => ({
  stop: jest.fn(async () => {}),
  getAvailableVoicesAsync: jest.fn(async () => []),
  speak: jest.fn(),
}));
jest.mock('@/shared/http/repository', () => ({
  operationId: () => String(Math.random()),
  repository: { get: jest.fn(), command: jest.fn() },
}));

test('autosaves unfinished ordering, resumes after remount, retries same unconfirmed command and finishes real responses', async () => {
  const q = {
    ...newQuestion('q', 'order'),
    prompt: 'Monte CASA.',
    options: [
      { id: 'ca', text: 'CA' },
      { id: 'sa', text: 'SA' },
    ],
  };
  let state: LessonAttempt = {
    id: 'attempt',
    version: 1,
    status: 'in_progress',
    cursor: 0,
    visited: [],
    drafts: {},
    responses: {},
    items: [q],
    lesson_title: 'Aula de teste',
    screens: [
      {
        id: 'q-screen',
        type: 'activity',
        title: 'Vamos montar?',
        text: '',
        instruction: '',
        image: null,
        video_id: null,
        transcript: '',
        media_reviewed: false,
        item_id: 'q',
      },
      {
        id: 'end',
        type: 'completion',
        title: 'Concluir',
        text: '',
        instruction: '',
        image: null,
        video_id: null,
        transcript: '',
        media_reviewed: false,
      },
    ],
    item_results: {},
    interactions: [],
    result: {
      correct: 1,
      valid_items: 1,
      total_items: 1,
      required_items: 1,
      required_answered: 1,
      advance_percent: null,
      passed: true,
      scale: null,
      note: 'Teste sintético.',
      pending_review: 0,
    },
  };
  let fail = true;
  const draftKeys: string[] = [];
  jest.mocked(repository.get).mockResolvedValue({ presentation: { font_scale: 1 } });
  jest.mocked(repository.command).mockImplementation(async (path, body: any, key) => {
    if (path.endsWith('/start')) return structured(state) as any;
    if (path.endsWith('/draft')) {
      draftKeys.push(key);
      if (fail) throw new Error('Rede indisponível no teste.');
    }
    expect(body.version).toBe(state.version);
    state = { ...state, version: state.version + 1 };
    if (path.endsWith('/draft')) state.drafts = { ...state.drafts, [body.item_id]: body.value };
    if (path.endsWith('/responses'))
      state = {
        ...state,
        drafts: {},
        responses: { q: body.value },
        interactions: [{ kind: 'answer', item_id: 'q' }],
        item_results: { q: { correct: true, needs_review: false, feedback: 'Resposta salva.' } },
      };
    if (path.endsWith('/progress'))
      state = { ...state, cursor: body.cursor, visited: [body.acknowledge_screen] };
    if (path.endsWith('/finish')) state.status = 'finished';
    return structured(state) as any;
  });
  const goBack = jest.fn();
  const props: any = {
    route: {
      params: { student: { id: 's', name: 'Estudante fictício' }, assignment: { id: 'task' } },
    },
    navigation: {
      setOptions: jest.fn(),
      addListener: jest.fn(() => () => {}),
      goBack,
      dispatch: jest.fn(),
    },
  };
  let view = render(
    <ThemeProvider>
      <PlayerScreen {...props} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(view.getByText('Monte CASA.')).toBeTruthy(), { timeout: 3000 });
  fireEvent.press(view.getByRole('button', { name: 'Adicionar SA' }));
  await waitFor(() => expect(view.getByText(/Rede indisponível no teste/)).toBeTruthy(), {
    timeout: 2000,
  });
  expect(view.getByText(/Salvamento pendente/)).toBeTruthy();
  fail = false;
  fireEvent.press(view.getByRole('button', { name: 'Tentar salvar novamente' }));
  await waitFor(() => expect(view.getByText(/Progresso salvo/)).toBeTruthy());
  expect(draftKeys[0]).toBe(draftKeys[1]);
  fireEvent.press(view.getByRole('button', { name: 'Pausar e continuar depois' }));
  fireEvent.press(view.getByRole('button', { name: 'Salvar e sair da aula' }));
  await waitFor(() => expect(goBack).toHaveBeenCalledTimes(1));
  expect(state.drafts.q).toEqual(['sa']);
  view.unmount();
  view = render(
    <ThemeProvider>
      <PlayerScreen {...props} />
    </ThemeProvider>,
  );
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Retirar elemento 1' })).toBeTruthy(),
  );
  fireEvent.press(view.getByRole('button', { name: 'Adicionar CA' }));
  fireEvent.press(view.getByRole('button', { name: 'Mover elemento 2 antes' }));
  fireEvent.press(view.getByRole('button', { name: 'Confirmar resposta' }));
  await waitFor(() => expect(state.responses.q).toEqual(['ca', 'sa']));
  await waitFor(() =>
    expect(
      view.getByRole('button', { name: 'Próxima tela' }).props.accessibilityState.disabled,
    ).toBe(false),
  );
  fireEvent.press(view.getByRole('button', { name: 'Próxima tela' }));
  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Entregar e concluir aula' })).toBeTruthy(),
  );
  fireEvent.press(view.getByRole('button', { name: 'Entregar e concluir aula' }));
  await waitFor(() => expect(view.getByText('Mais uma descoberta!')).toBeTruthy());
  expect(state.status).toBe('finished');
});
function structured<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

test('conflict preserves selection until explicit recovery; revoked access clears the current exercise', async () => {
  const q = {
    ...newQuestion('q', 'single'),
    prompt: 'Selecione A.',
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ],
  };
  const initial: LessonAttempt = {
    id: 'attempt-race',
    version: 1,
    status: 'in_progress',
    cursor: 0,
    visited: [],
    drafts: {},
    responses: {},
    items: [q],
    lesson_title: 'Aula de teste',
    screens: [
      {
        id: 's',
        type: 'activity',
        title: 'Descoberta',
        text: '',
        instruction: '',
        image: null,
        video_id: null,
        transcript: '',
        media_reviewed: false,
        item_id: 'q',
      },
      {
        id: 'end',
        type: 'completion',
        title: 'Fim',
        text: '',
        instruction: '',
        image: null,
        video_id: null,
        transcript: '',
        media_reviewed: false,
      },
    ],
    item_results: {},
    interactions: [],
    result: {
      correct: 0,
      valid_items: 0,
      total_items: 1,
      required_items: 1,
      required_answered: 0,
      advance_percent: null,
      passed: false,
      scale: null,
      note: 'Teste.',
      pending_review: 0,
    },
  };
  const fresh = {
    ...initial,
    version: 3,
    responses: { q: 'a' },
    interaction_counts: { q: 1 },
    item_results: {
      q: { correct: true, needs_review: false, feedback: 'Resposta salva por outro acesso.' },
    },
  };
  let lost = false;
  jest
    .mocked(repository.get)
    .mockImplementation(
      async (path) =>
        (path.endsWith('/care') ? { presentation: { font_scale: 1 } } : structured(fresh)) as any,
    );
  jest.mocked(repository.command).mockImplementation(async (path) => {
    if (path.endsWith('/start')) return structured(initial) as any;
    throw new ApiError(
      lost ? 404 : 409,
      lost ? 'Recurso indisponível.' : 'Dados alterados; recarregue antes de salvar.',
    );
  });
  const props: any = {
    route: {
      params: { student: { id: 's', name: 'Estudante fictício' }, assignment: { id: 'task-race' } },
    },
    navigation: {
      setOptions: jest.fn(),
      addListener: jest.fn(() => () => {}),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    },
  };
  const view = render(
    <ThemeProvider>
      <PlayerScreen {...props} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(view.getByText('Selecione A.')).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'B' }));
  await waitFor(
    () =>
      expect(view.getByRole('button', { name: 'Usar progresso salvo no servidor' })).toBeTruthy(),
    { timeout: 2000 },
  );
  expect(view.getByRole('button', { name: '✓ B' }).props.accessibilityState.selected).toBe(true);
  const calls = jest.mocked(repository.command).mock.calls.length;
  fireEvent.press(view.getByRole('button', { name: 'Usar progresso salvo no servidor' }));
  await waitFor(() => expect(view.getByRole('button', { name: '✓ A' })).toBeTruthy());
  expect(jest.mocked(repository.command).mock.calls.length).toBe(calls);
  lost = true;
  fireEvent.press(view.getByRole('button', { name: 'B' }));
  await waitFor(() => expect(view.getByRole('button', { name: 'Voltar à lista' })).toBeTruthy(), {
    timeout: 2000,
  });
  expect(view.queryByText('Selecione A.')).toBeNull();
});
