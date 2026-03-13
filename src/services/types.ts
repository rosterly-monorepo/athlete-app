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

export interface PersonalInfo {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  preferredName: string | null;
  dateOfBirth: string | null;
  heightFeet: number | null;
  heightInches: number | null;
  weightLbs: number | null;
}

export interface Address {
  id: number;
  streetLine1: string | null;
  streetLine2: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  country: string;
  isVerified: boolean;
}

export interface ContactDetails {
  id: number;
  phonePrimary: string | null;
  phoneSecondary: string | null;
  emailPrimary: string | null;
  emailSecondary: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialLinkedin: string | null;
  socialTiktok: string | null;
}

export interface Demographics {
  id: number;
  gender: string | null;
  legalSex: string | null;
  pronouns: string | null;
  isMilitaryConnected: boolean | null;
  militaryStatus: string | null;
  militaryBranch: string | null;
  ethnicity: string[] | null;
}

export interface Education {
  id: number;
  highSchoolName: string | null;
  highSchoolCity: string | null;
  highSchoolState: string | null;
  highSchoolCeeb: string | null;
  graduationYear: number | null;
  gpaUnweighted: number | null;
  gpaWeighted: number | null;
  gpaScale: number;
  classRank: number | null;
  classSize: number | null;
  ncaaCoreGpa: number | null;
  transcriptUrl: string | null;
  transcriptUploadedAt: string | null;
}

export interface Testing {
  id: number;
  satTotal: number | null;
  satReadingWriting: number | null;
  satMath: number | null;
  satDate: string | null;
  actComposite: number | null;
  actEnglish: number | null;
  actMath: number | null;
  actReading: number | null;
  actScience: number | null;
  actWriting: number | null;
  actDate: string | null;
  apScores: Record<string, unknown>[] | null;
  isTestOptional: boolean;
}

export interface FamilyInfo {
  id: number;
  isFirstGenCollege: boolean | null;
  parent1Education: string | null;
  parent2Education: string | null;
  needsFinancialAid: boolean | null;
  estimatedFamilyContribution: string | null;
  siblingCount: number | null;
  siblingsInCollege: number | null;
  legacySchools: string[] | null;
}

export interface Writing {
  id: number;
  personalStatement: string | null;
  personalStatementWordCount: number | null;
  personalStatementUpdatedAt: string | null;
  essays: Record<string, unknown>[] | null;
  athleticStatement: string | null;
  athleticStatementWordCount: number | null;
}

export interface AthleteProfile extends Athlete {
  heightFeet: number;
  heightInches: number;
  weight: number;
  email: string;
  personalInfo: PersonalInfo | null;
  address: Address | null;
  contactDetails: ContactDetails | null;
  demographics: Demographics | null;
  education: Education | null;
  testing: Testing | null;
  familyInfo: FamilyInfo | null;
  writing: Writing | null;
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
  // Recruiting requirements
  minimum_gpa: number | null;
  minimum_sat: number | null;
  minimum_act: number | null;
  minimum_height_inches: number | null;
  graduation_years_of_interest: number[] | null;
  geographic_preferences: string[] | null;
  citizenship_requirements: string | null;
  roster_spots: number | null;
  created_at: string;
  updated_at: string;
}

// ── Recruitment ──

export type RecruitmentStage =
  | "interested"
  | "initial_outreach"
  | "initial_call"
  | "monitoring"
  | "pre_read"
  | "offer_extended"
  | "committed"
  | "likely_letter"
  | "admitted";

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
