import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { theme } from '@/theme';

interface SafeAreaWrapperProps {
  children: ReactNode;
}

export const SafeAreaWrapper = ({ children }: SafeAreaWrapperProps) => (
  <SafeAreaView style={styles.safe}>
    <View style={styles.inner}>{children}</View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
