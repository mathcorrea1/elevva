import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

export const Footer = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Elevva v1.0.0</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 12,
    alignItems: 'center',
  },
  text: {
    color: theme.colors.neutral[400],
    fontSize: theme.typography.sizes.xs,
  },
});

export default Footer;
