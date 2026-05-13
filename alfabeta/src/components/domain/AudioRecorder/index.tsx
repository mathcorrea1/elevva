import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useAudio } from '@/hooks/useAudio';
import { theme } from '@/theme';

interface AudioRecorderProps {
  onRecordingComplete: (base64: string) => Promise<void> | void;
  maxDuration?: number;
}

export const AudioRecorder = ({ onRecordingComplete, maxDuration = 20 }: AudioRecorderProps) => {
  const { startRecording, stopRecording, isRecording, duration } = useAudio();
  const pulse1 = useSharedValue(1);
  const pulse2 = useSharedValue(1);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isRecording) {
      pulse1.value = withRepeat(withTiming(1.5, { duration: 700 }), -1, true);
      pulse2.value = withRepeat(
        withSequence(withTiming(1, { duration: 350 }), withTiming(1.9, { duration: 700 })),
        -1,
        true,
      );
      timeout.current = setTimeout(async () => {
        const result = await stopRecording();
        await onRecordingComplete(result.base64);
      }, maxDuration * 1000);
    } else {
      pulse1.value = withTiming(1, { duration: 300 });
      pulse2.value = withTiming(1, { duration: 300 });
      if (timeout.current) clearTimeout(timeout.current);
    }
  }, [isRecording, maxDuration, onRecordingComplete, pulse1, pulse2, stopRecording]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse1.value }],
    opacity: (2 - pulse1.value) * 0.3,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse2.value }],
    opacity: (2 - pulse2.value) * 0.15,
  }));

  const onToggle = async (): Promise<void> => {
    if (!isRecording) {
      await startRecording();
      return;
    }
    const result = await stopRecording();
    await onRecordingComplete(result.base64);
  };

  const progress = maxDuration > 0 ? (duration / maxDuration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Pulse rings */}
      <Animated.View style={[styles.ring, styles.ring2, ring2Style]} />
      <Animated.View style={[styles.ring, styles.ring1, ring1Style]} />

      {/* Main button */}
      <Pressable
        onPress={onToggle}
        style={styles.buttonWrapper}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
      >
        <LinearGradient
          colors={isRecording ? ['#ef4444', '#dc2626'] : theme.colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={34} color="#fff" />
        </LinearGradient>
      </Pressable>

      {/* Status */}
      <View style={styles.statusArea}>
        <Text style={[styles.statusText, isRecording && styles.statusTextActive]}>
          {isRecording ? `Gravando…` : 'Toque para gravar'}
        </Text>
        {isRecording ? (
          <Text style={styles.timer}>{duration}s / {maxDuration}s</Text>
        ) : null}
      </View>

      {/* Progress bar */}
      {isRecording ? (
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: `${progress}%` as `${number}%` }]} />
        </View>
      ) : null}
    </View>
  );
};

const BUTTON_SIZE = 96;
const RING1_SIZE = BUTTON_SIZE + 32;
const RING2_SIZE = BUTTON_SIZE + 64;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: theme.colors.primary[400],
  },
  ring1: {
    width: RING1_SIZE,
    height: RING1_SIZE,
    top: 24 + (RING2_SIZE - RING1_SIZE) / 2,
  },
  ring2: {
    width: RING2_SIZE,
    height: RING2_SIZE,
    top: 24,
  },
  buttonWrapper: {
    borderRadius: BUTTON_SIZE / 2,
    overflow: 'hidden',
    ...theme.shadows.level4,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusArea: {
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  statusText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.primarySemiBold,
    color: theme.colors.neutral[500],
  },
  statusTextActive: {
    color: theme.colors.error,
  },
  timer: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.technical,
    color: theme.colors.neutral[400],
  },
  progressTrack: {
    width: 200,
    height: 4,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
  },
});

export default AudioRecorder;
