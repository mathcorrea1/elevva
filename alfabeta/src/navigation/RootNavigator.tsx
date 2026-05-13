import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '@/hooks/useAuth';

import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return <NavigationContainer>{isAuthenticated ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
};
