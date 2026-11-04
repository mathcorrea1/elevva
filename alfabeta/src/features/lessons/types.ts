import type { ImageRef, ObjectiveResult } from '@/features/trails/types';
export type ResponseValue = string | string[] | Record<string, string> | null;
export type Mechanic = 'single' | 'multiple' | 'order' | 'matching' | 'text';
export type Element = { id: string; text: string; image?: ImageRef | null };
export type Question = {
  id: string;
  kind: Mechanic;
  prompt: string;
  skill: string;
  instruction: string;
  image: ImageRef | null;
  options: Element[];
  targets: Element[];
  answer?: ResponseValue;
  required: boolean;
  reading_allowed: boolean;
  normalization: {
    ignore_case: boolean;
    ignore_accents: boolean;
    collapse_spaces: boolean;
    unmatched: 'incorrect' | 'human_review';
  };
  feedback_correct: string;
  feedback_incorrect: string;
  hint: string;
  allow_retry: boolean;
  max_attempts: number | null;
};
export type LessonScreenData = {
  id: string;
  type: 'text' | 'image' | 'video' | 'text_image' | 'text_video' | 'activity' | 'completion';
  title: string;
  text: string;
  instruction: string;
  image: ImageRef | null;
  video_id: string | null;
  transcript: string;
  media_reviewed: boolean;
  question?: Question | null;
  item_id?: string;
};
export type LessonBody = {
  description: string;
  objective: string;
  difficulty: 'not_defined' | 'initial' | 'practice' | 'extension';
  skills: string[];
  audience: string;
  adaptations: string;
  cover: ImageRef | null;
  screens: LessonScreenData[];
  visibility: 'private' | 'public';
  require_review_for_advance: boolean;
};
export type Lesson = {
  id: string;
  title: string;
  version: number;
  revision_id: string;
  status: string;
  author_id: string;
  author_name?: string;
  origin_content_id: string | null;
  origin_version: number | null;
  description: string;
  cover: ImageRef | null;
  screen_count: number;
  activity_kinds: Mechanic[];
  permissions: { edit: boolean; copy: boolean; redistribute: boolean };
  body: LessonBody;
  share_id?: string;
};
export type Feedback = { correct: boolean | null; needs_review: boolean; feedback: string };
export type LessonAttempt = {
  id: string;
  version: number;
  status: 'in_progress' | 'finished';
  cursor: number;
  visited: string[];
  responses: Record<string, ResponseValue>;
  drafts: Record<string, ResponseValue>;
  items: Question[];
  screens: LessonScreenData[];
  lesson_title: string;
  item_results: Record<string, Feedback>;
  result: ObjectiveResult & { pending_review: number };
  interactions: { kind: string; item_id: string; correct?: boolean | null }[];
  interaction_counts?: Record<string, number>;
};
export type Paged<T> = { items: T[]; total: number; next_offset: number | null; offset?: number };
export const mechanics: { value: Mechanic; label: string }[] = [
  { value: 'single', label: 'Escolha única' },
  { value: 'multiple', label: 'Mais de uma resposta' },
  { value: 'order', label: 'Montar uma sequência' },
  { value: 'matching', label: 'Associar pares' },
  { value: 'text', label: 'Resposta escrita' },
];
export function emptyValue(kind: Mechanic): ResponseValue {
  return kind === 'text' ? '' : kind === 'single' ? null : kind === 'matching' ? {} : [];
}
export function responseReady(q: Question, v: ResponseValue) {
  if (q.kind === 'text') return typeof v === 'string' && !!v.trim();
  if (q.kind === 'single') return typeof v === 'string' && q.options.some((o) => o.id === v);
  if (q.kind === 'matching')
    return (
      !!v &&
      !Array.isArray(v) &&
      typeof v === 'object' &&
      Object.keys(v).length === q.options.length
    );
  return Array.isArray(v) && (q.kind === 'order' ? v.length === q.options.length : v.length > 0);
}
