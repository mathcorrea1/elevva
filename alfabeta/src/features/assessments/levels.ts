// Presentation labels for existing exact codes; this is not a classification rubric.
export const levelLabels: Record<string, string> = {
  'pre-silabico': 'Pré-silábico',
  silabico: 'Silábico · registro sem detalhamento',
  'silabico-sem-valor': 'Silábico sem valor sonoro',
  'silabico-com-valor': 'Silábico com valor sonoro',
  'silabico-alfabetico': 'Silábico-alfabético',
  alfabetico: 'Alfabético',
};
export const literacyOptions = Object.entries(levelLabels)
  .filter(([value]) => value !== 'silabico')
  .map(([value, label]) => ({ value, label }));
export const levelLabel = (value: string | null | undefined) =>
  value ? levelLabels[value] || 'Código de nível não reconhecido' : 'Ainda não confirmado';
