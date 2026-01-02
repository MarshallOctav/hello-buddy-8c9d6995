
export type Language = 'en' | 'id';

export enum TestCategory {
  PERSONAL = 'Personal & Life',
  PRODUCTIVITY = 'Productivity & Focus',
  FINANCE = 'Finance & Wealth',
  BUSINESS = 'Business & Ops',
  MARKETING = 'Marketing & Digital',
  CAREER = 'Career & Professional',
  LEADERSHIP = 'Leadership & Team',
  WELLBEING = 'Wellbeing & Lifestyle',
  TRAVEL = 'Travel & Experience',
  META = 'Meta & Future',
  DECISION = 'Decision & Opportunity',
  SYMBOLIC = 'Symbolic & Alignment',
}

export enum AccessLevel {
  FREE = 'FREE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}

export enum QuestionType {
  LIKERT = 'LIKERT',
  YES_NO = 'YES_NO',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CURRENCY_INPUT = 'CURRENCY_INPUT',
  NUMBER_INPUT = 'NUMBER_INPUT',
  PERCENTAGE_SELECT = 'PERCENTAGE_SELECT',
}

// B2B Organization Roles
export enum OrgRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
  MEMBER = 'MEMBER',
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: { value: number; label: string }[];
  weight?: number;
  reverse?: boolean;
  dimension?: string; // Key to group questions by dimension for radar chart
}

export interface Dimension {
  key: string;
  label: {
    en: string;
    id: string;
  };
}

export interface Methodology {
  name: string;
  author: string;
  source: string;
  description: string;
}

export interface Test {
  id: string;
  title: string;
  category: TestCategory;
  description: string;
  questions: Question[];
  accessLevel: AccessLevel;
  durationMinutes: number;
  imagePlaceholder?: string;
  methodology: Methodology;
  dimensions?: Dimension[]; // Dimensions for radar chart visualization
}

export interface TestResult {
  id: string;
  testId: string;
  date: string;
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Expert';
  details: Record<string, number>;
  recommendations: string[];
}

export interface UserStats {
  testsTaken: number;
  avgScore: number;
  streak: number;
  xp: number;
  level: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan: AccessLevel;
  planExpiresAt?: string;
  avatarUrl?: string;
  role?: string;
  orgRole?: OrgRole;
  bio?: string;
  joinedDate?: string;
  stats?: UserStats;
  referralCode?: string;
}

// B2B Related Types
export interface Organization {
  id: string;
  name: string;
  plan: AccessLevel;
}

export interface Group {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  avgScore: number;
}

export interface Assignment {
  id: string;
  testId: string;
  testTitle: string;
  groupId: string;
  groupName: string;
  dueDate: string;
  completionRate: number;
  status: 'ACTIVE' | 'COMPLETED';
  assignedBy: string;
}
