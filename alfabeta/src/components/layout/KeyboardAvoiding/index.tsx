import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import type { ReactNode } from 'react';

interface KeyboardAvoidingProps {
  children: ReactNode;
}

export const KeyboardAvoiding = ({ children }: KeyboardAvoidingProps) => (
  <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {children}
  </KeyboardAvoidingView>
);

export default KeyboardAvoiding;
