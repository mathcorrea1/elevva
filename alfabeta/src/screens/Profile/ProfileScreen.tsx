import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { maskEmail } from '@/utils/formatters';
import { theme } from '@/theme';

const roleLabel = { teacher: 'Professor(a)', guardian: 'Responsável' };

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      setAvatar(result.assets[0]?.uri);
    }
  };

  const infoRows = [
    { icon: 'mail-outline' as const, label: 'E-mail', value: maskEmail(user?.email ?? '') },
    { icon: 'person-outline' as const, label: 'Tipo de conta', value: roleLabel[user?.role as keyof typeof roleLabel] ?? 'Usuário' },
    { icon: 'shield-checkmark-outline' as const, label: 'Conta verificada', value: 'Sim' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Perfil" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero do perfil */}
        <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 100 }}>
          <LinearGradient
            colors={theme.colors.gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroDecorCircle} />
            <Pressable onPress={pickImage} style={styles.avatarWrapper} accessibilityLabel="Alterar foto de perfil">
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Avatar name={user?.name ?? 'U'} size="xl" showBorder borderColor="rgba(255,255,255,0.6)" />
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </Pressable>
            <View style={styles.heroTextArea}>
              <Text style={styles.heroName}>{user?.name}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{roleLabel[user?.role as keyof typeof roleLabel] ?? 'Usuário'}</Text>
              </View>
            </View>
          </LinearGradient>
        </MotiView>

        {/* Informações da conta */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Informações da conta</Text>
            {infoRows.map((row, i) => (
              <View key={row.label} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
                <View style={styles.infoIconCircle}>
                  <Ionicons name={row.icon} size={18} color={theme.colors.primary[600]} />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </MotiView>

        {/* Ações */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
          <View style={styles.actionsCard}>
            <Text style={styles.infoCardTitle}>Configurações</Text>
            <Pressable style={styles.actionRow}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary[50] }]}>
                <Ionicons name="notifications-outline" size={20} color={theme.colors.primary[600]} />
              </View>
              <Text style={styles.actionLabel}>Notificações</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.neutral[300]} />
            </Pressable>
            <Pressable style={styles.actionRow}>
              <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="help-circle-outline" size={20} color="#2563eb" />
              </View>
              <Text style={styles.actionLabel}>Ajuda e suporte</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.neutral[300]} />
            </Pressable>
            <Pressable style={styles.actionRow}>
              <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="document-text-outline" size={20} color="#16a34a" />
              </View>
              <Text style={styles.actionLabel}>Termos de uso</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.neutral[300]} />
            </Pressable>
          </View>
        </MotiView>

        {/* Logout */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 400 }}>
          <Button label="Sair da conta" onPress={() => setConfirmOpen(true)} variant="danger" fullWidth />
          <Text style={styles.version}>Versão 1.0.0 • Elevva</Text>
        </MotiView>
      </ScrollView>

      <Modal visible={confirmOpen} onClose={() => setConfirmOpen(false)} title="Encerrar sessão" size="sm">
        <Text style={styles.modalText}>Tem certeza que deseja sair da sua conta?</Text>
        <View style={styles.modalActions}>
          <Button label="Cancelar" onPress={() => setConfirmOpen(false)} variant="ghost" fullWidth />
          <Button
            label="Sair"
            onPress={() => { setConfirmOpen(false); void logout(); }}
            variant="danger"
            fullWidth
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingBottom: 40, gap: 16 },
  hero: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  heroDecorCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -80,
    right: -80,
  },
  avatarWrapper: {
    position: 'relative',
    borderRadius: 999,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.secondary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  heroTextArea: { alignItems: 'center', gap: 8 },
  heroName: {
    fontSize: 24,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#fff',
    letterSpacing: 0.3,
  },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    ...theme.shadows.level2,
    borderWidth: 1,
    borderColor: '#f0edf8',
    gap: 4,
  },
  infoCardTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: theme.colors.primary[600],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0edf8',
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[400],
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: theme.colors.text,
    marginTop: 1,
  },
  actionsCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    ...theme.shadows.level1,
    borderWidth: 1,
    borderColor: '#f0edf8',
    gap: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: theme.colors.text,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[400],
    marginTop: 8,
  },
  modalText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  modalActions: {
    marginTop: 8,
    gap: 8,
  },
});

export default ProfileScreen;

