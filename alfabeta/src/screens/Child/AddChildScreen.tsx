import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useChild } from '@/hooks/useChild';
import { useForm } from '@/hooks/useForm';
import { LiteracyLevel } from '@/utils/literacy.levels';
import { buildLearningTrails } from '@/utils/trails';
import { childSchema } from '@/utils/validators';
import { theme } from '@/theme';

/* ─── Date mask helpers ─── */

const applyDateMask = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const toISO = (masked: string): string => {
  const parts = masked.split('/');
  if (parts.length !== 3 || (parts[2]?.length ?? 0) < 4) return masked;
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
};

/* ─── Special needs checkbox definitions ─── */

const SPECIAL_NEEDS = [
  { key: 'autism'            as const, label: 'TEA — Transtorno do Espectro Autista',    icon: 'sparkles'         as const, color: '#7c3aed', bg: '#f3e8ff' },
  { key: 'dyslexia'         as const, label: 'Dislexia',                                icon: 'document-text'    as const, color: '#0284c7', bg: '#dbeafe' },
  { key: 'adhd'             as const, label: 'TDAH — Déficit de Atenção',               icon: 'flash'            as const, color: '#ea580c', bg: '#ffedd5' },
  { key: 'dyscalculia'      as const, label: 'Discalculia',                             icon: 'calculator'       as const, color: '#d97706', bg: '#fef3c7' },
  { key: 'visualImpairment' as const, label: 'Deficiência visual',                      icon: 'eye-off'          as const, color: '#16a34a', bg: '#dcfce7' },
  { key: 'hearingImpairment'as const, label: 'Deficiência auditiva',                    icon: 'ear'              as const, color: '#0e7490', bg: '#cffafe' },
] as const;

type NeedsKey = typeof SPECIAL_NEEDS[number]['key'];

/* ─── SpecialNeedsCheckbox ─── */

interface CheckboxProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  checked: boolean;
  onToggle: () => void;
}

