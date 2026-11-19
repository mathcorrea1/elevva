import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AssessmentScreen } from './AssessmentScreen';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
const mockRun = jest.fn();
let mockUseEmptyDraft = false;
const mockEmptyDraft = { version: 0, body: null, updated_at: null };
const mockDraft = {
  version: 2,
  body: {
    instrument_id: null,
    item: 'Proposta recuperada',
    response: 'Resposta parcial',
    support: '',
    evidence: [],
    notes: '',
  },
  updated_at: '2026-11-19T00:00:00Z',
};
jest.mock('@/shared/data/hooks', () => ({
  useResource: (path: string) => ({
    data: path === '/content' ? [] : mockUseEmptyDraft ? mockEmptyDraft : mockDraft,
    loading: false,
    error: '',
    reload: jest.fn(),
  }),
  useCommand: () => ({ run: mockRun, busy: false, error: '', message: '' }),
}));

test('assessment restores the private draft and saves the correct student/version without finalizing', async () => {
  mockUseEmptyDraft = false;
  mockRun.mockReset();
  const navigation: any = {
    addListener: jest.fn(() => () => {}),
    dispatch: jest.fn(),
    replace: jest.fn(),
  };
  const view = render(
    <ThemeProvider>
      <AssessmentScreen
        navigation={navigation}
        route={{ params: { student: { id: 's', name: 'Aluno fictício' } } } as any}
      />
    </ThemeProvider>,
  );
  await waitFor(() =>
    expect(view.getByLabelText('Proposta apresentada / item').props.value).toBe(
      'Proposta recuperada',
    ),
  );
  expect(view.getByLabelText('Resposta observada').props.value).toBe('Resposta parcial');
  fireEvent.changeText(view.getByLabelText('Resposta observada'), 'Resposta alterada');
  fireEvent.press(view.getByRole('button', { name: 'Salvar rascunho' }));
  expect(mockRun.mock.calls[0][0]).toBe('/students/s/assessment-draft');
  expect(mockRun.mock.calls[0][1]).toMatchObject({ version: 2, response: 'Resposta alterada' });
  expect(mockRun.mock.calls[0][3]).toBe('PUT');
  expect(navigation.replace).not.toHaveBeenCalled();
});

test('empty draft becomes editable after hydration without requiring a first keystroke', async () => {
  mockUseEmptyDraft = true;
  const navigation: any = {
    addListener: jest.fn(() => () => {}),
    dispatch: jest.fn(),
    replace: jest.fn(),
  };
  const view = render(
    <ThemeProvider>
      <AssessmentScreen
        navigation={navigation}
        route={{ params: { student: { id: 'empty', name: 'Aluno fictício' } } } as any}
      />
    </ThemeProvider>,
  );
  await waitFor(() =>
    expect(view.getByLabelText('Proposta apresentada / item').props.editable).toBe(true),
  );
  expect(
    view.getByRole('button', { name: 'Salvar rascunho' }).props.accessibilityState.disabled,
  ).toBe(false);
});
