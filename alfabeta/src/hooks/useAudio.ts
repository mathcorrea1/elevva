import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';

/**
 * Hook to manage audio recording lifecycle and base64 extraction.
 */
export const useAudio = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const startRecording = async (): Promise<void> => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Permissao de microfone negada.');
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    newRecording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording) {
        setDuration(Math.floor(status.durationMillis / 1000));
      }
    });
    await newRecording.startAsync();
    setRecording(newRecording);
    setIsRecording(true);
  };

  const stopRecording = async (): Promise<{ uri: string; base64: string }> => {
    if (!recording) {
      throw new Error('Nenhuma gravacao ativa.');
    }
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setIsRecording(false);
    setDuration(0);
    if (!uri) {
      throw new Error('Falha ao obter arquivo de audio.');
    }
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { uri, base64 };
  };

  return { startRecording, stopRecording, isRecording, duration };
};
