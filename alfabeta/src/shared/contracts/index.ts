export type Student = {
  id: string;
  name: string;
  role: 'owner' | 'guardian' | 'teacher';
  supports: string[];
  confirmed_level: string | null;
  version: number;
  birth_date?: string | null;
  next_step?: 'assessment' | 'activity';
};
export type Content = {
  id: string;
  title: string;
  kind: 'activity' | 'guidance' | 'instrument';
  status: string;
  body: {
    instructions: string;
    items: (Item & { answer?: number })[];
    rubric_text?: string | null;
  };
  version: number;
  author_id?: string;
  review?: { approved: boolean; reviewed_at: string } | null;
  archived_at?: string | null;
};
export type Assignment = {
  id: string;
  title: string;
  locked: boolean;
  completed_at: string | null;
};
export type Item = { id: string; prompt: string; choices: string[]; reading_allowed: boolean;required?:boolean;skill?:string };
export type Attempt = {
  id: string;
  version: number;
  responses: Record<string, number>;
  items: Item[];
  instructions: string;
  status: string;
};
export type Report = {
  series: { day: string; activities: number; assessments: number; observations: number }[];
  completed_stages: number;
  total_stages: number;
  completed_trails:number;
  total_trails:number;
  achievements: { id: string; title: string; description: string }[];
  student_id: string;
  completed_tasks: number;
  assigned_tasks: number;
  finished_attempts: number;
  observations: number;
  assessments: number;
  confirmed_level: string | null;
  limitations: string[];
  comparable_results: { title: string; responses: number; correct: number }[];
  events: LearningEvent[];
};
export type JourneyTask = Assignment & {
  state: 'completed' | 'locked' | 'available' | 'in_progress';
  instructions: string;
  item_count: number;
  block_reason: string | null;
};
export type JourneyStage = {
  id: string;
  title: string;
  description: string;
  state: JourneyTask['state'];
  completed: number;
  total: number;
  tasks: JourneyTask[];
};
export type Journey = {
  stages: JourneyStage[];
  completed_tasks: number;
  total_tasks: number;
  achievements: Report['achievements'];
  assessment_required: boolean;
  note: string;
};
export type LearningEvent = {
  id: string;
  kind: string;
  created_at: string;
  context?: string;
  text?: string;
  instrument?: string;
  status?: string;
  finished_at?: string | null;
  level?: string;
  justification?: string;
  evidence?: { item: string; response: string }[];
  details?:{skill?:string;support?:string;needs_support?:boolean};
};
export type Analysis = {
  snapshot?:{evidence:{id:string;type:string;content_omitted?:string}[]};
  id: string;
  status: string;
  model: string;
  origin: string;
  review: string | null;
  reviewed_at?: string | null;
  revised_result?: { summary: string } | null;
  review_note?: string | null;
  created_at: string;
  result: null | {
    state: string;
    suggested_level: string | null;
    summary: string;
    limitations: string[];
    recommendations: { activity_id: string; reason: string }[];
  };
};
