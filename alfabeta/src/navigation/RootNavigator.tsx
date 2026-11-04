import React from 'react';
import { useColorScheme } from 'react-native';

import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';

import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/theme';

import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export const RootNavigator = () => {
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.neutral[200],
      primary: theme.colors.primary[600],
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
