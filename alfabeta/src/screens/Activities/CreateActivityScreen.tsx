import React, { useMemo, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { MotiView } from '@/components/system/MotiShim';
import { Avatar } from '@/components/ui/Avatar';
import { useChildStore } from '@/store/child.store';
import { LiteracyLevel, literacyLevels } from '@/utils/literacy.levels';
import { theme } from '@/theme';
import type { ChildActivity } from '@/@types/navigation';

type ActivityType = 'audio' | 'writing' | 'reading' | 'game';

const TYPE_META: Record<ActivityType, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  audio:   { label: 'Áudio',   icon: 'mic',            color: '#7c3aed', bg: '#ede9fe' },
  writing: { label: 'Escrita', icon: 'pencil',          color: '#0284c7', bg: '#dbeafe' },
  reading: { label: 'Leitura', icon: 'book',            color: '#16a34a', bg: '#dcfce7' },
  game:    { label: 'Jogo',    icon: 'game-controller', color: '#ea580c', bg: '#fff7ed' },
};

const LEVELS = Object.values(LiteracyLevel);

export const CreateActivityScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const preChildId: string | undefined = route.params?.childId;

  const { children, updateChild } = useChildStore();

  const [selectedChildId, setSelectedChildId] = useState<string>(preChildId ?? children[0]?.id ?? '');
  const [activityType, setActivityType] = useState<ActivityType>('reading');
  const [title, setTitle] = useState('');
  const [phrase, setPhrase] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LiteracyLevel | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedChild = useMemo(
    () => children.find((c) => c.id === selectedChildId),
    [children, selectedChildId],
  );

  const effectiveLevel = selectedLevel ?? selectedChild?.literacyLevel ?? LiteracyLevel.PRE_SILABICO;

  const handleSave = async () => {
    if (!selectedChild || !title.trim()) return;
    setSaving(true);
    const newActivity: ChildActivity = {
      id: `act-${Date.now()}`,
      title: title.trim(),
      type: activityType,
      completed: false,
      level: effectiveLevel,
      phrase: phrase.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    await updateChild({
      ...selectedChild,
      activities: [...(selectedChild.activities ?? []), newActivity],
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigation.goBack(), 1400);
  };

  if (saved) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <MotiView
          from={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 200 }}
          style={styles.successBox}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={56} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>Atividade criada!</Text>
          <Text style={styles.successSub}>
            Adicionada ao perfil de {selectedChild?.name?.split(' ')[0]}
          </Text>
        </MotiView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Nova Atividade</Text>
          <Text style={styles.headerSub}>Crie uma atividade personalizada</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="pencil" size={22} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Para quem ── */}
        <SectionLabel icon="people" label="Para quem?" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScrollContent}>
          {children.map((child) => {
            const isSelected = child.id === selectedChildId;
            const accent = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
            return (
              <Pressable
                key={child.id}
                onPress={() => { setSelectedChildId(child.id); setSelectedLevel(null); }}
                style={[styles.childChip, isSelected && { borderColor: accent, borderWidth: 2, backgroundColor: '#fff' }]}
              >
                <Avatar name={child.name} size="sm" showBorder={isSelected} borderColor={accent} />
                <Text style={[styles.childChipName, isSelected && { color: accent }]} numberOfLines={1}>
                  {child.name.split(' ')[0]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Tipo ── */}
        <SectionLabel icon="layers" label="Tipo de atividade" />
        <View style={styles.typeGrid}>
          {(Object.keys(TYPE_META) as ActivityType[]).map((t) => {
            const meta = TYPE_META[t];
            const isSelected = activityType === t;
            return (
              <Pressable
                key={t}
                onPress={() => setActivityType(t)}
                style={[
                  styles.typeCard,
                  isSelected && { backgroundColor: meta.bg, borderColor: meta.color, borderWidth: 2 },
                ]}
              >
                <Ionicons
                  name={meta.icon}
                  size={22}
                  color={isSelected ? meta.color : theme.colors.neutral[400]}
                />
                <Text style={[styles.typeLabel, isSelected && { color: meta.color }]}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Título ── */}
        <SectionLabel icon="create" label="Título da atividade" />
        <TextInput
          style={styles.textInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Leitura de sílabas com 'B'"
          placeholderTextColor={theme.colors.neutral[400]}
          maxLength={80}
          returnKeyType="next"
        />

        {/* ── Nível ── */}
        <SectionLabel icon="bar-chart" label="Nível de alfabetização" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScrollContent}>
          {LEVELS.map((lvl) => {
            const accent = theme.colors.literacy[lvl as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600];
            const accentLight = theme.colors.literacyLight[lvl as keyof typeof theme.colors.literacyLight] ?? theme.colors.primary[100];
            const isSelected = effectiveLevel === lvl;
            const isDefault = lvl === selectedChild?.literacyLevel && selectedLevel === null;
            return (
              <Pressable
                key={lvl}
                onPress={() => setSelectedLevel(lvl)}
                style={[
                  styles.levelChip,
                  isSelected && { backgroundColor: accentLight, borderColor: accent, borderWidth: 2 },
                ]}
              >
                {isDefault && !isSelected ? <View style={[styles.defaultDot, { backgroundColor: accent }]} /> : null}
                <Text style={[styles.levelChipText, isSelected && { color: accent }]}>
                  {literacyLevels[lvl]?.label ?? lvl}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Conteúdo ── */}
        <SectionLabel
          icon="chatbubble-ellipses"
          label={activityType === 'audio' ? 'Frase para leitura em voz alta' : 'Instruções / conteúdo'}
        />
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={phrase}
          onChangeText={setPhrase}
          placeholder={
            activityType === 'audio'
              ? 'Digite a frase que a criança irá ler em voz alta...'
              : 'Descreva o que a criança deve fazer nesta atividade...'
          }
          placeholderTextColor={theme.colors.neutral[400]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={400}
        />

        {/* ── Salvar ── */}
        <Pressable
          onPress={handleSave}
          disabled={saving || !title.trim() || !selectedChildId}
          style={[
            styles.saveBtn,
            (!title.trim() || !selectedChildId) && styles.saveBtnDisabled,
          ]}
        >
          <LinearGradient
            colors={['#7c3aed', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>
              {saving ? 'Salvando...' : 'Criar atividade'}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const SectionLabel = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => (
  <View style={styles.sectionLabel}>
    <Ionicons name={icon} size={13} color={theme.colors.primary[500]} />
    <Text style={styles.sectionLabelText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 52,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: '#fff',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.primaryMedium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  headerIcon: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 56, gap: 8 },

  sectionLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 14, marginBottom: 6,
  },
  sectionLabelText: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  hScrollContent: { gap: 10, paddingBottom: 4 },

  childChip: {
    alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    minWidth: 68,
  },
  childChipName: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[600],
    maxWidth: 60,
    textAlign: 'center',
  },

  typeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  typeCard: {
    width: '47%',
    alignItems: 'center', gap: 6,
    paddingVertical: 14, paddingHorizontal: 10,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
  },
  typeLabel: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[500],
  },

  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 108,
    paddingTop: 13,
    textAlignVertical: 'top',
  },

  levelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
  },
  levelChipText: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[500],
  },
  defaultDot: { width: 6, height: 6, borderRadius: 3 },

  saveBtn: { marginTop: 20, borderRadius: theme.borderRadius.full, overflow: 'hidden' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.primaryBold,
    color: '#fff',
  },

  successContainer: { justifyContent: 'center', alignItems: 'center' },
  successBox: {
    alignItems: 'center', gap: 14,
    padding: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    margin: 32,
    ...theme.shadows.level3,
  },
  successIcon: {
    width: 88, height: 88,
    borderRadius: 44,
    backgroundColor: '#dcfce7',
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  successSub: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.primaryMedium,
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
});

export default CreateActivityScreen;
