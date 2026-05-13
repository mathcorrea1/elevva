import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { ProgressReport } from '@/components/domain/ProgressReport';
import { Button } from '@/components/ui/Button';
import { progressService } from '@/services/api/progress.service';
import { theme } from '@/theme';

const { width } = Dimensions.get('window');

export const ChildProgressScreen = ({ route, navigation }: any) => {
  const childId = route.params?.childId as string;
  const [timeline, setTimeline] = useState<Array<{ date: string; progress: number }>>([]);

  useEffect(() => {
    void (async () => {
      const report = await progressService.report(childId);
      setTimeline(report.timeline);
    })();
  }, [childId]);

  const currentProgress = timeline.at(-1)?.progress ?? 0;

  return (
    <View style={styles.container}>
      <Header title="Progresso" showBack onBack={navigation.goBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Resumo do progresso */}
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
          <ProgressReport
            title="Evolução da alfabetização"
            subtitle="Últimos ciclos de avaliação"
            progress={currentProgress}
          />
        </MotiView>

        {/* Gráfico */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 220 }}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Linha do tempo</Text>
            {timeline.length > 0 ? (
              <LineChart
                data={{
                  labels: timeline.map((item) => item.date.slice(5)),
                  datasets: [{ data: timeline.map((item) => item.progress), strokeWidth: 3 }],
                }}
                width={width - 32 - 32}
                height={200}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#f5f3ff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(124,58,237,${opacity})`,
                  labelColor: () => '#57534e',
                  propsForDots: { r: '5', strokeWidth: '2', stroke: '#6d28d9' },
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <View style={styles.noData}>
                <Text style={styles.noDataText}>Sem dados de progresso ainda.</Text>
              </View>
            )}
          </View>
        </MotiView>

        {/* Estatísticas */}
        {timeline.length > 0 ? (
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 340 }}>
            <View style={styles.statsRow}>
              {[
                { label: 'Progresso atual', value: `${currentProgress}%`, color: theme.colors.primary[600] },
                { label: 'Avaliações', value: String(timeline.length), color: theme.colors.secondary[500] },
                { label: 'Evolução', value: `+${Math.max(0, currentProgress - (timeline[0]?.progress ?? 0))}%`, color: '#22c55e' },
              ].map((stat) => (
                <LinearGradient
                  key={stat.label}
                  colors={['#fff', '#f5f3ff']}
                  style={styles.statCard}
                >
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              ))}
            </View>
          </MotiView>
        ) : null}

        <Button label="Exportar relatório (PDF)" onPress={() => {}} variant="outline" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    ...theme.shadows.level2,
    borderWidth: 1,
    borderColor: '#f0edf8',
    gap: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_800ExtraBold',
    color: theme.colors.text,
  },
  chart: {
    borderRadius: theme.borderRadius.lg,
    marginLeft: -8,
  },
  noData: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[400],
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Poppins_800ExtraBold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
});

export default ChildProgressScreen;

