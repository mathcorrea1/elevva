import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from '@/components/system/MotiShim';

import { Button } from '@/components/ui/Button';
import { useChild } from '@/hooks/useChild';
import { LiteracyLevel, literacyLevels } from '@/utils/literacy.levels';
import { buildLearningTrails } from '@/utils/trails';
import { theme } from '@/theme';
import type { Child } from '@/@types/navigation';

/* ─── Criteria per level ─── */

const CRITERIA: Record<LiteracyLevel, Array<{ id: string; label: string; description: string }>> = {
  [LiteracyLevel.PRE_SILABICO]: [
    { id: 'c1', label: 'Reconhece letras do alfabeto', description: 'Identifica pelo menos algumas letras pelo nome' },
    { id: 'c2', label: 'Escreve o próprio nome', description: 'Consegue registrar o nome com ou sem apoio' },
    { id: 'c3', label: 'Diferencia letras de números', description: 'Sabe que letras e números são diferentes' },
    { id: 'c4', label: 'Entende função da escrita', description: 'Sabe que o texto comunica algo' },
  ],
  [LiteracyLevel.SILABICO_SEM_VALOR]: [
    { id: 'c1', label: 'Uma letra por sílaba', description: 'Registra uma letra para cada sílaba falada' },
    { id: 'c2', label: 'Segmenta palavras oralmente', description: 'Separa palavras em sílabas ao falar' },
    { id: 'c3', label: 'Tenta representar palavras', description: 'Usa letras mesmo sem valor sonoro correto' },
    { id: 'c4', label: 'Quantidade de letras varia', description: 'Palavras diferentes têm registros com tamanhos diferentes' },
  ],
  [LiteracyLevel.SILABICO_COM_VALOR]: [
    { id: 'c1', label: 'Valor sonoro inicial', description: 'A primeira letra da sílaba corresponde ao som' },
    { id: 'c2', label: 'Lê palavras simples', description: 'Consegue ler algumas palavras conhecidas' },
    { id: 'c3', label: 'Hipóteses fonéticas', description: 'Raciocina sobre sons ao escrever' },
    { id: 'c4', label: 'Reconhece rimas', description: 'Percebe palavras que rimam' },
  ],
  [LiteracyLevel.SILABICO_ALFABETICO]: [
    { id: 'c1', label: 'Mistura sílabas e fonemas', description: 'Algumas sílabas estão completas, outras não' },
    { id: 'c2', label: 'Lê textos simples com apoio', description: 'Lê frases curtas e conhecidas' },
    { id: 'c3', label: 'Escreve palavras completas', description: 'Muitas palavras estão ortograficamente corretas' },
    { id: 'c4', label: 'Compreende o que leu', description: 'Entende o sentido do que leu' },
  ],
  [LiteracyLevel.ALFABETICO]: [
    { id: 'c1', label: 'Leitura autônoma', description: 'Lê textos simples sem apoio' },
    { id: 'c2', label: 'Escrita convencional', description: 'Escreve palavras com ortografia correta na maioria' },
    { id: 'c3', label: 'Produção de texto', description: 'Consegue escrever pequenas frases ou textos' },
    { id: 'c4', label: 'Compreensão leitora', description: 'Interpreta o que lê com autonomia' },
  ],
};

/* ─── Level selector ─── */

