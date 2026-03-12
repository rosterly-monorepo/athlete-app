// ── Athlete ──

export interface Athlete {
  id: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  sport: string;
  position: string;
  school: string;
  graduationYear: number;
  bio: string;
  isPublic: boolean;
}

export interface AthleteProfile extends Athlete {
  heightFeet: number;
  heightInches: number;
  weight: number;
  email: string;
}

export interface UpdateProfileInput {
  sport?: string;
  position?: string;
  school?: string;
  graduationYear?: number;
  heightFeet?: number;
  heightInches?: number;
  weight?: number;
  bio?: string;
  isPublic?: boolean;
}

// ── Performance ──

export interface CompetitionResult {
  id: string;
  athleteId: string;
  date: string;
  competitionName: string;
  event: string;
  result: string;
  unit: string;
  source: "manual" | "imported";
  providerName?: string;
}

export interface AddResultInput {
  date: string;
  competitionName: string;
  event: string;
  result: string;
  unit: string;
}

// ── Paginated response ──

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Organization Program ──

export interface OrganizationProgram {
  id: number;
  organization_id: number;
  sport_code: string;
  division: string | null;
  conference: string | null;
  region: string | null;
  program_website: string | null;
  recruiting_email: string | null;
  is_active: boolean;
  recruiting_status: "active" | "paused" | "closed" | null;
  created_at: string;
  updated_at: string;
}

// ── Recruitment ──

export type RecruitmentStage = "prospect" | "actively_recruiting" | "offer" | "recruited";

export type NoteType = "general" | "call" | "email" | "visit" | "evaluation";

export type Priority = "high" | "medium" | "low";

export interface RecruitmentNote {
  id: number;
  recruitment_record_id: number;
  coach_id: number;
  content: string;
  note_type: NoteType;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  coach_name: string | null;
}

export interface RecruitmentRecordWithAthlete {
  id: number;
  program_id: number;
  athlete_id: number;
  added_by_coach_id: number;

  // Stage & ordering
  stage: RecruitmentStage;
  stage_order: number;
  stage_changed_at: string;

  // Evaluation
  priority: Priority | null;
  rating: number | null; // 1-5
  tags: string[] | null;

  // Context
  sport_code: string | null;
  position: string | null;
  graduation_year: number | null;

  // Follow-up tracking
  last_contact_at: string | null;
  next_followup_at: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  archived_at: string | null;

  // Denormalized athlete fields
  athlete_first_name: string;
  athlete_last_name: string;
  athlete_avatar_url: string | null;
  athlete_school: string | null;
  athlete_graduation_year: number | null;
  athlete_gpa: number | null;

  // Note summary
  note_count: number;
  latest_note: string | null;
}

export interface RecruitmentRecordDetail extends RecruitmentRecordWithAthlete {
  notes: RecruitmentNote[];
  added_by_name: string | null;
}

export interface RecruitmentBoardColumn {
  stage: RecruitmentStage;
  stage_label: string;
  records: RecruitmentRecordWithAthlete[];
  count: number;
}

export interface RecruitmentBoard {
  program_id: number;
  columns: RecruitmentBoardColumn[];
  total_count: number;
}

// ── Recruitment Inputs ──

export interface AddRecordInput {
  athlete_id: number;
  stage?: RecruitmentStage;
  priority?: Priority;
  rating?: number;
  sport_code?: string;
  position?: string;
  tags?: string[];
  initial_note?: string;
}

export interface UpdateRecordInput {
  stage?: RecruitmentStage;
  stage_order?: number;
  priority?: Priority;
  rating?: number;
  position?: string;
  tags?: string[];
  last_contact_at?: string;
  next_followup_at?: string;
}

export interface MoveRecordInput {
  new_stage: RecruitmentStage;
  new_order: number;
}

export interface ReorderInput {
  stage: RecruitmentStage;
  record_ids: number[];
}

export interface AddNoteInput {
  content: string;
  note_type?: NoteType;
  is_private?: boolean;
}

export interface UpdateNoteInput {
  content?: string;
  note_type?: NoteType;
  is_private?: boolean;
}
