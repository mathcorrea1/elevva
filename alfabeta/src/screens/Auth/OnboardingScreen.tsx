import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from '@/components/system/MotiShim';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Acompanhe cada conquista',
    description: 'Visualize o progresso na alfabetização da criança de forma clara e organizada.',
    icon: 'trophy' as keyof typeof Ionicons.glyphMap,
    gradient: ['#4c1d95', '#7c3aed'] as [string, string],
    iconBg: 'rgba(255,255,255,0.2)',
  },
  {
    id: '2',
    title: 'Atividades personalizadas',
    description: 'Sugestões de atividades baseadas no nível atual de alfabetização de cada criança.',
    icon: 'bulb' as keyof typeof Ionicons.glyphMap,
    gradient: ['#c2410c', '#f97316'] as [string, string],
    iconBg: 'rgba(255,255,255,0.2)',
  },
  {
    id: '3',
    title: 'Análise com Inteligência Artificial',
    description: 'Grave a leitura da criança e receba um diagnóstico preciso do nível de alfabetização.',
    icon: 'mic' as keyof typeof Ionicons.glyphMap,
    gradient: ['#0369a1', '#0ea5e9'] as [string, string],
    iconBg: 'rgba(255,255,255,0.2)',
  },
  {
    id: '4',
    title: 'Parceria família e escola',
    description: 'Reúna dados, orientações e recomendações em um único lugar para todos os responsáveis.',
    icon: 'people' as keyof typeof Ionicons.glyphMap,
    gradient: ['#166534', '#22c55e'] as [string, string],
    iconBg: 'rgba(255,255,255,0.2)',
  },
];

type Props = NativeStackScreenProps<any>;

export const OnboardingScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const { setOnboardingDone } = useAuth();
  const currentSlide = slides[index];

  const finish = async (): Promise<void> => {
    await setOnboardingDone();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        data={slides}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.slide}
          >
            {/* Círculos decorativos */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <MotiView
              from={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14 }}
              style={[styles.iconCircle, { backgroundColor: item.iconBg }]}
            >
              <Ionicons name={item.icon} size={56} color="#fff" />
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 450, delay: 150 }}
              style={styles.textArea}
            >
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </MotiView>
          </LinearGradient>
        )}
      />

      {/* Rodapé */}
      <View style={styles.footer}>
        {/* Indicadores */}
        <View style={styles.pagination}>
          {slides.map((slide, dotIndex) => (
            <MotiView
              key={slide.id}
              animate={{
                width: dotIndex === index ? 24 : 8,
                backgroundColor: dotIndex === index
                  ? (currentSlide?.gradient[1] ?? '#7c3aed')
                  : '#d6d3d1',
              }}
              transition={{ type: 'timing', duration: 300 }}
              style={styles.dot}
            />
          ))}
        </View>

        {/* Ações */}
        <View style={styles.actions}>
          <Pressable onPress={finish} style={styles.skipArea}>
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </Pressable>
          {index === slides.length - 1 ? (
            <Button label={t('common.start')} onPress={finish} />
          ) : (
            <Button
              label={t('common.next')}
              onPress={() => listRef.current?.scrollToIndex({ index: index + 1, animated: true })}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 32,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  decorCircle1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -80,
    right: -80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -40,
    left: -40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  textArea: {
    alignItems: 'center',
    gap: 14,
  },
  slideTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.2,
  },
  slideDescription: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    backgroundColor: '#fafaf8',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    gap: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipArea: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  skipText: {
    color: '#78716c',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default OnboardingScreen;

