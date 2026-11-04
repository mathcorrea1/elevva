import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { OnboardingGate, replayOnboarding } from './OnboardingGate';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.requireActual('react-native').View,
}));
test('onboarding completion persists; replay keeps the application mounted', async () => {
  const view = render(
    <ThemeProvider>
      <OnboardingGate>
        <Text>Área da conta</Text>
      </OnboardingGate>
    </ThemeProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(view.queryByText('Área da conta')).toBeNull();
  fireEvent.press(view.getByRole('button', { name: 'Continuar →' }));
  fireEvent.press(view.getByRole('button', { name: 'Continuar →' }));
  fireEvent.press(view.getByRole('button', { name: 'Vamos começar' }));
  expect(view.getByText('Área da conta')).toBeTruthy();
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('eleva.onboarding.v1', 'done');
  act(() => replayOnboarding());
  expect(view.queryByText('Área da conta')).toBeNull();
  expect(view.getByText('Área da conta', { includeHiddenElements: true })).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'Pular apresentação' }));
  expect(view.getByText('Área da conta')).toBeTruthy();
});