const LevelSelector = ({
  selected, onChange,
}: { selected: LiteracyLevel; onChange: (l: LiteracyLevel) => void }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelScroll}>
    {Object.values(LiteracyLevel).map((lvl) => {
      const info = literacyLevels[lvl];
      const color = theme.colors.literacy[lvl as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
      const active = selected === lvl;
      return (
        <Pressable
          key={lvl}
          style={[styles.levelBtn, active && { backgroundColor: color, borderColor: color }]}
          onPress={() => onChange(lvl)}
        >
          <View style={[styles.levelBtnDot, { backgroundColor: active ? '#fff' : color }]} />
          <Text style={[styles.levelBtnText, active && { color: '#fff' }]}>{info.label}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

/* ─── Criteria item ─── */

const CriteriaItem = ({
  criterion, checked, onToggle,
}: { criterion: { id: string; label: string; description: string }; checked: boolean; onToggle: () => void }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 20 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 18 }); }}
      onPress={onToggle}
    >
      <Animated.View style={[styles.criteriaItem, checked && styles.criteriaItemChecked, animStyle]}>
        <View style={[styles.criteriaCheck, checked && styles.criteriaCheckActive]}>
          {checked ? <Ionicons name="checkmark" size={13} color="#fff" /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.criteriaLabel, checked && styles.criteriaLabelChecked]}>{criterion.label}</Text>
          <Text style={styles.criteriaDesc}>{criterion.description}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

/* ─── Score slider (step buttons) ─── */

const ScoreSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const color = value >= 70 ? '#16a34a' : value >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <View style={styles.scoreWrap}>
      <View style={styles.scoreValueRow}>
        <Text style={[styles.scoreValueText, { color }]}>{value}</Text>
        <Text style={styles.scoreSuffix}>pontos</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scoreSteps}>
        {steps.map((s) => (
          <Pressable
            key={s}
            style={[styles.scoreStep, value === s && { backgroundColor: color, borderColor: color }]}
            onPress={() => onChange(s)}
          >
            <Text style={[styles.scoreStepText, value === s && { color: '#fff' }]}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

/* ─── Child selector ─── */

const ChildSelector = ({
  children, selected, onSelect,
}: { children: Child[]; selected: string | null; onSelect: (id: string) => void }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childScroll}>
    {children.map((c) => {
      const accent = theme.colors.literacy[c.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
      const bg = theme.colors.literacyLight[c.literacyLevel as keyof typeof theme.colors.literacyLight] ?? theme.colors.primary[50];
      const active = selected === c.id;
      return (
        <Pressable
          key={c.id}
          style={[styles.childBtn, active && { backgroundColor: accent, borderColor: accent }]}
          onPress={() => onSelect(c.id)}
        >
          <View style={[styles.childBtnAvatar, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : bg }]}>
            <Text style={[styles.childBtnInitial, { color: active ? '#fff' : accent }]}>
              {c.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.childBtnName, active && { color: '#fff' }]} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

/* ─── Main screen ─── */

export const AssessmentScreen = ({ route, navigation }: any) => {
  const preSelectedChildId = route.params?.childId as string | undefined;
  const { children, updateChild } = useChild();

  const [selectedChildId, setSelectedChildId] = useState<string | null>(preSelectedChildId ?? null);
  const [assessLevel, setAssessLevel] = useState<LiteracyLevel>(LiteracyLevel.PRE_SILABICO);
  const [checkedCriteria, setCheckedCriteria] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(50);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const child = children.find((c) => c.id === selectedChildId);
  const criteria = CRITERIA[assessLevel];
  const checkedCount = checkedCriteria.size;
  const totalCriteria = criteria.length;

  const toggleCriteria = (id: string) => {
    setCheckedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const suggestedScore = Math.round((checkedCount / Math.max(1, totalCriteria)) * 100);

  const handleSave = async () => {
    if (!child) return;
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const entry = {
      date: today,
      level: assessLevel,
      score,
      notes: notes.trim() || undefined,
    };
    const updated: Child = {
      ...child,
      literacyLevel: assessLevel,
      progress: score,
      assessmentCompleted: true,
      learningTrails: child.assessmentCompleted
        ? child.learningTrails ?? buildLearningTrails(child.id, assessLevel)
        : buildLearningTrails(child.id, assessLevel),
      progressHistory: [...(child.progressHistory ?? []), entry],
    };
    await updateChild(updated);
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <View style={styles.container}>
        <MotiView from={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }} style={styles.successState}>
          <LinearGradient colors={['#dcfce7', '#bbf7d0']} style={styles.successCircle}>
            <Ionicons name="checkmark-circle" size={52} color="#16a34a" />
          </LinearGradient>
          <Text style={styles.successTitle}>Avaliação registrada!</Text>
          <Text style={styles.successSub}>O progresso de {child?.name} foi atualizado.</Text>
          <Button label="Voltar" onPress={navigation.goBack} />
        </MotiView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#16a34a', '#166534']} style={styles.header}>
        <View style={styles.headerDecor} />
        <Pressable onPress={navigation.goBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.9)" />
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="clipboard" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Nova avaliação</Text>
            <Text style={styles.headerSub}>Registre o nível de alfabetização</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Step 1: Select child */}
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 80 }}>
          <View style={styles.card}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
              <Text style={styles.stepTitle}>Selecionar estudante</Text>
            </View>
            {children.length === 0 ? (
              <Text style={styles.emptyHint}>Nenhum estudante cadastrado.</Text>
            ) : (
              <ChildSelector children={children} selected={selectedChildId} onSelect={setSelectedChildId} />
            )}
          </View>
        </MotiView>

        {/* Step 2: Select level */}
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 140 }}>
          <View style={styles.card}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
              <Text style={styles.stepTitle}>Nível avaliado</Text>
            </View>
            <LevelSelector selected={assessLevel} onChange={(l) => { setAssessLevel(l); setCheckedCriteria(new Set()); }} />
            <View style={styles.levelInfoBox}>
              <Text style={styles.levelInfoText}>{literacyLevels[assessLevel].description}</Text>
            </View>
          </View>
        </MotiView>

        {/* Step 3: Criteria */}
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
          <View style={styles.card}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
              <Text style={styles.stepTitle}>Critérios observados</Text>
              <View style={styles.criteriaCountBadge}>
                <Text style={styles.criteriaCountText}>{checkedCount}/{totalCriteria}</Text>
              </View>
            </View>
            {criteria.map((c, i) => (
              <MotiView key={c.id} from={{ opacity: 0, translateX: -6 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 240 + i * 50 }}>
                <CriteriaItem
                  criterion={c}
                  checked={checkedCriteria.has(c.id)}
                  onToggle={() => toggleCriteria(c.id)}
                />
              </MotiView>
            ))}
            {checkedCount > 0 ? (
              <View style={styles.suggestRow}>
                <Ionicons name="sparkles" size={13} color={theme.colors.secondary[500]} />
                <Text style={styles.suggestText}>Score sugerido pelos critérios: <Text style={{ fontFamily: theme.typography.fonts.primaryBold }}>{suggestedScore} pts</Text></Text>
              </View>
            ) : null}
          </View>
        </MotiView>

        {/* Step 4: Score */}
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 260 }}>
          <View style={styles.card}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View>
              <Text style={styles.stepTitle}>Pontuação final</Text>
            </View>
            <ScoreSelector value={score} onChange={setScore} />
          </View>
        </MotiView>

        {/* Step 5: Notes */}
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 320 }}>
          <View style={styles.card}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>5</Text></View>
              <Text style={styles.stepTitle}>Observações</Text>
              <Text style={styles.optionalLabel}>opcional</Text>
            </View>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notas sobre a avaliação, comportamento, contexto..."
              placeholderTextColor={theme.colors.neutral[400]}
              style={styles.notesInput}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoCapitalize="sentences"
            />
          </View>
        </MotiView>

        {/* Save button */}
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 380 }}>
          <Button
            label={selectedChildId ? `Salvar avaliacao de ${child?.name?.split(' ')[0] ?? ''}` : 'Selecione um estudante'}
            onPress={handleSave}
            loading={saving}
            fullWidth
            disabled={!selectedChildId}
          />
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  /* Header */
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, overflow: 'hidden' },
  headerDecor: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -60,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontFamily: theme.typography.fonts.primaryExtraBold, color: '#fff', letterSpacing: -0.4 },
  headerSub: { fontSize: 12, fontFamily: theme.typography.fonts.primary, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  /* Content */
  content: { padding: 16, gap: 14, paddingBottom: 40 },

  /* Cards */
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl,
    padding: 16, gap: 12,
    borderWidth: 1, borderColor: '#f0edf8', ...theme.shadows.level1,
  },

  /* Step header */
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: 12, fontFamily: theme.typography.fonts.primaryBold, color: '#fff' },
  stepTitle: { fontSize: 15, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.text, flex: 1, letterSpacing: -0.2 },
  optionalLabel: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400] },

  /* Child selector */
  childScroll: { gap: 8, paddingVertical: 4 },
  childBtn: {
    alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5, borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface,
    minWidth: 72,
  },
  childBtnAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  childBtnInitial: { fontSize: 16, fontFamily: theme.typography.fonts.primaryExtraBold },
  childBtnName: { fontSize: 11, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.neutral[600] },

  /* Level selector */
  levelScroll: { gap: 8, paddingVertical: 2 },
  levelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5, borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface,
  },
  levelBtnDot: { width: 7, height: 7, borderRadius: 3.5 },
  levelBtnText: { fontSize: 12, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.neutral[600] },
  levelInfoBox: {
    backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.lg,
    padding: 10,
  },
  levelInfoText: { fontSize: 12, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[600], lineHeight: 18 },

  /* Criteria */
  criteriaCountBadge: {
    backgroundColor: theme.colors.primary[50], borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  criteriaCountText: { fontSize: 11, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.primary[600] },
  criteriaItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 10, paddingHorizontal: 10,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface,
    marginBottom: 4,
  },
  criteriaItemChecked: {
    backgroundColor: '#f0fdf4', borderColor: '#86efac',
  },
  criteriaCheck: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: theme.colors.neutral[300],
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  criteriaCheckActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  criteriaLabel: { fontSize: 13, fontFamily: theme.typography.fonts.primarySemiBold, color: theme.colors.text },
  criteriaLabelChecked: { color: '#166534' },
  criteriaDesc: { fontSize: 11, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500], lineHeight: 16, marginTop: 2 },
  suggestRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.secondary[50], padding: 10,
    borderRadius: theme.borderRadius.lg,
  },
  suggestText: { fontSize: 12, fontFamily: theme.typography.fonts.primary, color: theme.colors.secondary[600] },

  /* Score */
  scoreWrap: { gap: 12 },
  scoreValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, justifyContent: 'center' },
  scoreValueText: { fontSize: 44, fontFamily: theme.typography.fonts.primaryExtraBold, letterSpacing: -1 },
  scoreSuffix: { fontSize: 14, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500] },
  scoreSteps: { gap: 6, paddingVertical: 4 },
  scoreStep: {
    width: 42, height: 36, borderRadius: theme.borderRadius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface,
  },
  scoreStepText: { fontSize: 12, fontFamily: theme.typography.fonts.primaryBold, color: theme.colors.neutral[600] },

  /* Notes */
  notesInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: theme.colors.neutral[200],
    padding: 12,
    fontSize: 14, fontFamily: theme.typography.fonts.primary,
    color: theme.colors.text,
    minHeight: 80,
  },

  /* Success state */
  successState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  successCircle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 22, fontFamily: theme.typography.fonts.primaryExtraBold, color: theme.colors.text, letterSpacing: -0.4 },
  successSub: { fontSize: 14, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[500], textAlign: 'center', lineHeight: 21 },

  /* Empty */
  emptyHint: { fontSize: 13, fontFamily: theme.typography.fonts.primary, color: theme.colors.neutral[400] },
});

export default AssessmentScreen;
