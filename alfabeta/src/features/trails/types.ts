import type { Journey, JourneyStage, Student } from '@/shared/contracts';
import type { Characteristics } from '@/features/students/Characteristics';
export type ImageRef = {
  builtin?: 'garden' | 'sky' | 'sprout' | 'butterfly' | 'boat' | 'milestone' | 'lumi' | null;
  asset_id?: string | null;
  alt: string;
};
export type TrailDefinition = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  cover: ImageRef | null;
  scenario: 'garden' | 'sky';
  availability: 'sequential' | 'free';
  status: string;
  version: number;
  archived_at?: string | null;
  lessons: LessonDefinition[];
};
export type TrailSummary = Omit<TrailDefinition,'lessons'> & {lesson_count:number};
export type LessonDefinition = {
  key: string;
  title: string;
  objective: string;
  image: ImageRef | null;
  instructions: string;
  concise_instructions: string;
  advance_percent: number | null;
  lesson_revision_id?: string | null;
  contents: {
    id: string;
    version: number;
    title: string;
    items: {
      id: string;
      prompt: string;
      choices: string[];
      answer: number;
      skill?: string;
      required?: boolean;
      reading_allowed: boolean;
    }[];
  }[];
};
export type Enrollment = {
  id: string;
  trail_id: string;
  version: number;
  title: string;
  description: string;
  cover: ImageRef | null;
  status: string;
  completed_lessons: number;
  total_lessons: number;
  completed_tasks: number;
  total_tasks: number;
};
export type LessonStage = Omit<JourneyStage, 'tasks'> & {
  enrollment_id: string | null;
  lesson: Omit<LessonDefinition, 'contents'>;
  tasks: (JourneyStage['tasks'][number] & {
    latest_result: ObjectiveResult | null;
    attempt_count: number;
    runner?: 'choices' | 'screens';
  })[];
};
export type TrailMap = TrailDefinition & {
  enrollment_id: string;
  journey: Omit<Journey, 'stages'> & { stages: LessonStage[] };
};
export type ObjectiveResult = {
  pending_review?: number;
  correct: number;
  valid_items: number;
  total_items: number;
  required_items: number;
  required_answered: number;
  advance_percent: number | null;
  passed: boolean;
  scale: null;
  note: string;
};
export type Care = {
  presentation: {
    instruction_mode: 'standard' | 'concise' | 'audio';
    prefer_linear: boolean;
    font_scale: 1 | 1.25 | 1.5;
  };
  can_view_sensitive: boolean;
  can_edit: boolean;
  communication?: string;
  sensitive_notes?: string;
  characteristics?: Characteristics;
  version: number;
  author_id?: string;
  updated_at?: string;
};
export type StudentContext = { student: Student };
