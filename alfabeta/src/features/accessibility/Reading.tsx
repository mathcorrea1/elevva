import React, { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';
import { Action, Stack, Notice } from '@/shared/ui';
import { useTheme } from '@/shared/theme/ThemeProvider';
export function Reading({
  text,
  allowed = true,
  onSpoken,
}: {
  text: string;
  allowed?: boolean;
  onSpoken?: () => void;
}) {
  const { preferences } = useTheme();
  const [playing, setPlaying] = useState(false);
  const [read, setRead] = useState(false);
  const [error, setError] = useState('');
  const playback = useRef(0);
  useFocusEffect(
    React.useCallback(() => {
      setPlaying(false);
      return () => {
        playback.current++;
        void Speech.stop();
      };
    }, []),
  );
  useEffect(() => {
    setPlaying(false);
    setRead(false);
    setError('');
    return () => {
      playback.current++;
      void Speech.stop();
    };
  }, [text, allowed, preferences.read_enabled]);
  if (!allowed || !preferences.read_enabled) return null;
  async function speak() {
    const current = ++playback.current;
    setError('');
    try {
      await Speech.stop();
      const voices = await Speech.getAvailableVoicesAsync();
      if (current !== playback.current) return;
      const voice = voices.find((v) => v.language.replace('_', '-').toLowerCase() === 'pt-br');
      if (!voice) {
        setPlaying(false);
        setError(
          'Voz em português brasileiro indisponível neste aparelho. Continue pelo texto ou configure uma voz PT-BR no sistema.',
        );
        return;
      }
      setPlaying(true);
      setRead(true);
      const done = () => {
        if (current === playback.current) setPlaying(false);
      };
      Speech.speak(text, {
        onStart: () => onSpoken?.(),
        language: 'pt-BR',
        voice: voice.identifier,
        onDone: done,
        onStopped: done,
        onError: () => {
          if (current === playback.current) {
            done();
            setError('Não foi possível ler em voz alta. O texto continua disponível.');
          }
        },
      });
    } catch {
      if (current === playback.current) {
        setPlaying(false);
        setError('Leitura indisponível. O texto continua disponível.');
      }
    }
  }
  return (
    <Stack>
      <Action
        secondary
        title={playing ? 'Parar leitura' : read ? 'Repetir instrução' : 'Ouvir instrução'}
        onPress={() => {
          if (!playing) {
            void speak();
            return;
          }
          playback.current++;
          void Speech.stop();
          setPlaying(false);
        }}
      />
      {error ? <Notice text={error} /> : null}
    </Stack>
  );
}
