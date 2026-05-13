import axios from 'axios';

const endpoint = 'https://speech.googleapis.com/v1/speech:recognize';

interface SpeechResult {
  transcript: string;
  confidence: number;
}

/**
 * Google Speech-to-Text request with simple retry strategy.
 */
export const speechToTextService = {
  async transcribe(base64Audio: string): Promise<SpeechResult> {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key ausente. Configure EXPO_PUBLIC_GOOGLE_API_KEY.');
    }

    const payload = {
      config: {
        languageCode: 'pt-BR',
        enableAutomaticPunctuation: true,
        model: 'latest_short',
      },
      audio: {
        content: base64Audio,
      },
    };

    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await axios.post(`${endpoint}?key=${apiKey}`, payload, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        });
        const alt = response.data?.results?.[0]?.alternatives?.[0];
        return {
          transcript: alt?.transcript ?? '',
          confidence: alt?.confidence ?? 0,
        };
      } catch (error: any) {
        lastError = error;
        const isQuota = error?.response?.status === 429;
        if (isQuota && attempt === 2) {
          throw new Error('Limite de requisicoes atingido. Tente novamente mais tarde.');
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Falha ao transcrever audio.');
  },
};
