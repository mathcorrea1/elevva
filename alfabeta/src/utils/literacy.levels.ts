export enum LiteracyLevel {
  PRE_SILABICO = 'pre-silabico',
  SILABICO_SEM_VALOR = 'silabico-sem-valor',
  SILABICO_COM_VALOR = 'silabico-com-valor',
  SILABICO_ALFABETICO = 'silabico-alfabetico',
  ALFABETICO = 'alfabetico',
}

export const literacyLevels = {
  [LiteracyLevel.PRE_SILABICO]: {
    label: 'Pre-silabico',
    description: 'Ainda nao relaciona letras e sons com estabilidade.',
    color: '#a855f7',
    icon: 'sparkles',
    criteria: ['Uso aleatorio de letras', 'Sem valor sonoro estavel'],
    activities: ['Nome proprio com apoio visual', 'Jogos de rimas e sons'],
  },
  [LiteracyLevel.SILABICO_SEM_VALOR]: {
    label: 'Silabico sem valor',
    description: 'Representa silabas, mas sem correspondencia sonora adequada.',
    color: '#f97316',
    icon: 'grid',
    criteria: ['Uma letra por silaba', 'Escolha de letras sem valor fonetico'],
    activities: ['Separacao oral de silabas', 'Cartoes de silabas'],
  },
  [LiteracyLevel.SILABICO_COM_VALOR]: {
    label: 'Silabico com valor',
    description: 'Ja relaciona parte da sonoridade as letras escolhidas.',
    color: '#f59e0b',
    icon: 'musical-notes',
    criteria: ['Uma letra por silaba com valor sonoro', 'Hipoteses foneticas iniciais'],
    activities: ['Ditado de silabas simples', 'Leitura de palavras curtas'],
  },
  [LiteracyLevel.SILABICO_ALFABETICO]: {
    label: 'Silabico-alfabetico',
    description: 'Transicao entre escrita silabica e alfabetica.',
    color: '#22c55e',
    icon: 'git-merge',
    criteria: ['Algumas silabas completas', 'Mistura de hipoteses'],
    activities: ['Leitura compartilhada', 'Escrita guiada de frases'],
  },
  [LiteracyLevel.ALFABETICO]: {
    label: 'Alfabetico',
    description: 'Relaciona grafemas e fonemas de modo consistente.',
    color: '#0ea5e9',
    icon: 'trophy',
    criteria: ['Escrita convencional predominante', 'Leitura funcional inicial'],
    activities: ['Producao de pequenos textos', 'Leitura autonoma orientada'],
  },
} as const;
