import React from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

export const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral[200],
    marginVertical: 8,
  },
});

export default Divider;
