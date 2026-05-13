import type { NavigatorScreenParams } from '@react-navigation/native';

import type { LiteracyLevel } from '@/utils/literacy.levels';

export type UserRole = 'guardian' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SpecialNeeds {
  autism?: boolean;
  dyslexia?: boolean;
  adhd?: boolean;
  dyscalculia?: boolean;
  visualImpairment?: boolean;
  hearingImpairment?: boolean;
  other?: string;
}

export interface ProgressEntry {
  date: string;
  level: LiteracyLevel;
  score: number;
  activityId?: string;
  notes?: string;
}

export interface BimestreReport {
  year: number;
  bimestre: 1 | 2 | 3 | 4;
  initialLevel: LiteracyLevel;
  finalLevel: LiteracyLevel;
  sessionsCompleted: number;
  averageScore: number;
  evolution: number;
  notes?: string;
}

export interface ChildActivity {
  id: string;
  title: string;
  type: 'audio' | 'writing' | 'reading' | 'game';
  completed: boolean;
  level: LiteracyLevel;
  phrase?: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  childId?: string;
  category?: string;
}

export type TrailArea =
  | 'avaliacao'
  | 'portugues'
  | 'consciencia-fonologica'
  | 'leitura'
  | 'escrita'
  | 'coord-motora';

export type TrailStatus = 'locked' | 'not-started' | 'in-progress' | 'completed';

export interface TrailTask {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  activityType: 'audio' | 'writing' | 'reading' | 'game' | 'drawing';
}

export interface StudentTrail {
  id: string;
  area: TrailArea;
  title: string;
  description: string;
  status: TrailStatus;
  recommendedForLevel: LiteracyLevel;
  currentStep: number;
  totalSteps: number;
  tasks: TrailTask[];
}

export interface IndividualGuidance {
  id: string;
  title: string;
  content: string;
  category: 'phonological' | 'reading' | 'writing' | 'emotional' | 'family' | 'school';
  createdAt: string;
}

export interface Turma {
  id: string;
  name: string;
  year?: string;
}

export interface School {
  id: string;
  name: string;
  turmas: Turma[];
}

export interface Child {
  id: string;
  anonId: string;
  name: string;
  birthDate: string;
  school?: string;
  schoolId?: string;
  turma?: string;
  turmaId?: string;
  avatarColor: string;
  notes?: string;
  observations?: string;
  tags?: string[];
  specialNeeds?: SpecialNeeds;
  literacyLevel: LiteracyLevel;
  progress: number;
  assessmentCompleted?: boolean;
  learningTrails?: StudentTrail[];
  progressHistory?: ProgressEntry[];
  bimestreReports?: BimestreReport[];
  activities: ChildActivity[];
  recommendations: Recommendation[];
  individualGuidance?: IndividualGuidance[];
}

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type ChildStackParamList = {
  ChildList: undefined;
  ChildDetail: { childId: string };
  AddChild: undefined;
  ChildProgress: { childId: string };
  StudentReport: { childId: string };
  Assessment: { childId?: string };
  TrailList: { childId: string };
  TrailDetail: { childId: string; trailId: string };
};

export type ActivitiesStackParamList = {
  ActivityList: undefined;
  ActivityDetail: { activityId: string; childId?: string };
  AudioActivity: { childId: string; activityId: string; phrase?: string };
  CreateActivity: { childId?: string };
};

export type GuidanceStackParamList = {
  GuidanceList: undefined;
  GuidanceDetail: { guidanceId: string; childId?: string };
  CreateGuidance: { childId?: string };
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Children: NavigatorScreenParams<ChildStackParamList>;
  Activities: NavigatorScreenParams<ActivitiesStackParamList>;
  Reports: undefined;
  Guidance: NavigatorScreenParams<GuidanceStackParamList>;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
