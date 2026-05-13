import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useChild } from '@/hooks/useChild';
import { theme } from '@/theme';
import { getOrCreateChildTrails, hasCompletedAssessment, trailAreaLabels } from '@/utils/trails';

import { CheckCircle2, CircleDashed, Compass, Lock, PlayCircle, Sparkles } from 'lucide-react-native';

const statusMeta = {
  locked: { label: 'Bloqueada', color: '#6b7280', icon: Lock },
  'not-started': { label: 'Nao iniciada', color: '#2563eb', icon: CircleDashed },
  'in-progress': { label: 'Em andamento', color: '#d97706', icon: PlayCircle },
  completed: { label: 'Concluida', color: '#16a34a', icon: CheckCircle2 },
} as const;

export const TrailListScreen = ({ navigation, route }: any) => {
  const childId = route.params?.childId as string;
  const { children, updateChild } = useChild();

  const child = children.find((item) => item.id === childId);

  const assessmentDone = useMemo(() => {
    if (!child) return false;
    return hasCompletedAssessment(child);
  }, [child]);

  const trails = useMemo(() => {
    if (!child) return [];
    return getOrCreateChildTrails(child);
  }, [child]);

  const completedCount = trails.filter((trail) => trail.status === 'completed').length;

  const handleStartAssessment = () => {
    navigation.navigate('Assessment', { childId });
  };

  const handleOpenTrail = (trailId: string) => {
    navigation.navigate('TrailDetail', { childId, trailId });
  };

  useEffect(() => {
    if (!child || child.learningTrails?.length) return;
    void updateChild({
      ...child,
      learningTrails: trails,
    });
  }, [child, trails, updateChild]);

  if (!child) {
    return (
      <View style={styles.container}>
        <Header title="Trilhas" showBack onBack={navigation.goBack} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Estudante nao encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Trilhas de aprendizagem"
        subtitle={child.name}
        showBack
        onBack={navigation.goBack}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Sparkles size={18} color={theme.colors.primary[600]} />
            <Text style={styles.highlightTitle}>Fluxo guiado por avaliacao</Text>
          </View>
          <Text style={styles.highlightText}>
            A avaliacao inicial define o ponto de partida do estudante. Depois disso, as trilhas sao liberadas em sequencia para evolucao consistente.
          </Text>
          <View style={styles.highlightFooter}>
            <Text style={styles.highlightMetric}>{completedCount}/{trails.length} trilhas concluidas</Text>
            {!assessmentDone ? <Text style={styles.blockLabel}>Avaliacao pendente</Text> : null}
          </View>
        </View>

        <View style={[styles.trailCard, !assessmentDone && styles.assessmentUrgentCard]}>
          <View style={styles.trailTop}>
            <View style={[styles.iconBubble, { backgroundColor: '#dcfce7' }]}>
              <Compass size={18} color="#15803d" />
            </View>
            <View style={styles.trailMain}>
              <Text style={styles.trailTitle}>Avaliacao inicial obrigatoria</Text>
              <Text style={styles.trailSubtitle}>
                {assessmentDone
                  ? 'Concluida. Trilhas personalizadas liberadas.'
                  : 'Primeiro passo para todas as pessoas estudantes.'}
              </Text>
            </View>
          </View>

          {!assessmentDone ? (
            <Button label="Iniciar avaliacao" onPress={handleStartAssessment} fullWidth />
          ) : (
            <View style={styles.doneRow}>
              <CheckCircle2 size={16} color="#16a34a" />
              <Text style={styles.doneText}>Avaliacao concluida</Text>
            </View>
          )}
        </View>

        {trails.map((trail) => {
          const meta = statusMeta[trail.status];
          const Icon = meta.icon;
          const blockedByAssessment = !assessmentDone;

          return (
            <Pressable
              key={trail.id}
              style={[styles.trailCard, blockedByAssessment && styles.lockedByAssessmentCard]}
              disabled={blockedByAssessment}
              onPress={() => handleOpenTrail(trail.id)}
            >
              <View style={styles.trailTop}>
                <View style={[styles.iconBubble, { backgroundColor: `${meta.color}20` }]}> 
                  <Icon size={18} color={meta.color} />
                </View>
                <View style={styles.trailMain}>
                  <Text style={styles.trailTitle}>{trail.title}</Text>
                  <Text style={styles.trailSubtitle}>{trailAreaLabels[trail.area]}</Text>
                </View>
                <View style={[styles.statusChip, { borderColor: `${meta.color}66` }]}>
                  <Text style={[styles.statusChipText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>

              <Text style={styles.trailDescription}>{trail.description}</Text>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round((trail.currentStep / Math.max(1, trail.totalSteps)) * 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>{trail.currentStep}/{trail.totalSteps} etapas concluidas</Text>

              {blockedByAssessment ? (
                <View style={styles.blockRow}>
                  <Lock size={14} color={theme.colors.neutral[500]} />
                  <Text style={styles.blockText}>Disponivel apos avaliacao inicial</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 30 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: theme.typography.fonts.primaryBold, fontSize: 16, color: theme.colors.text },

  highlightCard: {
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    gap: 10,
  },
  highlightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  highlightTitle: { fontFamily: theme.typography.fonts.primaryBold, fontSize: 14, color: theme.colors.primary[700] },
  highlightText: { fontFamily: theme.typography.fonts.primary, fontSize: 13, lineHeight: 20, color: theme.colors.neutral[600] },
  highlightFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  highlightMetric: { fontFamily: theme.typography.fonts.primarySemiBold, fontSize: 12, color: theme.colors.primary[700] },
  blockLabel: {
    fontFamily: theme.typography.fonts.primaryBold,
    fontSize: 11,
    color: '#b45309',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },

  trailCard: {
    borderRadius: theme.borderRadius.xl,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    gap: 10,
  },
  assessmentUrgentCard: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  lockedByAssessmentCard: {
    opacity: 0.74,
  },
  trailTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailMain: { flex: 1, gap: 2 },
  trailTitle: { fontFamily: theme.typography.fonts.primaryBold, fontSize: 14, color: theme.colors.text },
  trailSubtitle: { fontFamily: theme.typography.fonts.primary, fontSize: 12, color: theme.colors.neutral[500] },
  trailDescription: { fontFamily: theme.typography.fonts.primary, fontSize: 13, lineHeight: 19, color: theme.colors.neutral[600] },

  statusChip: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusChipText: { fontFamily: theme.typography.fonts.primarySemiBold, fontSize: 11 },

  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.neutral[100],
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.primary[600],
  },
  progressText: { fontFamily: theme.typography.fonts.primaryMedium, fontSize: 12, color: theme.colors.neutral[500] },

  blockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  blockText: { fontFamily: theme.typography.fonts.primary, fontSize: 12, color: theme.colors.neutral[500] },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  doneText: { fontFamily: theme.typography.fonts.primarySemiBold, fontSize: 13, color: '#15803d' },
});

export default TrailListScreen;
