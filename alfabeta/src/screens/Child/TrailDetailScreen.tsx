import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useChild } from '@/hooks/useChild';
import { theme } from '@/theme';
import { completeTrailTask, getOrCreateChildTrails, hasCompletedAssessment, trailAreaLabels } from '@/utils/trails';

import { Check, CheckCircle2, Circle, Clock3, Lock, Target } from 'lucide-react-native';

export const TrailDetailScreen = ({ navigation, route }: any) => {
  const childId = route.params?.childId as string;
  const trailId = route.params?.trailId as string;
  const { children, updateChild } = useChild();

  const child = children.find((item) => item.id === childId);

  const trails = useMemo(() => {
    if (!child) return [];
    return getOrCreateChildTrails(child);
  }, [child]);

  const trail = trails.find((item) => item.id === trailId);

  if (!child || !trail) {
    return (
      <View style={styles.container}>
        <Header title="Trilha" showBack onBack={navigation.goBack} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Trilha nao encontrada</Text>
        </View>
      </View>
    );
  }

  const assessmentDone = hasCompletedAssessment(child);
  const blocked = !assessmentDone || trail.status === 'locked';

  const completeTask = async (taskId: string) => {
    if (blocked) return;

    const updatedTrails = completeTrailTask(trails, trail.id, taskId);

    await updateChild({
      ...child,
      learningTrails: updatedTrails,
    });
  };

  const completionPercent = Math.round((trail.currentStep / Math.max(1, trail.totalSteps)) * 100);

  const completeCurrentTrail = async () => {
    const pending = trail.tasks.filter((task) => !task.completed);

    if (!pending.length) return;

    const updatedTrails = pending.reduce(
      (acc, task) => completeTrailTask(acc, trail.id, task.id),
      trails,
    );

    await updateChild({
      ...child,
      learningTrails: updatedTrails,
    });

    Alert.alert('Etapas concluídas', 'A trilha foi marcada como concluida e a proxima foi liberada.');
  };

  return (
    <View style={styles.container}>
      <Header
        title={trail.title}
        subtitle={`${child.name} • ${trailAreaLabels[trail.area]}`}
        showBack
        onBack={navigation.goBack}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryIconWrap}>
              <Target size={18} color={theme.colors.primary[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>{trail.description}</Text>
              <Text style={styles.summarySub}>{trail.currentStep}/{trail.totalSteps} etapas concluidas</Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentBadgeText}>{completionPercent}%</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
          </View>

          {blocked ? (
            <View style={styles.blockedBox}>
              <Lock size={16} color="#6b7280" />
              <Text style={styles.blockedText}>
                {assessmentDone
                  ? 'Conclua a trilha anterior para liberar esta etapa.'
                  : 'Realize a avaliacao inicial para iniciar as trilhas.'}
              </Text>
            </View>
          ) : null}
        </View>

        {trail.tasks.map((task, index) => (
          <Pressable
            key={task.id}
            onPress={() => void completeTask(task.id)}
            disabled={blocked || task.completed}
            style={[styles.taskCard, task.completed && styles.taskDone, blocked && styles.taskBlocked]}
          >
            <View style={styles.taskHeader}>
              <View style={[styles.stepBadge, task.completed && styles.stepBadgeDone]}>
                <Text style={[styles.stepBadgeText, task.completed && styles.stepBadgeTextDone]}>{index + 1}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
              </View>

              <View style={styles.taskRight}>
                <View style={styles.timeRow}>
                  <Clock3 size={13} color={theme.colors.neutral[500]} />
                  <Text style={styles.timeText}>{task.estimatedMinutes} min</Text>
                </View>

                {task.completed ? (
                  <CheckCircle2 size={18} color="#16a34a" />
                ) : blocked ? (
                  <Lock size={16} color={theme.colors.neutral[400]} />
                ) : (
                  <Circle size={18} color={theme.colors.primary[600]} />
                )}
              </View>
            </View>

            {task.completed ? (
              <View style={styles.doneTaskRow}>
                <Check size={13} color="#15803d" />
                <Text style={styles.doneTaskText}>Etapa concluida</Text>
              </View>
            ) : null}
          </Pressable>
        ))}

        {!blocked && trail.status !== 'completed' ? (
          <Button
            label="Concluir trilha rapidamente"
            onPress={() => void completeCurrentTrail()}
            fullWidth
            variant="secondary"
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 30 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: theme.typography.fonts.primaryBold, fontSize: 16, color: theme.colors.text },

  summaryCard: {
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    padding: 14,
    gap: 12,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: { fontFamily: theme.typography.fonts.primarySemiBold, fontSize: 13, color: theme.colors.text },
  summarySub: { fontFamily: theme.typography.fonts.primary, fontSize: 12, color: theme.colors.neutral[500] },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
  },
  percentBadgeText: { fontFamily: theme.typography.fonts.primaryBold, fontSize: 11, color: theme.colors.primary[700] },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[100],
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.primary[600],
  },

  blockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.neutral[100],
    padding: 10,
  },
  blockedText: { flex: 1, fontFamily: theme.typography.fonts.primary, fontSize: 12, color: theme.colors.neutral[600] },

  taskCard: {
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    padding: 14,
    gap: 8,
  },
  taskDone: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  taskBlocked: { opacity: 0.75 },
  taskHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepBadgeDone: {
    backgroundColor: '#16a34a',
  },
  stepBadgeText: { fontFamily: theme.typography.fonts.primaryBold, fontSize: 12, color: theme.colors.primary[700] },
  stepBadgeTextDone: { color: '#fff' },

  taskTitle: { fontFamily: theme.typography.fonts.primaryBold, fontSize: 14, color: theme.colors.text },
  taskDescription: { fontFamily: theme.typography.fonts.primary, fontSize: 12, color: theme.colors.neutral[600], lineHeight: 18, marginTop: 2 },
  taskRight: { alignItems: 'flex-end', gap: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontFamily: theme.typography.fonts.primaryMedium, fontSize: 11, color: theme.colors.neutral[500] },

  doneTaskRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  doneTaskText: { fontFamily: theme.typography.fonts.primarySemiBold, fontSize: 12, color: '#15803d' },
});

export default TrailDetailScreen;
