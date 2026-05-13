import type { Child, Recommendation } from '@/@types/navigation';
import { LiteracyLevel } from '@/utils/literacy.levels';

interface LiteracyAnalysisResult {
  detectedLevel: LiteracyLevel;
  rationale: string;
}

const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const cache = new Map<string, string>();

const askGemini = async (prompt: string): Promise<string> => {
  if (cache.has(prompt)) return cache.get(prompt) as string;
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key ausente. Configure EXPO_PUBLIC_GEMINI_API_KEY.');
  }
  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  });
  if (!response.ok) {
    throw new Error('Nao foi possivel consultar IA neste momento.');
  }
  const data = (await response.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  cache.set(prompt, text);
  return text;
};

const parseLevel = (text: string): LiteracyLevel => {
  const normalized = text.toLowerCase();
  if (normalized.includes(LiteracyLevel.ALFABETICO)) return LiteracyLevel.ALFABETICO;
  if (normalized.includes(LiteracyLevel.SILABICO_ALFABETICO)) return LiteracyLevel.SILABICO_ALFABETICO;
  if (normalized.includes(LiteracyLevel.SILABICO_COM_VALOR)) return LiteracyLevel.SILABICO_COM_VALOR;
  if (normalized.includes(LiteracyLevel.SILABICO_SEM_VALOR)) return LiteracyLevel.SILABICO_SEM_VALOR;
  return LiteracyLevel.PRE_SILABICO;
};

/**
 * Gemini service for literacy analysis and recommendations.
 */
export const geminiService = {
  async analyzeChildLiteracy(
    transcript: string,
    childAge: number,
    previousLevel?: LiteracyLevel,
  ): Promise<LiteracyAnalysisResult> {
    const prompt = [
      'Voce e especialista em alfabetizacao infantil baseada em Emilia Ferreiro.',
      `Idade da crianca: ${childAge}`,
      `Nivel anterior: ${previousLevel ?? 'nao informado'}`,
      `Transcricao: ${transcript}`,
      'Retorne em portugues no formato JSON com campos: detectedLevel e rationale.',
      `detectedLevel deve ser um destes valores exatos: ${Object.values(LiteracyLevel).join(', ')}`,
    ].join('\n');

    const raw = await askGemini(prompt);
    try {
      const parsed = JSON.parse(raw) as LiteracyAnalysisResult;
      return {
        detectedLevel: parsed.detectedLevel,
        rationale: parsed.rationale,
      };
    } catch {
      return {
        detectedLevel: parseLevel(raw),
        rationale: raw,
      };
    }
  },
  async generateRecommendations(child: Child): Promise<Recommendation[]> {
    const prompt = [
      'Gere 3 recomendacoes pedagogicas praticas em JSON para responsavel.',
      `Crianca: ${child.name}, nivel: ${child.literacyLevel}, progresso: ${child.progress}`,
      'Formato: array de objetos com id, title, description, urgency (low|medium|high).',
    ].join('\n');
    const raw = await askGemini(prompt);
    try {
      return JSON.parse(raw) as Recommendation[];
    } catch {
      return [
        {
          id: `rec-${Date.now()}`,
          title: 'Leitura compartilhada diaria',
          description: 'Leia por 15 minutos e converse sobre as palavras mais importantes.',
          urgency: 'medium',
        },
      ];
    }
  },
  async generateGuidance(level: LiteracyLevel): Promise<string> {
    const prompt = [
      'Crie orientacoes objetivas para responsaveis de crianca em alfabetizacao.',
      `Nivel atual: ${level}`,
      'Tom acolhedor, foco em praticas da rotina domestica e escolar.',
    ].join('\n');
    return askGemini(prompt);
  },
};
