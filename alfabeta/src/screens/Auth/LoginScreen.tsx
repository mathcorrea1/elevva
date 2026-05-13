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
import { loginSchema } from '@/utils/validators';

type Props = NativeStackScreenProps<any>;

export const LoginScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      showToast({ message: friendlyError(error), type: 'error', position: 'top' });
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
        {/* Círculos decorativos */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, delay: 100 }}
          style={styles.logoArea}
        >
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>Aa</Text>
          </View>
          <Text style={styles.logoTitle}>Elevva</Text>
          <Text style={styles.logoTagline}>Acompanhe cada passo da alfabetização</Text>
        </MotiView>
      </LinearGradient>

      {/* Card de formulário */}
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 200 }}
          >
            <Text style={styles.welcomeTitle}>Bem-vindo de volta</Text>
            <Text style={styles.welcomeSub}>Entre com sua conta para continuar</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 350 }}
            style={styles.fields}
          >
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
                <Input
                  label={t('auth.password')}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.password?.message as string | undefined}
                />
              )}
            />
            <Button label={t('auth.login')} onPress={onSubmit} loading={isSubmitting} fullWidth />
          </MotiView>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 500, delay: 500 }}
            style={styles.links}
          >
            <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.link}>
              <Text style={styles.linkText}>{t('auth.forgot')}</Text>
            </Pressable>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.divider} />
            </View>
            <Pressable onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
              <Text style={styles.registerText}>Não tem conta? </Text>
              <Text style={styles.registerHighlight}>Cadastre-se</Text>
            </Pressable>
          </MotiView>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#7c3aed',
  },
  topArea: {
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 56,
    paddingHorizontal: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    left: -40,
  },
  logoArea: {
    alignItems: 'center',
    gap: 6,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoMarkText: {
    fontSize: 24,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#fff',
  },
  logoTitle: {
    fontSize: 34,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  logoTagline: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#fafaf8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
  },
  formContent: {
    flexGrow: 1,
    padding: 28,
    paddingTop: 32,
    gap: 24,
  },
  welcomeTitle: {
    fontSize: 26,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#1c1917',
  },
  welcomeSub: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#78716c',
    marginTop: 4,
  },
  fields: {
    gap: 4,
  },
  links: {
    gap: 16,
    paddingBottom: 16,
  },
  link: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    color: '#7c3aed',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e7e5e4',
  },
  dividerText: {
    fontSize: 12,
    color: '#a8a29e',
    fontFamily: 'Poppins_400Regular',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#78716c',
  },
  registerHighlight: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#7c3aed',
  },
});

export default LoginScreen;

