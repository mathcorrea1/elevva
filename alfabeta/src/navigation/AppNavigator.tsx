import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BottomTabNavigator } from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
  </Stack.Navigator>
);
