import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { forgotSchema } from '@/utils/validators';

type Props = NativeStackScreenProps<any>;

export const ForgotPasswordScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await forgotPassword(email);
      showToast({ message: t('auth.successReset'), type: 'success' });
      navigation.goBack();
    } catch (error) {
      showToast({ message: friendlyError(error), type: 'error' });
    }
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
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
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, delay: 100 }}
          style={styles.iconCircle}
        >
          <Text style={styles.iconEmoji}>🔑</Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <Text style={styles.topTitle}>{t('auth.forgot')}</Text>
          <Text style={styles.topSub}>Enviaremos um link de redefinição para seu e-mail.</Text>
        </MotiView>
      </LinearGradient>

      <View style={styles.card}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 300 }}
          style={styles.formArea}
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
                error={errors.email?.message as string | undefined}
              />
            )}
          />
          <Button label="Enviar link de redefinição" onPress={onSubmit} loading={isSubmitting} fullWidth />
          <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Voltar ao login</Text>
          </Pressable>
        </MotiView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#7c3aed' },
  topArea: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 52,
    paddingHorizontal: 28,
    gap: 16,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  backBtn: { alignSelf: 'flex-start' },
  backIcon: { fontSize: 22, color: 'rgba(255,255,255,0.85)' },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 32 },
  topTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#fff',
    letterSpacing: 0.3,
  },
  topSub: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#fafaf8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
  },
  formArea: {
    padding: 28,
    paddingTop: 36,
    gap: 16,
  },
  backLink: { alignItems: 'center', paddingVertical: 8 },
  backLinkText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#7c3aed',
  },
});

export default ForgotPasswordScreen;