const SpecialNeedsCheckbox = ({ label, icon, color, bg, checked, onToggle }: CheckboxProps) => (
  <Pressable style={[styles.checkRow, checked && { backgroundColor: bg, borderColor: color }]} onPress={onToggle}>
    <View style={[styles.checkIconBox, { backgroundColor: checked ? color : theme.colors.neutral[100] }]}>
      <Ionicons name={icon} size={14} color={checked ? '#fff' : theme.colors.neutral[400]} />
    </View>
    <Text style={[styles.checkLabel, checked && { color, fontFamily: theme.typography.fonts.primarySemiBold }]}>
      {label}
    </Text>
    <View style={[styles.checkbox, checked && { backgroundColor: color, borderColor: color }]}>
      {checked ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
    </View>
  </Pressable>
);

/* ─── Main screen ─── */

export const AddChildScreen = ({ navigation }: any) => {
  const { addChild } = useChild();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(childSchema),
    defaultValues: {
      name: '',
      birthDate: '',
      school: '',
      turma: '',
      notes: '',
      observations: '',
      autism: false,
      dyslexia: false,
      adhd: false,
      dyscalculia: false,
      visualImpairment: false,
      hearingImpairment: false,
      specialNeedsOther: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const childId = `child-${Date.now()}`;
    const anonId = `KID-${Date.now()}`;

    const specialNeeds = {
      autism:             values.autism            ?? false,
      dyslexia:          values.dyslexia          ?? false,
      adhd:              values.adhd              ?? false,
      dyscalculia:       values.dyscalculia       ?? false,
      visualImpairment:  values.visualImpairment  ?? false,
      hearingImpairment: values.hearingImpairment ?? false,
      other:             values.specialNeedsOther || undefined,
    };

    await addChild({
      id: childId,
      anonId,
      assessmentCompleted: false,
      name: values.name,
      birthDate: toISO(values.birthDate),
      school: values.school || undefined,
      turma: values.turma || undefined,
      notes: values.notes || undefined,
      observations: values.observations || undefined,
      avatarColor: theme.colors.primary[600],
      specialNeeds,
      literacyLevel: LiteracyLevel.PRE_SILABICO,
      progress: 0,
      learningTrails: buildLearningTrails(childId, LiteracyLevel.PRE_SILABICO),
      activities: [],
      recommendations: [],
    });
    navigation.goBack();
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      {/* Gradient header */}
      <LinearGradient
        colors={theme.colors.gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topArea}
      >
        <View style={styles.decorCircle} />
        <Header title="Novo estudante" showBack onBack={navigation.goBack} transparent />
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.heroContent}
        >
          <View style={styles.heroIconCircle}>
            <Ionicons name="person-add" size={28} color="#fff" />
          </View>
          <Text style={styles.heroText}>Cadastrar novo estudante</Text>
          <Text style={styles.heroSub}>Campos marcados com * são obrigatórios</Text>
        </MotiView>
      </LinearGradient>

      {/* Form card */}
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
          >
            {/* ── Identificação ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.groupTitle}>Identificação</Text>

              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    label="Nome completo *"
                    value={field.value}
                    onChangeText={field.onChange}
                    autoCapitalize="words"
                    autoCorrect={false}
                    error={errors.name?.message as string | undefined}
                  />
                )}
              />

              <Controller
                control={control}
                name="birthDate"
                render={({ field }) => (
                  <Input
                    label="Data de nascimento *"
                    value={field.value}
                    onChangeText={(text) => field.onChange(applyDateMask(text))}
                    keyboardType="numeric"
                    placeholder="DD/MM/AAAA"
                    hint="Ex: 15/03/2018"
                    maxLength={10}
                    error={errors.birthDate?.message as string | undefined}
                  />
                )}
              />
            </View>

            {/* ── Escola ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.groupTitle}>Escola e turma</Text>

              <Controller
                control={control}
                name="school"
                render={({ field }) => (
                  <Input
                    label="Escola"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    autoCapitalize="words"
                    placeholder="Ex: E.M. Professora Sol"
                  />
                )}
              />

              <Controller
                control={control}
                name="turma"
                render={({ field }) => (
                  <Input
                    label="Turma"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    autoCapitalize="words"
                    placeholder="Ex: 2º Ano A"
                    hint="Serie ou turma do estudante"
                  />
                )}
              />
            </View>

            {/* ── Necessidades especiais ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.groupTitle}>Necessidades especiais</Text>
              <Text style={styles.groupSubtitle}>
                Marque as condições identificadas para personalizar as orientações
              </Text>

              {SPECIAL_NEEDS.map((need) => (
                <Controller
                  key={need.key}
                  control={control}
                  name={need.key as NeedsKey}
                  render={({ field }) => (
                    <SpecialNeedsCheckbox
                      label={need.label}
                      icon={need.icon}
                      color={need.color}
                      bg={need.bg}
                      checked={!!field.value}
                      onToggle={() => field.onChange(!field.value)}
                    />
                  )}
                />
              ))}

              <Controller
                control={control}
                name="specialNeedsOther"
                render={({ field }) => (
                  <Input
                    label="Outras condições"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    placeholder="Descreva outras condições relevantes…"
                    autoCapitalize="sentences"
                  />
                )}
              />
            </View>

            {/* ── Observações ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.groupTitle}>Observações e perfil</Text>

              <Controller
                control={control}
                name="observations"
                render={({ field }) => (
                  <Input
                    label="Observações detalhadas"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    hint="Perfil do aluno, comportamentos relevantes, contexto familiar…"
                    autoCapitalize="sentences"
                    multiline
                    numberOfLines={4}
                  />
                )}
              />

              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Input
                    label="Notas rápidas"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    placeholder="Ex: não faz silêncio, precisa de reforço em sílabas…"
                    autoCapitalize="sentences"
                  />
                )}
              />
            </View>

            <Button
              label="Salvar estudante"
              onPress={onSubmit}
              loading={isSubmitting}
              fullWidth
            />
          </MotiView>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.primary[700] },
  topArea: { overflow: 'hidden' },
  decorCircle: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -60,
  },
  heroContent: { alignItems: 'center', paddingTop: 8, paddingBottom: 28, gap: 8 },
  heroIconCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: 'rgba(255,255,255,0.9)',
  },
  heroSub: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.primary,
    color: 'rgba(255,255,255,0.6)',
  },

  card: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
  },
  formContent: { padding: 24, paddingTop: 28, gap: 8, paddingBottom: 40 },

  fieldGroup: { marginBottom: 24, gap: 4 },
  groupTitle: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.primary[600],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  groupSubtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[500],
    lineHeight: 17,
    marginBottom: 6,
  },

  /* Special needs checkboxes */
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
  },
  checkIconBox: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  checkLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[600],
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: theme.colors.neutral[300],
    alignItems: 'center', justifyContent: 'center',
  },
});

export default AddChildScreen;
