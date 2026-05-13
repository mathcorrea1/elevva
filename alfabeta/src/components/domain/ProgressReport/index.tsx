import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { theme } from '@/theme';

interface ProgressReportProps {
  title: string;
  progress: number;
  subtitle: string;
}

export const ProgressReport = ({ title, progress, subtitle }: ProgressReportProps) => (
  <Card>
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <ProgressBar value={progress} />
    </View>
  </Card>
);

const styles = StyleSheet.create({
  container: { gap: 8 },
  title: { fontFamily: theme.typography.fonts.primaryBold, fontSize: theme.typography.sizes.lg, color: theme.colors.text },
  subtitle: { color: theme.colors.neutral[600], fontSize: theme.typography.sizes.sm },
});

export default ProgressReport;
