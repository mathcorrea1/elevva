import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';

const instructionSteps = [
  { icon: 'eye-outline' as const, label: 'Observe', text: 'Leia as instruções com atenção antes de iniciar.' },
  { icon: 'pencil-outline' as const, label: 'Realize', text: 'Execute a atividade conforme as orientações.' },
  { icon: 'checkmark-circle-outline' as const, label: 'Registre', text: 'Registre o desempenho ao concluir.' },
];

export const ActivityDetailScreen = ({ route, navigation }: any) => {
  const activityId = route.params?.activityId as string;

  return (
    <View style={styles.container}>
      <Header title="Detalhes da Atividade" showBack onBack={navigation.goBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Banner da atividade */}
        <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
          <LinearGradient
            colors={theme.colors.gradients.heroLight}
            style={styles.banner}
          >
            <View style={styles.bannerIcon}>
              <Ionicons name="book" size={36} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.bannerTitle}>Atividade {activityId}</Text>
            <Text style={styles.bannerSub}>Leitura e compreensão</Text>
          </LinearGradient>
        </MotiView>

        {/* Instruções */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Como realizar</Text>
            {instructionSteps.map((step, i) => (
              <View key={step.label} style={[styles.stepRow, i < instructionSteps.length - 1 && styles.stepRowBorder]}>
                <View style={styles.stepIconCircle}>
                  <Ionicons name={step.icon} size={20} color={theme.colors.primary[600]} />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <Text style={styles.stepDesc}>{step.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </MotiView>

        {/* Objetivo */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Objetivo da atividade</Text>
            <Text style={styles.bodyText}>
              Esta atividade visa avaliar e desenvolver as habilidades de leitura e reconhecimento
              de padrões silábicos, contribuindo para o avanço no nível de alfabetização da criança.
            </Text>
          </View>
        </MotiView>

        <Button label="Iniciar atividade" onPress={() => navigation.goBack()} fullWidth />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  banner: {
    borderRadius: theme.borderRadius.xl,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  bannerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_800ExtraBold',
    color: theme.colors.primary[800],
    textAlign: 'center',
  },
  bannerSub: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.primary[600],
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    gap: 4,
    ...theme.shadows.level1,
    borderWidth: 1,
    borderColor: '#f0edf8',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_800ExtraBold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  stepRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0edf8',
  },
  stepIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
  stepLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: theme.colors.text,
  },
  stepDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[500],
    lineHeight: 18,
    marginTop: 2,
  },
  bodyText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[600],
    lineHeight: 24,
  },
});

export default ActivityDetailScreen;

