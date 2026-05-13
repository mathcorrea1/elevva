import React, { useEffect, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useChild } from '@/hooks/useChild';
import { LiteracyLevel, literacyLevels } from '@/utils/literacy.levels';
import { theme } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ─── Level order ─── */

const LEVEL_ORDER = [
  LiteracyLevel.PRE_SILABICO,
  LiteracyLevel.SILABICO_SEM_VALOR,
  LiteracyLevel.SILABICO_COM_VALOR,
  LiteracyLevel.SILABICO_ALFABETICO,
  LiteracyLevel.ALFABETICO,
];

/* ─── Special needs summary ─── */

const NEEDS_META: Array<{ key: string; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = [
  { key: 'autism',             label: 'TEA',         icon: 'sparkles',    color: '#7c3aed', bg: '#f3e8ff' },
  { key: 'dyslexia',          label: 'Dislexia',    icon: 'document-text',color: '#0284c7', bg: '#dbeafe' },
  { key: 'adhd',              label: 'TDAH',         icon: 'flash',       color: '#ea580c', bg: '#ffedd5' },
  { key: 'dyscalculia',       label: 'Discal.',     icon: 'calculator',  color: '#d97706', bg: '#fef3c7' },
  { key: 'visualImpairment',  label: 'Visual',      icon: 'eye-off',     color: '#16a34a', bg: '#dcfce7' },
  { key: 'hearingImpairment', label: 'Auditivo',    icon: 'ear',         color: '#0e7490', bg: '#cffafe' },
];

/* ─── Main screen ─── */

export const ReportScreen = () => {
  const nav = useNavigation<any>();
  const { children, fetchChildren } = useChild();

  useEffect(() => { void fetchChildren(); }, [fetchChildren]);

  /* Aggregate stats */
  const stats = useMemo(() => {
    const total = children.length;
    if (total === 0) return null;

    const avgProgress = Math.round(children.reduce((sum, c) => sum + c.progress, 0) / total);

    const byLevel = LEVEL_ORDER.map((lvl) => ({
      level: lvl,
      count: children.filter((c) => c.literacyLevel === lvl).length,
    }));

    const needsCount: Record<string, number> = {};
    children.forEach((c) => {
      const needs = c.specialNeeds ?? {};
      NEEDS_META.forEach((n) => {
        if ((needs as any)[n.key] === true) {
          needsCount[n.key] = (needsCount[n.key] ?? 0) + 1;
        }
      });
    });

    const completedActivities = children.reduce((sum, c) => sum + c.activities.filter((a) => a.completed).length, 0);
    const totalActivities = children.reduce((sum, c) => sum + c.activities.length, 0);

    /* Alunos com menor progresso (atenção necessária) */
    const needsAttention = [...children].sort((a, b) => a.progress - b.progress).slice(0, 3);

    /* Alunos com maior evolução no último bimestre */
    const topEvolution = [...children]
      .map((c) => ({ child: c, evolution: c.bimestreReports?.at(-1)?.evolution ?? 0 }))
      .filter((x) => x.evolution > 0)
      .sort((a, b) => b.evolution - a.evolution)
      .slice(0, 3);

    return { total, avgProgress, byLevel, needsCount, completedActivities, totalActivities, needsAttention, topEvolution };
  }, [children]);

  const navigateToStudent = (childId: string) =>
    nav.navigate('Children', { screen: 'StudentReport', params: { childId } });

  return (
    <View style={styles.container}>
      <Header title="Relatórios" subtitle="Visão geral da turma" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Summary hero */}
        <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 80 }}>
          <LinearGradient
            colors={theme.colors.gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroDecorCircle} />
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stats?.total ?? 0}</Text>
                <Text style={styles.heroStatLabel}>Alunos</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stats?.avgProgress ?? 0}%</Text>
                <Text style={styles.heroStatLabel}>Média geral</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stats?.completedActivities ?? 0}</Text>
                <Text style={styles.heroStatLabel}>Atividades</Text>
              </View>
            </View>
            <View style={styles.heroProgressWrap}>
              <Text style={styles.heroProgressLabel}>Progresso médio da turma</Text>
              <View style={styles.heroProgressBar}>
                <View style={[styles.heroProgressFill, { width: `${stats?.avgProgress ?? 0}%` }]} />
              </View>
            </View>
          </LinearGradient>
        </MotiView>

        {/* Level distribution */}
        {stats && (
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 160 }}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="bar-chart" size={16} color={theme.colors.primary[600]} />
                <Text style={styles.cardTitle}>Distribuição por nível</Text>
              </View>

              {/* Visual level bars */}
              <View style={styles.levelBars}>
                {stats.byLevel.map(({ level, count }) => {
                  const color = theme.colors.literacy[level as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
                  const lightColor = theme.colors.literacyLight[level as keyof typeof theme.colors.literacyLight] ?? theme.colors.primary[50];
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <View key={level} style={styles.levelBarRow}>
                      <Text style={styles.levelBarLabel} numberOfLines={1}>
                        {literacyLevels[level as LiteracyLevel].label}
                      </Text>
                      <View style={styles.levelBarTrack}>
                        <View style={[styles.levelBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                      </View>
                      <View style={[styles.levelCountBadge, { backgroundColor: lightColor }]}>
                        <Text style={[styles.levelCountText, { color }]}>{count}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </MotiView>
        )}

        {/* Special needs overview */}
        {stats && Object.keys(stats.needsCount).length > 0 ? (
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 240 }}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="accessibility" size={16} color={theme.colors.primary[600]} />
                <Text style={styles.cardTitle}>Necessidades especiais</Text>
              </View>
              <View style={styles.needsGrid}>
                {NEEDS_META.filter((n) => (stats.needsCount[n.key] ?? 0) > 0).map((n) => (
                  <View key={n.key} style={[styles.needsCard, { backgroundColor: n.bg }]}>
                    <View style={[styles.needsIconBox, { backgroundColor: n.color }]}>
                      <Ionicons name={n.icon} size={14} color="#fff" />
                    </View>
                    <Text style={[styles.needsCount, { color: n.color }]}>{stats.needsCount[n.key]}</Text>
                    <Text style={[styles.needsLabel, { color: n.color }]}>{n.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </MotiView>
        ) : null}

        {/* Students needing attention */}
        {stats && stats.needsAttention.length > 0 ? (
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 320 }}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.secondary[500]} />
                <Text style={styles.cardTitle}>Atenção prioritária</Text>
                <Text style={styles.cardSubtitle}>Menor progresso</Text>
              </View>
              {stats.needsAttention.map((child, idx) => {
                const accent = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
                const gradient = theme.colors.gradients.level[child.literacyLevel] ?? theme.colors.gradients.primary;
                return (
                  <MotiView
                    key={child.id}
                    from={{ opacity: 0, translateX: -10 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 320 + idx * 60 }}
                  >
                    <Pressable style={styles.studentRow} onPress={() => navigateToStudent(child.id)}>
                      <Avatar name={child.name} size="sm" showBorder borderColor={accent} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentName}>{child.name}</Text>
                        <ProgressBar value={child.progress} color={gradient[0]} colorEnd={gradient[1]} height={5} />
                      </View>
                      <Text style={[styles.studentProgress, { color: accent }]}>{child.progress}%</Text>
                      <Ionicons name="chevron-forward" size={14} color={theme.colors.neutral[400]} />
                    </Pressable>
                  </MotiView>
                );
              })}
            </View>
          </MotiView>
        ) : null}

        {/* Top evolution */}
        {stats && stats.topEvolution.length > 0 ? (
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 400 }}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="trending-up" size={16} color="#16a34a" />
                <Text style={styles.cardTitle}>Maior evolução</Text>
                <Text style={styles.cardSubtitle}>Último bimestre</Text>
              </View>
              {stats.topEvolution.map(({ child, evolution }, idx) => {
                const accent = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
                return (
                  <MotiView
                    key={child.id}
                    from={{ opacity: 0, translateX: -10 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 400 + idx * 60 }}
                  >
                    <Pressable style={styles.studentRow} onPress={() => navigateToStudent(child.id)}>
                      <View style={styles.rankCircle}>
                        <Text style={styles.rankText}>{idx + 1}</Text>
                      </View>
                      <Avatar name={child.name} size="sm" showBorder borderColor={accent} />
                      <Text style={[styles.studentName, { flex: 1 }]}>{child.name}</Text>
                      <View style={styles.evolutionBadge}>
                        <Ionicons name="arrow-up" size={11} color="#16a34a" />
                        <Text style={styles.evolutionText}>+{evolution} pts</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={theme.colors.neutral[400]} />
                    </Pressable>
                  </MotiView>
                );
              })}
            </View>
          </MotiView>
        ) : null}

        {/* All students quick access */}
        {children.length > 0 ? (
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 480 }}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="people" size={16} color={theme.colors.primary[600]} />
                <Text style={styles.cardTitle}>Relatórios individuais</Text>
              </View>
              {children.map((child) => {
                const accent = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
                const lastReport = child.bimestreReports?.at(-1);
                return (
                  <Pressable key={child.id} style={styles.allStudentRow} onPress={() => navigateToStudent(child.id)}>
                    <Avatar name={child.name} size="sm" showBorder borderColor={accent} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.studentName}>{child.name}</Text>
                      {lastReport ? (
                        <Text style={styles.lastReportMeta}>
                          {lastReport.bimestre}° Bim · +{lastReport.evolution} pts · {lastReport.sessionsCompleted} sessões
                        </Text>
                      ) : null}
                    </View>
                    <View style={[styles.progressPill, { backgroundColor: `${accent}22` }]}>
                      <Text style={[styles.progressPillText, { color: accent }]}>{child.progress}%</Text>
                    </View>
                    <Ionicons name="document-text-outline" size={16} color={theme.colors.neutral[400]} />
                  </Pressable>
                );
              })}
            </View>
          </MotiView>
        ) : null}

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={44} color={theme.colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Sem dados ainda</Text>
            <Text style={styles.emptyDesc}>Adicione alunos para ver os relatórios da turma.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 14, paddingBottom: 32 },

  /* Hero */
  hero: {
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    gap: 16,
    overflow: 'hidden',
    ...theme.shadows.level3,
  },
  heroDecorCircle: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -60,
  },
  heroStats: { flexDirection: 'row', justifyContent: 'space-around' },
  heroStat: { alignItems: 'center', gap: 3 },
  heroStatValue: { fontSize: 30, fontFamily: theme.typography.fonts.primaryExtraBold, color: '#fff' },
  heroStatLabel: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: 'rgba(255,255,255,0.72)' },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'stretch' },
  heroProgressWrap: { gap: 6 },
  heroProgressLabel: {
    fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold,
    color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.6,
  },
  heroProgressBar: {
    height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden',
  },
  heroProgressFill: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.85)' },

  /* Cards */
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16, gap: 14,
    borderWidth: 1, borderColor: '#f0edf8',
    ...theme.shadows.level1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.text, flex: 1 },
  cardSubtitle: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400] },

  /* Level distribution */
  levelBars: { gap: 10 },
  levelBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBarLabel: {
    width: 90, fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[600],
  },
  levelBarTrack: {
    flex: 1, height: 8, borderRadius: 4,
    backgroundColor: theme.colors.neutral[100], overflow: 'hidden',
  },
  levelBarFill: { height: 8, borderRadius: 4, minWidth: 4 },
  levelCountBadge: {
    width: 28, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  levelCountText: { fontSize: 11, fontFamily: theme.typography.fonts.primaryBold },

  /* Special needs */
  needsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  needsCard: {
    width: (SCREEN_WIDTH - 32 - 10 * 2 - 10 * 2) / 3,
    borderRadius: theme.borderRadius.lg,
    padding: 10, alignItems: 'center', gap: 4,
  },
  needsIconBox: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  needsCount: { fontSize: 18, fontFamily: theme.typography.fonts.primaryExtraBold },
  needsLabel: { fontSize: 10, fontFamily: theme.typography.fonts.primarySemiBold, textAlign: 'center' },

  /* Student rows */
  studentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.colors.neutral[100],
  },
  allStudentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.colors.neutral[100],
  },
  studentName: { fontSize: 14, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  studentProgress: { fontSize: 13, fontFamily: theme.typography.fonts.primaryExtraBold },
  lastReportMeta: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400] },

  /* Rank */
  rankCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: theme.colors.primary[50], alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 11, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.primary[600] },

  /* Evolution badge */
  evolutionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  evolutionText: { fontSize: 11, fontFamily: theme.typography.fonts.primaryBold, color: '#16a34a' },

  /* Progress pill */
  progressPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.borderRadius.full },
  progressPillText: { fontSize: 11, fontFamily: theme.typography.fonts.primaryBold },

  /* Empty */
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 60, gap: 12,
  },
  emptyTitle: { fontSize: 16, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.neutral[500] },
  emptyDesc: {
    fontSize: 13, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[400], textAlign: 'center', paddingHorizontal: 32,
  },
});

export default ReportScreen;

