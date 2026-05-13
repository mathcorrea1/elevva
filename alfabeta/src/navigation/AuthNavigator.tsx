import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ForgotPasswordScreen } from '@/screens/Auth/ForgotPasswordScreen';
import { LoginScreen } from '@/screens/Auth/LoginScreen';
import { OnboardingScreen } from '@/screens/Auth/OnboardingScreen';
import { RegisterScreen } from '@/screens/Auth/RegisterScreen';
import { SplashScreen } from '@/screens/Auth/SplashScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => (
  <Stack.Navigator
    initialRouteName="Splash"
    screenOptions={{
      headerShown: false,
      animation: 'fade_from_bottom',
    }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);
