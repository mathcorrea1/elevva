import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from '@/components/system/MotiShim';

import { Header } from '@/components/layout/Header';
import { guidanceService } from '@/services/api/guidance.service';
import { theme } from '@/theme';

export const GuidanceDetailScreen = ({ route, navigation }: any) => {
  const [item, setItem] = useState<any>(null);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    void (async () => {
      const data = await guidanceService.getById(route.params?.guidanceId);
      setItem(data ?? null);
    })();
  }, [route.params?.guidanceId]);

  return (
    <View style={styles.container}>
      <Header
        title="Orientação"
        showBack
        onBack={navigation.goBack}
        rightAction={
          <Pressable
            onPress={() => setFavorite((prev) => !prev)}
            accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            style={styles.favButton}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={22}
              color={favorite ? '#ef4444' : theme.colors.neutral[500]}
            />
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header do artigo */}
        <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 100 }}>
          <LinearGradient
            colors={theme.colors.gradients.heroLight}
            style={styles.articleHeader}
          >
            <View style={styles.articleIconCircle}>
              <Ionicons name="bulb" size={28} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.articleTitle}>{item?.title ?? 'Carregando…'}</Text>
            {item?.category ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            ) : null}
          </LinearGradient>
        </MotiView>

        {/* Corpo do artigo */}
        {item?.content ? (
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 250 }}>
            <View style={styles.bodyCard}>
              <Text style={styles.bodyText}>{item.content}</Text>
            </View>
          </MotiView>
        ) : (
          <View style={styles.skeleton}>
            {[100, 80, 90, 70, 85].map((w, i) => (
              <View key={i} style={[styles.skeletonLine, { width: `${w}%` as `${number}%` }]} />
            ))}
          </View>
        )}

        {/* Ação de favorito */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 400 }}>
          <Pressable
            onPress={() => setFavorite((prev) => !prev)}
            style={[styles.favAction, favorite && styles.favActionActive]}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={favorite ? '#ef4444' : theme.colors.neutral[500]}
            />
            <Text style={[styles.favActionText, favorite && styles.favActionTextActive]}>
              {favorite ? 'Salvo nos favoritos' : 'Salvar nos favoritos'}
            </Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  articleHeader: {
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  articleIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_800ExtraBold',
    color: theme.colors.primary[800],
    textAlign: 'center',
    lineHeight: 30,
  },
  categoryPill: {
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: theme.colors.primary[700],
  },
  bodyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    ...theme.shadows.level1,
    borderWidth: 1,
    borderColor: '#f0edf8',
  },
  bodyText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: theme.colors.neutral[700],
    lineHeight: 28,
    letterSpacing: 0.1,
  },
  skeleton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    gap: 12,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: 7,
  },
  favButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.surface,
  },
  favActionActive: {
    borderColor: '#fecaca',
    backgroundColor: '#fff1f2',
  },
  favActionText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: theme.colors.neutral[500],
  },
  favActionTextActive: { color: '#ef4444' },
});

export default GuidanceDetailScreen;

