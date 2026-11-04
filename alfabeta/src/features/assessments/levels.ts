// Presentation labels for existing exact codes; this is not a classification rubric.
export const levelLabels: Record<string, string> = {
  'pre-silabico': 'Pré-silábico', silabico: 'Silábico',
  'silabico-alfabetico': 'Silábico-alfabético', alfabetico: 'Alfabético',
};
export const levelLabel = (value: string | null | undefined) => value ? levelLabels[value] || 'Código de nível não reconhecido' : 'Ainda não confirmado';
