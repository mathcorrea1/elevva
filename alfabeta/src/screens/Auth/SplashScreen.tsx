import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from '@/components/system/MotiShim';

import { useAuth } from '@/hooks/useAuth';

type Props = NativeStackScreenProps<any>;

export const SplashScreen = ({ navigation }: Props) => {
  const { onboardingDone, isBootstrapping } = useAuth();

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      if (!isBootstrapping && elapsed >= 2400) {
        clearInterval(timer);
        navigation.replace(onboardingDone ? 'Login' : 'Onboarding');
      }
    }, 200);
    return () => clearInterval(timer);
  }, [isBootstrapping, navigation, onboardingDone]);

  return (
    <LinearGradient
      colors={['#4c1d95', '#6d28d9', '#8b5cf6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Aneis de pulso */}
      <MotiView
        from={{ scale: 0.4, opacity: 0.5 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ type: 'timing', duration: 2200, loop: true, repeatReverse: false }}
        style={styles.ring}
      />
      <MotiView
        from={{ scale: 0.4, opacity: 0.5 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ type: 'timing', duration: 2200, loop: true, repeatReverse: false, delay: 740 }}
        style={styles.ring}
      />
      <MotiView
        from={{ scale: 0.4, opacity: 0.5 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ type: 'timing', duration: 2200, loop: true, repeatReverse: false, delay: 1480 }}
        style={styles.ring}
      />

      {/* Logo */}
      <MotiView
        from={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 14, delay: 200 }}
        style={styles.logoCircle}
      >
        <Text style={styles.logoLetters}>Aa</Text>
      </MotiView>

      {/* Textos */}
      <MotiView
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 550 }}
      >
        <Text style={styles.title}>Elevva</Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 700, delay: 900 }}
      >
        <Text style={styles.subtitle}>Aprendizado com cuidado e ciência.</Text>
      </MotiView>

      {/* Pontos de carregamento */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500, delay: 1200 }}
        style={styles.dotsRow}
      >
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ scale: 0.6, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 500, loop: true, delay: i * 180 }}
            style={styles.dot}
          />
        ))}
      </MotiView>
    </LinearGradient>
  );
};

const RING_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    marginBottom: 8,
  },
  logoLetters: {
    fontSize: 36,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#fff',
    letterSpacing: 1,
  },
  title: {
    fontSize: 44,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#ffffff',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});

export default SplashScreen;

