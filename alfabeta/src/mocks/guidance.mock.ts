import { LiteracyLevel } from '@/utils/literacy.levels';

export interface GuidanceItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'casa' | 'leitura' | 'emocional' | 'escola';
  level?: LiteracyLevel;
}

export const guidanceMock: GuidanceItem[] = [
  {
    id: 'g1',
    title: 'Rotina curta de leitura em casa',
    summary: '10 minutos diarios fazem diferenca.',
    content: 'Escolha um horario fixo e leia em voz alta com a crianca. Convide para repetir palavras-chave.',
    category: 'casa',
    level: LiteracyLevel.PRE_SILABICO,
  },
  {
    id: 'g2',
    title: 'Como apoiar a hipotese silabica',
    summary: 'Valorize as tentativas de escrita.',
    content: 'Evite corrigir em excesso. Pergunte que som cada letra representa e amplie com novas pistas.',
    category: 'escola',
    level: LiteracyLevel.SILABICO_SEM_VALOR,
  },
  {
    id: 'g3',
    title: 'Jogos com cartoes de silabas',
    summary: 'Atividade ludica para consolidar sons.',
    content: 'Monte pares de silabas e palavras curtas. Incentive leitura em duplas.',
    category: 'leitura',
    level: LiteracyLevel.SILABICO_COM_VALOR,
  },
  {
    id: 'g4',
    title: 'Leitura compartilhada por turnos',
    summary: 'Adulto e crianca leem alternadamente.',
    content: 'Use frases curtas e mantenha ritmo acolhedor. Releia com enfase em palavras novas.',
    category: 'leitura',
    level: LiteracyLevel.SILABICO_ALFABETICO,
  },
  {
    id: 'g5',
    title: 'Diario ilustrado semanal',
    summary: 'Escrita com sentido pessoal.',
    content: 'Pequenos relatos com desenhos ajudam na motivacao para escrever e reler.',
    category: 'casa',
    level: LiteracyLevel.ALFABETICO,
  },
  {
    id: 'g6',
    title: 'Evite comparacoes entre criancas',
    summary: 'Cada processo tem ritmo proprio.',
    content: 'Reforce avancos individuais e celebre pequenas conquistas.',
    category: 'emocional',
  },
  {
    id: 'g7',
    title: 'Organize um canto de leitura',
    summary: 'Ambiente influencia engajamento.',
    content: 'Reserve um espaco com livros acessiveis, almofadas e boa iluminacao.',
    category: 'casa',
  },
  {
    id: 'g8',
    title: 'Parceria familia-escola',
    summary: 'Feedback continuo acelera progresso.',
    content: 'Compartilhe observacoes da rotina com professores e alinhe metas mensais.',
    category: 'escola',
  },
];
