import type { Child } from '@/@types/navigation';
import { geminiService } from '@/services/ai/gemini.service';
import { speechToTextService } from '@/services/ai/speechToText.service';
import { calculateAge } from '@/utils/formatters';

/**
 * Hook with AI orchestration for transcription and literacy analysis.
 */
export const useAI = () => {
  const analyzeAudio = async (base64: string, child: Child) => {
    const transcription = await speechToTextService.transcribe(base64);
    const analysis = await geminiService.analyzeChildLiteracy(
      transcription.transcript,
      calculateAge(child.birthDate),
      child.literacyLevel,
    );
    return {
      transcription,
      analysis,
    };
  };

  return {
    analyzeAudio,
    generateRecommendations: geminiService.generateRecommendations,
    generateGuidance: geminiService.generateGuidance,
  };
};
