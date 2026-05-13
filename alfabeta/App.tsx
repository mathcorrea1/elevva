import 'react-native-gesture-handler';
import 'react-native-reanimated';
import './src/locales/i18n';

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

import { ErrorBoundary } from '@/components/system/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AppProvider } from '@/providers/AppProvider';
import { theme } from '@/theme';

const Bootstrap = () => {
  const { hydrate } = useAuth();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return <RootNavigator />;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <StatusBar style="dark" />
        <Bootstrap />
      </AppProvider>
    </ErrorBoundary>
  );
}
