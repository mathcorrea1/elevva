import type { Student, Report } from '@/shared/contracts';
export type EvidenceRow = {
  evidence_id: string;
  assignment_id: string;
  content_id: string;
  content_version: number;
  title: string;
  item_id: string;
  prompt: string;
  skill: string;
  response: string;
  correct: boolean | null;
  needs_review?: boolean;
  confirmations?: number | null;
  latest_response?: string;
  response_event_id?: string | null;
  review?: { author_id: string; at: string; note: string } | null;
  reading_allowed: boolean;
  supports_used: string[];
  date: string;
  student_id: string;
};
export type ComparableGroup = {
  content_id: string;
  content_version: number;
  item_id: string;
  title: string;
  prompt: string;
  skill: string;
  supports_used: string[];
  responses: number;
  correct: number;
  pending_review?: number;
  students: number;
  errors: { response: string; count: number }[];
  evidence_ids: string[];
};
export type OverviewStudent = Student & {
  category: string;
  last_assessment: string | null;
  completed_tasks: number;
  finished_attempts: number;
  completed_lessons: number;
  assessments: number;
  observations: number;
  pending_reviews: number;
  attention: {
    kind: string;
    reason: string;
    evidence_ids: string[];
    action: 'Assessment' | 'Analysis' | 'Student';
  }[];
};
export type Overview = {
  scope: 'school' | 'family';
  students: OverviewStudent[];
  totals: Record<string, number>;
  level_distribution: { level: string; count: number }[];
  series: Report['series'];
  comparable_groups: ComparableGroup[];
  observed_support: {
    student_id: string;
    evidence_id: string;
    skill: string;
    text: string;
    support: string;
    date: string;
  }[];
  options: { students: { id: string; name: string }[]; skills: string[]; supports: string[] };
  assessment_freshness: { rule: null; outdated: null; note: string };
  limitations: string[];
  pagination: { total: number; offset: number; limit: number; next_offset: number | null };
  detail_scope: string;
};
export function categoryLabel(level: string) {
  return (
    (
      {
        'pre-silabico': 'Pré-silábico',
        silabico: 'Silábico',
        'silabico-sem-valor': 'Silábico sem valor sonoro',
        'silabico-com-valor': 'Silábico com valor sonoro',
        'silabico-alfabetico': 'Silábico-alfabético',
        alfabetico: 'Alfabético',
        unassessed: 'Sem avaliação registrada',
        unconfirmed: 'Avaliado · nível não confirmado',
      } as Record<string, string>
    )[level] || 'Nível não identificado'
  );
}
export function supportLabel(key: string) {
  return (
    (
      {
        instruction_audio: 'Leitura de instrução',
        large_text: 'Fonte ampliada',
        high_contrast: 'Alto contraste',
      } as Record<string, string>
    )[key] || key
  );
}
