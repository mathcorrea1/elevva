import { render, fireEvent } from '@testing-library/react-native';
import { CareScreen } from './CareScreen';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
const mockCare = {
  can_view_sensitive: false,
  can_edit: false,
  version: 0,
  presentation: { instruction_mode: 'standard', font_scale: 1, prefer_linear: false },
};
jest.mock('@/shared/data/hooks', () => ({
  useResource: (path: string) => ({
    data: path.endsWith('/care') ? mockCare : { confirmed_level: 'silabico-com-valor' },
    loading: false,
    error: '',
    reload: jest.fn(),
  }),
  useCommand: () => ({ run: jest.fn(), busy: false, error: '', message: '' }),
}));
test('student supports have a compact summary and do not expose ungranted sensitive editors', () => {
  const props: any = {
    route: {
      params: {
        student: {
          id: 's',
          name: 'Aluno fictício',
          supports: [],
          confirmed_level: null,
          role: 'teacher',
        },
      },
    },
    navigation: { navigate: jest.fn() },
  };
  const view = render(
    <ThemeProvider>
      <CareScreen {...props} />
    </ThemeProvider>,
  );
  expect(view.getByText('O que ajuda a aprender')).toBeTruthy();
  expect(view.getByText('Silábico com valor sonoro')).toBeTruthy();
  expect(view.queryByText('Informações restritas')).toBeNull();
  expect(view.queryByLabelText('Notas restritas (opcional)')).toBeNull();
  fireEvent.press(view.getByRole('button', { name: /Apresentação da aula/ }));
  expect(view.queryByRole('button', { name: 'Salvar ajustes' })).toBeNull();
});
