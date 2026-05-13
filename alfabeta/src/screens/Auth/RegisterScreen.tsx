import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller } from 'react-hook-form';
import { MotiView } from '@/components/system/MotiShim';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { useToast } from '@/hooks/useToast';
import { friendlyError } from '@/utils/errorHandler';
import { registerSchema } from '@/utils/validators';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<any>;

const strengthConfig = {
  Fraca: { color: '#ef4444', bg: '#fee2e2', bar: 0.33 },
  Média: { color: '#f59e0b', bg: '#fef3c7', bar: 0.66 },
  Forte: { color: '#22c55e', bg: '#dcfce7', bar: 1 },
};

export const RegisterScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { showToast } = useToast();
  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'guardian', acceptedTerms: false },
  });

  const password = watch('password');
  const role = watch('role');
  const acceptedTerms = watch('acceptedTerms');

  const strengthKey = password.length >= 10 ? 'Forte' : password.length >= 6 ? 'Média' : 'Fraca';
  const strength = strengthConfig[strengthKey];

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register({ name: values.name, email: values.email, password: values.password, role: values.role });
      showToast({ message: 'Cadastro realizado com sucesso!', type: 'success' });
      navigation.goBack();
    } catch (error) {
      showToast({ message: friendlyError(error), type: 'error' });
    }
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      {/* Topo com gradiente */}
      <LinearGradient
        colors={['#4c1d95', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topArea}
      >
        <View style={styles.decorCircle} />
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <Text style={styles.topTitle}>{t('auth.register')}</Text>
          <Text style={styles.topSub}>Crie sua conta gratuitamente</Text>
        </MotiView>
      </LinearGradient>

      {/* Formulário */}
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 150 }}>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <Input label={t('auth.name')} value={value} onChangeText={onChange} error={errors.name?.message as string | undefined} />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange } }) => (
                <Input
                  label={t('auth.email')}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email?.message as string | undefined}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange } }) => (
                <Input label={t('auth.password')} value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message as string | undefined} />
              )}
            />

            {/* Força da senha */}
            {password.length > 0 ? (
              <View style={[styles.strengthCard, { backgroundColor: strength.bg }]}>
                <View style={styles.strengthRow}>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>Força da senha: {strengthKey}</Text>
                </View>
                <View style={styles.strengthTrack}>
                  <View style={[styles.strengthBar, { width: `${strength.bar * 100}%` as `${number}%`, backgroundColor: strength.color }]} />
                </View>
              </View>
            ) : null}

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { value, onChange } }) => (
                <Input label={t('auth.confirmPassword')} value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message as string | undefined} />
              )}
            />

            {/* Tipo de conta */}
            <Text style={styles.sectionLabel}>Tipo de conta</Text>
            <View style={styles.roleRow}>
              {(['guardian', 'teacher'] as const).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setValue('role', r)}
                  style={[styles.roleCard, role === r && styles.roleCardActive]}
                >
                  <Text style={styles.roleIcon}>{r === 'guardian' ? '👨‍👩‍👧' : '👩‍🏫'}</Text>
                  <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                    {r === 'guardian' ? 'Responsável' : 'Professor(a)'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Termos */}
            <Pressable
              style={styles.termsRow}
              onPress={() => setValue('acceptedTerms', !acceptedTerms)}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
                {acceptedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.termsText}>
                Aceito os <Text style={styles.termsLink}>termos de uso</Text> e a{' '}
                <Text style={styles.termsLink}>política de privacidade</Text>
              </Text>
            </Pressable>

            <Button label="Criar conta" onPress={onSubmit} loading={isSubmitting} fullWidth />

            <Pressable onPress={() => navigation.goBack()} style={styles.loginLink}>
              <Text style={styles.loginText}>Já tem conta? </Text>
              <Text style={styles.loginHighlight}>Entrar</Text>
            </Pressable>
          </MotiView>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.primary[600] },
  topArea: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 48,
    paddingHorizontal: 28,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -60,
  },
  backBtn: { marginBottom: 16 },
  backIcon: { fontSize: 22, color: 'rgba(255,255,255,0.85)' },
  topTitle: {
    fontSize: 30,
    fontFamily: theme.typography.fonts.primaryExtraBold,
    color: '#fff',
    letterSpacing: 0.3,
  },
  topSub: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.primary,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    lineHeight: 21,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
  },
  content: {
    padding: 28,
    paddingTop: 32,
    gap: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    marginTop: 4,
    lineHeight: 21,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
  },
  roleCardActive: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[100],
  },
  roleIcon: { fontSize: 26 },
  roleText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.textSecondary,
  },
  roleTextActive: { color: theme.colors.primary[700] },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  checkmark: { color: '#fff', fontSize: 13, fontFamily: theme.typography.fonts.primaryBold },
  termsText: {
    flex: 1,
    fontSize: 13,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: { color: theme.colors.primary[600], fontFamily: theme.typography.fonts.primarySemiBold },
  strengthCard: {
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginTop: -10,
    marginBottom: 14,
  },
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between' },
  strengthLabel: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  strengthTrack: {
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  loginText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.neutral[500],
    lineHeight: 21,
  },
  loginHighlight: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.primary[600],
    lineHeight: 21,
  },
});

export default RegisterScreen;

