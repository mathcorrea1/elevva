import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { AudioRecorder } from '@/components/domain/AudioRecorder';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAI } from '@/hooks/useAI';
import { useChild } from '@/hooks/useChild';
import { useToast } from '@/hooks/useToast';
import { friendlyError } from '@/utils/errorHandler';
import { literacyLevels } from '@/utils/literacy.levels';
import { theme } from '@/theme';


export const AudioActivityScreen = ({ route, navigation }: any) => {
  const { analyzeAudio } = useAI();
  const { children, updateChild } = useChild();
  const { showToast } = useToast();
  const child = useMemo(
    () => children.find((item) => item.id === route.params?.childId) ?? children[0],
    [children, route.params?.childId],
  );
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<{ detectedLevel: string; rationale: string } | null>(null);

  const phrase = route.params?.phrase ?? 'A BOLA É AZUL';

  const onRecordingComplete = async (base64: string): Promise<void> => {
    if (!child) return;
    try {
      setLoading(true);
      const data = await analyzeAudio(base64, child);
      setTranscript(data.transcription.transcript);
      setResult(data.analysis);
      await updateChild({
        ...child,
        literacyLevel: data.analysis.detectedLevel as any,
        progress: Math.min(100, child.progress + 6),
      });
      showToast({ message: 'Análise concluída com sucesso!', type: 'success' });
    } catch (error) {
      showToast({ message: friendlyError(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Atividade de Áudio" showBack onBack={navigation.goBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Frase para leitura */}
        <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
          <View style={styles.phraseCard}>
            <View style={styles.phraseHeader}>
              <Ionicons name="text" size={16} color={theme.colors.primary[600]} />
              <Text style={styles.phraseLabel}>Leia a frase em voz alta:</Text>
            </View>
            <LinearGradient
              colors={theme.colors.gradients.heroLight}
              style={styles.phraseBox}
            >
              <Text style={styles.phrase}>{phrase}</Text>
            </LinearGradient>
            <View style={styles.phraseHint}>
              <Ionicons name="information-circle-outline" size={14} color={theme.colors.neutral[400]} />
              <Text style={styles.phraseHintText}>Grave até 20 segundos de leitura</Text>
            </View>
          </View>
        </MotiView>

        {/* Gravador */}
        <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 200 }}>
          <View style={styles.recorderCard}>
            <AudioRecorder onRecordingComplete={onRecordingComplete} maxDuration={20} />
          </View>
        </MotiView>

        {/* Loading */}
        {loading ? (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.loadingCard}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Analisando com IA…</Text>
          </MotiView>
        ) : null}

        {/* Resultado */}
        {transcript && !loading ? (
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', delay: 100 }}>
            <View style={styles.resultCard}>
              {/* Transcrição */}
              <View style={styles.resultSection}>
                <View style={styles.resultSectionHeader}>
                  <Ionicons name="document-text" size={16} color={theme.colors.primary[600]} />
                  <Text style={styles.resultTitle}>Transcrição</Text>
                </View>
                <Text style={styles.transcriptText}>"{transcript}"</Text>
              </View>

              {/* Nível detectado */}
              {result ? (
                <View style={styles.resultSection}>
                  <View style={styles.resultSectionHeader}>
                    <Ionicons name="analytics" size={16} color={theme.colors.literacy[result.detectedLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600]} />
                    <Text style={styles.resultTitle}>Nível detectado</Text>
                  </View>
                  <View style={[styles.levelResult, { backgroundColor: theme.colors.literacyLight[result.detectedLevel as keyof typeof theme.colors.literacyLight] ?? theme.colors.primary[50] }]}>
                    <View style={[styles.levelDot, { backgroundColor: theme.colors.literacy[result.detectedLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600] }]} />
                    <Text style={[styles.levelName, { color: theme.colors.literacy[result.detectedLevel as keyof typeof theme.colors.literacy] ?? theme.colors.primary[600] }]}>
                      {literacyLevels[result.detectedLevel as keyof typeof literacyLevels]?.label ?? result.detectedLevel}
                    </Text>
                  </View>
                  <Text style={styles.rationaleText}>{result.rationale}</Text>
                </View>
              ) : null}
            </View>
          </MotiView>
        ) : null}

        <Button label="Salvar sessão" onPress={() => navigation.goBack()} variant={result ? 'primary' : 'outline'} fullWidth />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  phraseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    gap: 12,
    ...theme.shadows.level2,
    borderWidth: 1,
    borderColor: '#f0edf8',
  },
  phraseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phraseLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: theme.colors.neutral[600],
  },
  phraseBox: {
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
  },
  phrase: {
    fontSize: 28,
    fontFamily: 'Poppins_800ExtraBold',
    color: theme.colors.primary[700],
    textAlign: 'center',
    letterSpacing: 1.5,
    lineHeight: 38,
  },
  phraseHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phraseHintText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[400],
  },
  recorderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.level2,
    borderWidth: 1,
    borderColor: '#f0edf8',
  },
  loadingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    ...theme.shadows.level1,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: theme.colors.neutral[500],
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    gap: 16,
    ...theme.shadows.level2,
    borderWidth: 1,
    borderColor: '#f0edf8',
  },
  resultSection: { gap: 10 },
  resultSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: theme.colors.text,
  },
  transcriptText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[700],
    fontStyle: 'italic',
    lineHeight: 24,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.md,
    padding: 12,
  },
  levelResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  levelName: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  rationaleText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[600],
    lineHeight: 20,
  },
});

export default AudioActivityScreen;

