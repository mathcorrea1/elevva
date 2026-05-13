import type { Child, StudentTrail, TrailArea, TrailTask } from '@/@types/navigation';
import type { LiteracyLevel } from '@/utils/literacy.levels';

const makeTask = (
  id: string,
  title: string,
  description: string,
  estimatedMinutes: number,
  activityType: TrailTask['activityType'],
): TrailTask => ({
  id,
  title,
  description,
  estimatedMinutes,
  completed: false,
  activityType,
});

const trailBlueprint = (
  childId: string,
  level: LiteracyLevel,
): Array<Omit<StudentTrail, 'status' | 'currentStep' | 'totalSteps'>> => [
  {
    id: `${childId}-trail-portugues`,
    area: 'portugues',
    title: 'Fundamentos de portugues',
    description: 'Consolidar letras, silabas e leitura inicial com trilha guiada.',
    recommendedForLevel: level,
    tasks: [
      makeTask('pt-1', 'Nome e letras iniciais', 'Identificar letras do nome e sons iniciais.', 12, 'reading'),
      makeTask('pt-2', 'Silabas em voz alta', 'Ler silabas simples com apoio visual.', 15, 'audio'),
      makeTask('pt-3', 'Escrita guiada', 'Escrever palavras curtas com apoio do adulto.', 15, 'writing'),
    ],
  },
  {
    id: `${childId}-trail-fono`,
    area: 'consciencia-fonologica',
    title: 'Consciencia fonologica',
    description: 'Treinar rima, segmentacao e combinacao de sons para ler melhor.',
    recommendedForLevel: level,
    tasks: [
      makeTask('fono-1', 'Jogo de rimas', 'Escolher palavras que rimam no fim.', 10, 'game'),
      makeTask('fono-2', 'Bater palmas por silaba', 'Separar palavras em silabas com palmas.', 12, 'game'),
      makeTask('fono-3', 'Som inicial', 'Identificar o som inicial de palavras simples.', 12, 'audio'),
    ],
  },
  {
    id: `${childId}-trail-leitura`,
    area: 'leitura',
    title: 'Leitura com compreensao',
    description: 'Evoluir da decodificacao para leitura funcional com sentido.',
    recommendedForLevel: level,
    tasks: [
      makeTask('leitura-1', 'Leitura de frases', 'Ler frases curtas com apoio de imagem.', 14, 'reading'),
      makeTask('leitura-2', 'Perguntas do texto', 'Responder perguntas simples sobre a leitura.', 10, 'game'),
      makeTask('leitura-3', 'Leitura em voz alta', 'Gravar audio lendo uma frase nova.', 15, 'audio'),
    ],
  },
  {
    id: `${childId}-trail-escrita`,
    area: 'escrita',
    title: 'Escrita autoral',
    description: 'Produzir pequenas frases e organizar ideias com apoio.',
    recommendedForLevel: level,
    tasks: [
      makeTask('escrita-1', 'Completar frase', 'Completar lacunas com palavras conhecidas.', 10, 'writing'),
      makeTask('escrita-2', 'Lista do dia', 'Escrever uma lista curta de objetos.', 12, 'writing'),
      makeTask('escrita-3', 'Bilhete simples', 'Criar bilhete curto para familia ou turma.', 14, 'writing'),
    ],
  },
  {
    id: `${childId}-trail-motora`,
    area: 'coord-motora',
    title: 'Apoio motor e visual',
    description: 'Atividades de base que apoiam escrita e atencao no processo alfabetico.',
    recommendedForLevel: level,
    tasks: [
      makeTask('motora-1', 'Tracado de linhas', 'Treinar tracos para melhorar controle do lapis.', 8, 'drawing'),
      makeTask('motora-2', 'Colorir por codigo', 'Colorir seguindo codigo de letras e cores.', 12, 'drawing'),
      makeTask('motora-3', 'Labirinto de silabas', 'Seguir caminho correto entre silabas.', 10, 'game'),
    ],
  },
];

const applyTrailProgressRules = (trail: StudentTrail, index: number, previousCompleted: boolean): StudentTrail => {
  const totalSteps = trail.tasks.length;
  const completedSteps = trail.tasks.filter((task) => task.completed).length;

  if (!previousCompleted && index > 0) {
    return {
      ...trail,
      status: 'locked',
      currentStep: completedSteps,
      totalSteps,
    };
  }

  if (completedSteps === totalSteps && totalSteps > 0) {
    return {
      ...trail,
      status: 'completed',
      currentStep: completedSteps,
      totalSteps,
    };
  }

  return {
    ...trail,
    status: completedSteps > 0 ? 'in-progress' : 'not-started',
    currentStep: completedSteps,
    totalSteps,
  };
};

export const hasCompletedAssessment = (child: Child): boolean =>
  child.assessmentCompleted ?? Boolean(child.progressHistory?.length);

export const buildLearningTrails = (childId: string, level: LiteracyLevel): StudentTrail[] => {
  // DECISION: sequencial unlock no MVP para manter progressao clara e baixa complexidade.
  const base = trailBlueprint(childId, level).map((trail) => ({
    ...trail,
    status: 'not-started' as const,
    currentStep: 0,
    totalSteps: trail.tasks.length,
  }));

  return normalizeTrails(base);
};

export const normalizeTrails = (trails: StudentTrail[]): StudentTrail[] => {
  let previousCompleted = true;

  return trails.map((trail, index) => {
    const normalized = applyTrailProgressRules(trail, index, previousCompleted);
    previousCompleted = normalized.status === 'completed';
    return normalized;
  });
};

export const getOrCreateChildTrails = (child: Child): StudentTrail[] =>
  normalizeTrails(child.learningTrails ?? buildLearningTrails(child.id, child.literacyLevel));

export const completeTrailTask = (
  trails: StudentTrail[],
  trailId: string,
  taskId: string,
): StudentTrail[] => {
  const updated = trails.map((trail) => {
    if (trail.id !== trailId) return trail;

    return {
      ...trail,
      tasks: trail.tasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task)),
    };
  });

  return normalizeTrails(updated);
};

export const trailAreaLabels: Record<TrailArea, string> = {
  avaliacao: 'Avaliacao',
  portugues: 'Portugues',
  'consciencia-fonologica': 'Consciencia fonologica',
  leitura: 'Leitura',
  escrita: 'Escrita',
  'coord-motora': 'Coordenacao motora',
};
