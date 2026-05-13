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
import { theme } from '@/theme';
import type { IndividualGuidance } from '@/@types/navigation';

type GuidanceCategory = 'phonological' | 'reading' | 'writing' | 'emotional' | 'family' | 'school';

const CATEGORY_META: Record<
  GuidanceCategory,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  phonological: { label: 'Fonológico', icon: 'ear',           color: '#7c3aed', bg: '#ede9fe' },
  reading:      { label: 'Leitura',    icon: 'book',          color: '#16a34a', bg: '#dcfce7' },
  writing:      { label: 'Escrita',    icon: 'pencil',        color: '#0284c7', bg: '#dbeafe' },
  emotional:    { label: 'Emocional',  icon: 'heart',         color: '#db2777', bg: '#fce7f3' },
  family:       { label: 'Família',    icon: 'home',          color: '#ea580c', bg: '#fff7ed' },
  school:       { label: 'Escola',     icon: 'school',        color: '#ca8a04', bg: '#fef9c3' },
};

export const CreateGuidanceScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const preChildId: string | undefined = route.params?.childId;

  const { children, updateChild } = useChildStore();

  const [selectedChildId, setSelectedChildId] = useState<string>(preChildId ?? children[0]?.id ?? '');
  const [category, setCategory] = useState<GuidanceCategory>('reading');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedChild = useMemo(
    () => children.find((c) => c.id === selectedChildId),
    [children, selectedChildId],
  );

  const catMeta = CATEGORY_META[category];

  const handleSave = async () => {
    if (!selectedChild || !title.trim() || !content.trim()) return;
    setSaving(true);
    const newGuidance: IndividualGuidance = {
      id: `guid-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category,
      createdAt: new Date().toISOString(),
    };
    await updateChild({
      ...selectedChild,
      individualGuidance: [...(selectedChild.individualGuidance ?? []), newGuidance],
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
          <View style={[styles.successIcon, { backgroundColor: catMeta.bg }]}>
            <Ionicons name={catMeta.icon} size={40} color={catMeta.color} />
          </View>
          <Text style={styles.successTitle}>Orientação criada!</Text>
          <Text style={styles.successSub}>
            Registrada para {selectedChild?.name?.split(' ')[0]}
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
      <LinearGradient colors={['#0284c7', '#38bdf8']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Nova Orientação</Text>
          <Text style={styles.headerSub}>Orientação individualizada</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="bulb" size={22} color="rgba(255,255,255,0.7)" />
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
            const accent = theme.colors.literacy[child.literacyLevel as keyof typeof theme.colors.literacy]
              ?? theme.colors.primary[600];
            return (
              <Pressable
                key={child.id}
                onPress={() => setSelectedChildId(child.id)}
                style={[
                  styles.childChip,
                  isSelected && { borderColor: accent, borderWidth: 2, backgroundColor: '#fff' },
                ]}
              >
                <Avatar name={child.name} size="sm" showBorder={isSelected} borderColor={accent} />
                <Text style={[styles.childChipName, isSelected && { color: accent }]} numberOfLines={1}>
                  {child.name.split(' ')[0]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Categoria ── */}
        <SectionLabel icon="bookmark" label="Categoria" />
        <View style={styles.categoryGrid}>
          {(Object.keys(CATEGORY_META) as GuidanceCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const isSelected = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryCard,
                  isSelected && { backgroundColor: meta.bg, borderColor: meta.color, borderWidth: 2 },
                ]}
              >
                <Ionicons
                  name={meta.icon}
                  size={20}
                  color={isSelected ? meta.color : theme.colors.neutral[400]}
                />
                <Text style={[styles.categoryLabel, isSelected && { color: meta.color }]}>
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Título ── */}
        <SectionLabel icon="create" label="Título" />
        <TextInput
          style={styles.textInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Exercício de consciência fonêmica"
          placeholderTextColor={theme.colors.neutral[400]}
          maxLength={80}
          returnKeyType="next"
        />

        {/* ── Conteúdo ── */}
        <SectionLabel icon="document-text" label="Conteúdo / Descrição" />
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={content}
          onChangeText={setContent}
          placeholder="Descreva as orientações, estratégias e observações importantes para este aluno..."
          placeholderTextColor={theme.colors.neutral[400]}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={800}
        />
        <Text style={styles.charCount}>{content.length}/800</Text>

        {/* ── Dica contextual ── */}
        <View style={[styles.tipBox, { backgroundColor: catMeta.bg, borderColor: catMeta.color }]}>
          <Ionicons name="information-circle" size={16} color={catMeta.color} />
          <Text style={[styles.tipText, { color: catMeta.color }]}>
            {getTip(category)}
          </Text>
        </View>

        {/* ── Salvar ── */}
        <Pressable
          onPress={handleSave}
          disabled={saving || !title.trim() || !content.trim() || !selectedChildId}
          style={[
            styles.saveBtn,
            (!title.trim() || !content.trim() || !selectedChildId) && styles.saveBtnDisabled,
          ]}
        >
          <LinearGradient
            colors={['#0284c7', '#38bdf8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>
              {saving ? 'Salvando...' : 'Criar orientação'}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

function getTip(cat: GuidanceCategory): string {
  const tips: Record<GuidanceCategory, string> = {
    phonological: 'Inclua exercícios de rima, aliteração e segmentação de sílabas.',
    reading:      'Sugira textos adequados ao nível e estratégias de fluência.',
    writing:      'Descreva atividades de traçado, ditado ou produção textual.',
    emotional:    'Anote estratégias de acolhimento e suporte socioemocional.',
    family:       'Oriente atividades que a família pode fazer em casa.',
    school:       'Registre adaptações curriculares e estratégias de inclusão.',
  };
  return tips[cat];
}

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

  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  categoryCard: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center', gap: 6,
    paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[500],
    textAlign: 'center',
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
    minHeight: 140,
    paddingTop: 13,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.primaryMedium,
    color: theme.colors.neutral[400],
    textAlign: 'right',
    marginTop: -2,
  },

  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginTop: 4,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: theme.typography.fonts.primaryMedium,
    lineHeight: 18,
  },

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

export default CreateGuidanceScreen;
