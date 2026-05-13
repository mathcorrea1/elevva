import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

import { MotiView } from '@/components/system/MotiShim';
import { Avatar } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/domain/LevelBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useChild } from '@/hooks/useChild';
import { formatDate } from '@/utils/formatters';
import { literacyLevels } from '@/utils/literacy.levels';
import { theme } from '@/theme';
import type { BimestreReport } from '@/@types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;

const BIMESTRE_LABELS = ['1° Bimestre', '2° Bimestre', '3° Bimestre', '4° Bimestre'] as const;

/* ─────────────────────────────────────────────────────────────────────────── */
/* BimestreSelector                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

interface BimestreSelectorProps {
  available: number[];
  selected: number;
  accent: string;
  onSelect: (b: number) => void;
}

const BimestreSelector = ({ available, selected, accent, onSelect }: BimestreSelectorProps) => (
  <View style={styles.selectorRow}>
    {[1, 2, 3, 4].map((b) => {
      const enabled = available.includes(b);
      const active = selected === b;
      return (
        <Pressable
          key={b}
          style={[
            styles.selectorBtn,
            active && { backgroundColor: accent, borderColor: accent },
            !enabled && styles.selectorBtnDisabled,
          ]}
          onPress={() => enabled && onSelect(b)}
          disabled={!enabled}
        >
          <Text style={[
            styles.selectorBtnLabel,
            active && { color: '#fff' },
            !enabled && { color: theme.colors.neutral[300] },
          ]}>
            {b}°
          </Text>
          <Text style={[
            styles.selectorBtnSub,
            active && { color: 'rgba(255,255,255,0.8)' },
            !enabled && { color: theme.colors.neutral[300] },
          ]}>
            Bim
          </Text>
        </Pressable>
      );
    })}
  </View>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* ReportCard                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

const ReportCard = ({ report, accent, accentLight }: {
  report: BimestreReport;
  accent: string;
  accentLight: string;
}) => {
  const initialColor = theme.colors.literacy[report.initialLevel as keyof typeof theme.colors.literacy] ?? accent;
  const finalColor   = theme.colors.literacy[report.finalLevel   as keyof typeof theme.colors.literacy] ?? accent;
  const leveledUp = report.initialLevel !== report.finalLevel;
  const initialInfo  = literacyLevels[report.initialLevel];
  const finalInfo    = literacyLevels[report.finalLevel];

  return (
    <View style={styles.reportCard}>
      {/* Level flow */}
      <View style={styles.levelFlow}>
        <View style={styles.levelFlowSide}>
          <Text style={styles.levelFlowCap}>Nível inicial</Text>
          <View style={[styles.levelChip, { backgroundColor: `${initialColor}22` }]}>
            <View style={[styles.levelDot, { backgroundColor: initialColor }]} />
            <Text style={[styles.levelChipText, { color: initialColor }]}>{initialInfo.label}</Text>
          </View>
        </View>

        <View style={styles.levelFlowCenter}>
          {leveledUp ? (
            <LinearGradient colors={[initialColor, finalColor]} style={styles.arrowGradient}>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </LinearGradient>
          ) : (
            <View style={styles.arrowNeutral}>
              <Ionicons name="remove" size={16} color={theme.colors.neutral[400]} />
            </View>
          )}
          {leveledUp ? (
            <Text style={styles.leveledUpLabel}>Avançou!</Text>
          ) : (
            <Text style={styles.levelSameLabel}>Em consolidação</Text>
          )}
        </View>

        <View style={styles.levelFlowSide}>
          <Text style={styles.levelFlowCap}>Nível final</Text>
          <View style={[styles.levelChip, { backgroundColor: `${finalColor}22` }]}>
            <View style={[styles.levelDot, { backgroundColor: finalColor }]} />
            <Text style={[styles.levelChipText, { color: finalColor }]}>{finalInfo.label}</Text>
          </View>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {[
          { icon: 'calendar-outline' as const, label: 'Sessões', value: String(report.sessionsCompleted), color: accent },
          { icon: 'star-outline' as const, label: 'Média', value: `${report.averageScore} pts`, color: theme.colors.secondary[500] },
          { icon: 'trending-up-outline' as const, label: 'Evolução', value: `+${report.evolution} pts`, color: '#16a34a' },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <View style={[styles.statIconBox, { backgroundColor: `${s.color}18` }]}>
              <Ionicons name={s.icon} size={16} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Score médio</Text>
        <ProgressBar
          value={report.averageScore}
          color={accent}
          colorEnd={finalColor}
          height={8}
        />
      </View>

      {/* Notes */}
      {report.notes ? (
        <View style={[styles.notesBox, { backgroundColor: accentLight }]}>
          <Ionicons name="chatbubble-outline" size={14} color={accent} />
          <Text style={[styles.notesText, { color: accent }]}>{report.notes}</Text>
        </View>
      ) : null}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Main screen                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export const StudentReportScreen = ({ route, navigation }: any) => {
  const childId = route.params?.childId as string;
  const { children } = useChild();
  const child = children.find((c) => c.id === childId);

  const bimestreReports = child?.bimestreReports ?? [];
  const availableBimestres = bimestreReports.map((r) => r.bimestre);
  const [selectedBimestre, setSelectedBimestre] = useState<number>(availableBimestres[0] ?? 1);

  if (!child) {
    return (
      <View style={styles.container}>
        <Pressable onPress={navigation.goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundText}>Criança não encontrada.</Text>
        </View>
      </View>
    );
  }

  const accent      = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
  const accentLight = theme.colors.literacyLight[child.literacyLevel as keyof typeof theme.colors.literacyLight] ?? theme.colors.primary[50];
  const gradient    = (theme.colors.gradients.level[child.literacyLevel] ?? theme.colors.gradients.primary) as [string, string];

  const selectedReport = bimestreReports.find((r) => r.bimestre === selectedBimestre);
  const progressHistory = child.progressHistory ?? [];

  /* Chart data: all history points */
  const chartHistory = progressHistory.length >= 2 ? progressHistory : [];

  return (
    <View style={styles.container}>
      {/* Compact header */}
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerDecor} />
        <Pressable onPress={navigation.goBack} style={styles.headerBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.9)" />
        </Pressable>
        <View style={styles.headerContent}>
          <Avatar name={child.name} size="md" showBorder borderColor="rgba(255,255,255,0.5)" />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{child.name}</Text>
            <Text style={styles.headerSub}>Relatório por bimestre</Text>
          </View>
          <LevelBadge level={child.literacyLevel} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Bimestre selector */}
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 80 }}>
          <View style={styles.selectorCard}>
            <Text style={styles.sectionTitle}>Selecionar bimestre</Text>
            {availableBimestres.length === 0 ? (
              <View style={styles.noDataBox}>
                <Ionicons name="time-outline" size={24} color={theme.colors.neutral[300]} />
                <Text style={styles.noDataText}>Nenhum relatório disponível ainda.</Text>
              </View>
            ) : (
              <BimestreSelector
                available={availableBimestres}
                selected={selectedBimestre}
                accent={accent}
                onSelect={setSelectedBimestre}
              />
            )}
          </View>
        </MotiView>

        {/* Selected bimestre report */}
        {selectedReport ? (
          <MotiView
            key={selectedBimestre}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 120 }}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart" size={16} color={accent} />
              <Text style={styles.sectionTitle}>{BIMESTRE_LABELS[selectedBimestre - 1]} · {selectedReport.year}</Text>
            </View>
            <ReportCard report={selectedReport} accent={accent} accentLight={accentLight} />
          </MotiView>
        ) : null}

        {/* Full progress chart (all bimestres) */}
        {chartHistory.length >= 2 ? (
          <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
            <View style={styles.chartCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={16} color={accent} />
                <Text style={styles.sectionTitle}>Evolução geral</Text>
              </View>
              <LineChart
                data={{
                  labels: chartHistory.map((e) => e.date.slice(5)),
                  datasets: [{ data: chartHistory.map((e) => e.score), strokeWidth: 3 }],
                }}
                width={CHART_WIDTH}
                height={200}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fafaf8',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `${accent}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                  labelColor: () => theme.colors.neutral[500],
                  propsForDots: { r: '5', strokeWidth: '2', stroke: accent },
                }}
                bezier
                style={{ borderRadius: theme.borderRadius.lg, marginLeft: -8 }}
              />
            </View>
          </MotiView>
        ) : null}

        {/* All bimestres summary */}
        {bimestreReports.length > 1 ? (
          <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 260 }}>
            <View style={styles.summaryCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={16} color={accent} />
                <Text style={styles.sectionTitle}>Todos os bimestres</Text>
              </View>
              {bimestreReports.map((r, idx) => {
                const rAccent = theme.colors.literacy[r.finalLevel as keyof typeof theme.colors.literacy] ?? accent;
                return (
                  <Pressable
                    key={r.bimestre}
                    style={[styles.summaryRow, idx === 0 && { borderTopWidth: 0 }]}
                    onPress={() => setSelectedBimestre(r.bimestre)}
                  >
                    <View style={[styles.summaryBimestreBadge, { backgroundColor: accentLight }]}>
                      <Text style={[styles.summaryBimestreText, { color: accent }]}>{r.bimestre}°</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.summaryLevel}>{literacyLevels[r.finalLevel].label}</Text>
                      <Text style={styles.summaryMeta}>{r.sessionsCompleted} sessões · média {r.averageScore} pts</Text>
                    </View>
                    <View style={styles.summaryEvolution}>
                      <Text style={styles.summaryEvolutionValue}>+{r.evolution}</Text>
                      <Text style={styles.summaryEvolutionLabel}>pts</Text>
                    </View>
                    <Ionicons
                      name={selectedBimestre === r.bimestre ? 'chevron-down' : 'chevron-forward'}
                      size={14}
                      color={rAccent}
                    />
                  </Pressable>
                );
              })}
            </View>
          </MotiView>
        ) : null}

        {/* Progress notes */}
        {progressHistory.length > 0 ? (
          <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 320 }}>
            <View style={styles.historyCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={16} color={accent} />
                <Text style={styles.sectionTitle}>Registros com anotações</Text>
              </View>
              {progressHistory
                .filter((e) => !!e.notes)
                .map((entry, idx) => (
                  <View key={`${entry.date}-${idx}`} style={styles.noteRow}>
                    <View style={[styles.noteDot, { backgroundColor: accent }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noteDate}>{formatDate(entry.date)} · {entry.score} pts</Text>
                      <Text style={styles.noteText}>{entry.notes}</Text>
                    </View>
                  </View>
                ))}
              {progressHistory.every((e) => !e.notes) ? (
                <Text style={styles.noNotesText}>Nenhum registro com anotações.</Text>
              ) : null}
            </View>
          </MotiView>
        ) : null}
      </ScrollView>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  /* Header */
  header: {
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -50,
  },
  headerBack: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerInfo: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 18, fontFamily: theme.typography.fonts.primaryExtraBold, color: '#fff' },
  headerSub: { fontSize: 12, fontFamily: theme.typography.fonts.primary, color: 'rgba(255,255,255,0.78)' },

  /* Content */
  content: { padding: 16, gap: 14, paddingBottom: 40 },

  /* Bimestre selector */
  selectorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16, gap: 14,
    borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },
  selectorRow: { flexDirection: 'row', gap: 10 },
  selectorBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5, borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface, gap: 1,
  },
  selectorBtnDisabled: { opacity: 0.4 },
  selectorBtnLabel: {
    fontSize: 18, fontFamily: theme.typography.fonts.primaryExtraBold,
    color: theme.colors.neutral[600],
  },
  selectorBtnSub: {
    fontSize: 10, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[400],
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15, fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.text, flex: 1,
  },

  /* Report card */
  reportCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16, gap: 16,
    borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level2,
  },

  /* Level flow */
  levelFlow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelFlowSide: { flex: 1, gap: 6 },
  levelFlowCap: {
    fontSize: 10, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[400], textAlign: 'center',
  },
  levelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
  },
  levelDot: { width: 7, height: 7, borderRadius: 3.5 },
  levelChipText: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold },
  levelFlowCenter: { alignItems: 'center', gap: 4 },
  arrowGradient: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  arrowNeutral: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.neutral[100],
  },
  leveledUpLabel: { fontSize: 9, fontFamily: theme.typography.fonts.primaryBold, color: '#16a34a' },
  levelSameLabel: { fontSize: 9, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400] },

  /* Stats grid */
  statsGrid: { flexDirection: 'row', gap: 10 },
  statItem: {
    flex: 1, alignItems: 'center', gap: 4,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg, padding: 12,
  },
  statIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 16, fontFamily: theme.typography.fonts.primaryExtraBold },
  statLabel: {
    fontSize: 10, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[500], textAlign: 'center',
  },

  /* Progress section */
  progressSection: { gap: 6 },
  progressLabel: {
    fontSize: 12, fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[500],
  },

  /* Notes */
  notesBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, borderRadius: theme.borderRadius.lg,
  },
  notesText: { flex: 1, fontSize: 13, fontFamily: theme.typography.fonts.primary, lineHeight: 19 },

  /* Chart */
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },

  /* Summary */
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },
  summaryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.colors.neutral[100],
  },
  summaryBimestreBadge: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  summaryBimestreText: { fontSize: 15, fontFamily: theme.typography.fonts.primaryExtraBold },
  summaryLevel: { fontSize: 13, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  summaryMeta: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400] },
  summaryEvolution: { alignItems: 'center' },
  summaryEvolutionValue: { fontSize: 14, fontFamily: theme.typography.fonts.primaryExtraBold, color: '#16a34a' },
  summaryEvolutionLabel: { fontSize: 9, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400] },

  /* History notes */
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16, gap: 4,
    borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },
  noteRow: {
    flexDirection: 'row', gap: 10, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: theme.colors.neutral[100],
  },
  noteDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  noteDate: { fontSize: 12, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  noteText: {
    fontSize: 13, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary, lineHeight: 19, marginTop: 2,
  },
  noNotesText: {
    fontSize: 13, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[400], paddingTop: 8,
  },

  /* No data */
  noDataBox: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  noDataText: {
    fontSize: 13, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[400], textAlign: 'center',
  },

  /* Not found */
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 16 },
  backText: { fontSize: 15, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundEmoji: { fontSize: 48 },
  notFoundText: { fontSize: 16, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.neutral[500] },
});

export default StudentReportScreen;
