import type { Child, User } from '@/@types/navigation';
import { LiteracyLevel } from '@/utils/literacy.levels';

export const mockUser: User = {
  id: 'u-1',
  name: 'Maria Silva',
  email: 'maria@gmail.com',
  role: 'teacher',
};

export const mockChildren: Child[] = [
  {
    id: 'child-1',
    anonId: 'KID-001',
    name: 'Ana Beatriz',
    birthDate: '2019-04-10',
    school: 'E.M. Professora Sol',
    schoolId: 'school-1',
    turma: '2º Ano A',
    turmaId: 'turma-1',
    notes: 'Gosta de atividades com música.',
    observations:
      'Ana demonstra grande interesse em atividades rítmicas. Apresenta dificuldades com a associação de letras a sons, especialmente nas consoantes. Recomendo trabalhar com rimas e parlendas diariamente.',
    avatarColor: '#a855f7',
    tags: ['musical', 'criativa'],
    specialNeeds: {
      autism: false,
      dyslexia: false,
      adhd: true,
    },
    literacyLevel: LiteracyLevel.PRE_SILABICO,
    progress: 28,
    progressHistory: [
      { date: '2025-02-10', level: LiteracyLevel.PRE_SILABICO, score: 15, notes: 'Avaliação inicial' },
      { date: '2025-03-05', level: LiteracyLevel.PRE_SILABICO, score: 20, notes: 'Pequena evolução' },
      { date: '2025-04-12', level: LiteracyLevel.PRE_SILABICO, score: 28, notes: 'Reconhece o próprio nome' },
    ],
    bimestreReports: [
      {
        year: 2025,
        bimestre: 1,
        initialLevel: LiteracyLevel.PRE_SILABICO,
        finalLevel: LiteracyLevel.PRE_SILABICO,
        sessionsCompleted: 8,
        averageScore: 22,
        evolution: 7,
        notes: 'Primeiro bimestre de adaptação. Evoluiu na escrita do próprio nome.',
      },
    ],
    activities: [
      { id: 'a1', title: 'Reconhecimento de letras', type: 'audio', completed: true, level: LiteracyLevel.PRE_SILABICO, phrase: 'A BOLA É AZUL', createdAt: '2025-04-01' },
      { id: 'a2', title: 'Jogo das sílabas', type: 'game', completed: false, level: LiteracyLevel.PRE_SILABICO, createdAt: '2025-04-10' },
    ],
    recommendations: [
      { id: 'r1', title: 'Rimas em casa', description: 'Brinque com rimas por 10 minutos por dia.', urgency: 'medium', childId: 'child-1', category: 'Família' },
      { id: 'r1b', title: 'Música e ritmo', description: 'Use cantigas para trabalhar a consciência fonológica.', urgency: 'low', childId: 'child-1', category: 'Lúdico' },
    ],
    individualGuidance: [
      {
        id: 'ig1',
        title: 'Estratégias para TDAH em alfabetização',
        content: 'Sessões curtas de 10-15 minutos, com pausas ativas. Prefira atividades manipulativas como letras magnéticas. Estabeleça rotinas visuais claras.',
        category: 'school',
        createdAt: '2025-04-01',
      },
    ],
  },
  {
    id: 'child-2',
    anonId: 'KID-002',
    name: 'Lucas Mendes',
    birthDate: '2018-01-05',
    school: 'E.M. Professora Sol',
    schoolId: 'school-1',
    turma: '3º Ano B',
    turmaId: 'turma-2',
    avatarColor: '#0ea5e9',
    observations: 'Lucas apresenta boa oralidade mas dificuldade na representação escrita das sílabas. Está em processo de consolidação da hipótese silábica com valor sonoro.',
    specialNeeds: {
      dyslexia: true,
    },
    tags: ['comunicativo', 'oral'],
    literacyLevel: LiteracyLevel.SILABICO_COM_VALOR,
    progress: 61,
    progressHistory: [
      { date: '2025-02-10', level: LiteracyLevel.SILABICO_SEM_VALOR, score: 40, notes: 'Avaliação inicial' },
      { date: '2025-03-08', level: LiteracyLevel.SILABICO_SEM_VALOR, score: 48 },
      { date: '2025-04-15', level: LiteracyLevel.SILABICO_COM_VALOR, score: 61, notes: 'Avançou de nível!' },
    ],
    bimestreReports: [
      {
        year: 2025,
        bimestre: 1,
        initialLevel: LiteracyLevel.SILABICO_SEM_VALOR,
        finalLevel: LiteracyLevel.SILABICO_COM_VALOR,
        sessionsCompleted: 12,
        averageScore: 51,
        evolution: 18,
        notes: 'Excelente evolução. Avançou de nível no 1° bimestre.',
      },
    ],
    activities: [
      { id: 'a3', title: 'Leitura de sílabas', type: 'reading', completed: true, level: LiteracyLevel.SILABICO_COM_VALOR, phrase: 'BOLA BELA BOLO', createdAt: '2025-04-02' },
      { id: 'a4', title: 'Escrita espontânea', type: 'writing', completed: false, level: LiteracyLevel.SILABICO_COM_VALOR, createdAt: '2025-04-12' },
    ],
    recommendations: [
      { id: 'r2', title: 'Cartões de sílabas', description: 'Use cartões com ba-be-bi-bo-bu para consolidar o valor sonoro.', urgency: 'medium', childId: 'child-2', category: 'Leitura' },
    ],
    individualGuidance: [
      {
        id: 'ig2',
        title: 'Apoio para dislexia em sala',
        content: 'Use fontes mais legíveis (Dyslexie ou Arial). Dê tempo extra para atividades escritas. Prefira avaliação oral. Ofereça textos com espaçamento aumentado.',
        category: 'school',
        createdAt: '2025-03-15',
      },
    ],
  },
  {
    id: 'child-3',
    anonId: 'KID-003',
    name: 'Sofia Rodrigues',
    birthDate: '2017-09-23',
    school: 'E.M. Horizonte',
    schoolId: 'school-2',
    turma: '4º Ano A',
    turmaId: 'turma-3',
    avatarColor: '#22c55e',
    observations: 'Sofia está em estágio avançado da alfabetização. Consegue ler textos simples com autonomia. Precisa de estímulo para produção escrita espontânea.',
    specialNeeds: {},
    tags: ['leitora', 'independente'],
    literacyLevel: LiteracyLevel.SILABICO_ALFABETICO,
    progress: 79,
    progressHistory: [
      { date: '2025-02-10', level: LiteracyLevel.SILABICO_COM_VALOR, score: 60, notes: 'Avaliação inicial' },
      { date: '2025-03-10', level: LiteracyLevel.SILABICO_COM_VALOR, score: 68 },
      { date: '2025-04-08', level: LiteracyLevel.SILABICO_ALFABETICO, score: 79, notes: 'Lê palavras novas com estratégia' },
    ],
    bimestreReports: [
      {
        year: 2025,
        bimestre: 1,
        initialLevel: LiteracyLevel.SILABICO_COM_VALOR,
        finalLevel: LiteracyLevel.SILABICO_ALFABETICO,
        sessionsCompleted: 14,
        averageScore: 69,
        evolution: 19,
        notes: 'Progresso acima da média. Avançou um nível.',
      },
    ],
    activities: [
      { id: 'a5', title: 'Leitura em voz alta', type: 'audio', completed: true, level: LiteracyLevel.SILABICO_ALFABETICO, phrase: 'O GATO PULA O MURO', createdAt: '2025-04-05' },
      { id: 'a6', title: 'Diário ilustrado', type: 'writing', completed: false, level: LiteracyLevel.SILABICO_ALFABETICO, createdAt: '2025-04-14' },
    ],
    recommendations: [
      { id: 'r3', title: 'Diário ilustrado', description: 'Escreva pequenas frases sobre o dia com ilustração.', urgency: 'high', childId: 'child-3', category: 'Escrita' },
    ],
    individualGuidance: [
      {
        id: 'ig3',
        title: 'Produção escrita espontânea',
        content: 'Incentive diários, cartas e listas de compras. Valorize a escrita mesmo com erros ortográficos. O foco é a produção, não a perfeição.',
        category: 'writing',
        createdAt: '2025-04-01',
      },
    ],
  },
  {
    id: 'child-4',
    anonId: 'KID-004',
    name: 'Miguel Ferreira',
    birthDate: '2019-11-30',
    school: 'E.M. Professora Sol',
    schoolId: 'school-1',
    turma: '2º Ano A',
    turmaId: 'turma-1',
    avatarColor: '#f97316',
    observations: 'Miguel apresenta características do TEA que influenciam a alfabetização. Tem boa memória visual e se beneficia de rotinas estruturadas.',
    specialNeeds: {
      autism: true,
    },
    tags: ['visual', 'rotina'],
    literacyLevel: LiteracyLevel.PRE_SILABICO,
    progress: 18,
    progressHistory: [
      { date: '2025-02-10', level: LiteracyLevel.PRE_SILABICO, score: 10, notes: 'Avaliação inicial — adaptação necessária' },
      { date: '2025-03-20', level: LiteracyLevel.PRE_SILABICO, score: 14 },
      { date: '2025-04-18', level: LiteracyLevel.PRE_SILABICO, score: 18, notes: 'Reconhece 5 letras do alfabeto' },
    ],
    bimestreReports: [
      {
        year: 2025,
        bimestre: 1,
        initialLevel: LiteracyLevel.PRE_SILABICO,
        finalLevel: LiteracyLevel.PRE_SILABICO,
        sessionsCompleted: 6,
        averageScore: 14,
        evolution: 4,
        notes: 'Adaptação ao ambiente e à rotina. Progresso dentro do esperado considerando o contexto.',
      },
    ],
    activities: [
      { id: 'a7', title: 'Associação de letras e imagens', type: 'reading', completed: true, level: LiteracyLevel.PRE_SILABICO, createdAt: '2025-04-03' },
      { id: 'a8', title: 'Escrita do nome', type: 'writing', completed: false, level: LiteracyLevel.PRE_SILABICO, createdAt: '2025-04-16' },
    ],
    recommendations: [
      { id: 'r4', title: 'Comunicação visual', description: 'Use cartões PECS para apoiar a comunicação e a leitura.', urgency: 'high', childId: 'child-4', category: 'TEA' },
    ],
    individualGuidance: [
      {
        id: 'ig4',
        title: 'Estratégias para TEA na alfabetização',
        content: 'Use suportes visuais: alfabeto com imagens, agenda visual. Realize sessões curtas e previsíveis. Permita stims durante a atividade. Celebre cada pequena conquista explicitamente.',
        category: 'school',
        createdAt: '2025-03-10',
      },
    ],
  },
];

export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};
