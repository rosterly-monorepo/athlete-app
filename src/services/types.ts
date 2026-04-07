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

export interface Academics {
  id: number;
  // Education fields
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
  // Testing fields
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
  // Document fields
  transcriptUrl: string | null;
  transcriptUploadedAt: string | null;
  satScoreUrl: string | null;
  satScoreUploadedAt: string | null;
  actScoreUrl: string | null;
  actScoreUploadedAt: string | null;
  // Academic Index (computed)
  cgs: number | null;
  raiCgs: number | null;
  raiSat: number | null;
  raiAct: number | null;
  academicIndex: number | null;
  // Document extraction status
  extractionStatus: string | null;
  extractionFields: string[] | null;
  extractionError: string | null;
  extractionCompletedAt: string | null;
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
  academics: Academics | null;
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
  scoring_config: ScoringConfig | null;
  created_at: string;
  updated_at: string;
}

// ── Scoring / Metrics ──

export interface MetricInfo {
  field_name: string;
  label: string;
  unit: string | null;
  display_format: string | null;
  default_weight: number;
  scorer_label: string;
}

export interface AvailableMetricsResponse {
  metrics: MetricInfo[];
}

export interface MetricWeight {
  field_name: string;
  weight: number;
  enabled: boolean;
}

export interface ScoringConfig {
  metrics: MetricWeight[];
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
  // Denormalized athlete fields
  athlete_first_name: string;
  athlete_last_name: string;
  athlete_avatar_url: string | null;
  athlete_school: string | null;
  athlete_graduation_year: number | null;
  athlete_academic_index: number | null;

  // Communication tracking
  last_communication_at: string | null;

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

// ── Search ──

export interface SearchFilterOption {
  value: string;
  label: string;
}

export interface SearchFilterSchema {
  field: string;
  filter_type: "range" | "checkboxes" | "toggle";
  value_type: "range" | "set" | "boolean";
  label: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  display_format?: string;
  options?: SearchFilterOption[];
  options_from_agg: boolean;
  group: string;
  order: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  order: number;
  sport_code: string | null;
}

export interface SortOption {
  value: string;
  label: string;
  sport_code: string | null;
}

export interface OrderingMetric {
  field: string;
  label: string;
  sport_code: string;
  default_weight: number;
  unit: string | null;
  display_format: string | null;
}

export interface SearchFiltersResponse {
  filters: SearchFilterSchema[];
  groups: FilterGroup[];
  sort_options: SortOption[];
  ordering_metrics: OrderingMetric[];
}

export interface AthleteSearchRequest {
  query?: string;
  filters: Record<string, unknown>;
  sort_by: string;
  metric_weights?: Record<string, number>;
  offset: number;
  limit: number;
}

// ── Coach Athlete View ──

export interface ReferenceCoachView {
  id: number;
  first_name: string;
  last_name: string;
  organization: string | null;
  email: string | null;
  phone: string | null;
  display_order: number;
}

export interface RowingConfigView {
  id: number;
  primary_side: string | null;
  is_sculler: boolean;
  is_sweep: boolean;
  can_cox: boolean;
  wingspan_inches: number | null;
  seat_racing_weight_lbs: number | null;
  weight_class: string;
  primary_boats: string[];
  best_2k_seconds: number | null;
  best_2k_date: string | null;
  erg_2k_na: boolean;
  best_5k_seconds: number | null;
  best_5k_date: string | null;
  erg_5k_na: boolean;
  best_6k_seconds: number | null;
  best_6k_date: string | null;
  erg_6k_na: boolean;
  best_2k_split: number | null;
}

export interface RowingPerformanceView {
  id: number;
  event: string;
  event_category: string;
  boat_class: string | null;
  distance_meters: number | null;
  result_seconds: number;
  result_display: string;
  split_seconds: number | null;
  split_display: string | null;
  watts_avg: number | null;
  stroke_rate_avg: number | null;
  heart_rate_avg: number | null;
  event_name: string;
  event_date: string;
  event_location: string | null;
  event_type: string | null;
  seat_position: number | null;
  is_coxswain: boolean;
  crew_members: string[] | null;
  water_conditions: string | null;
  is_personal_record: boolean;
  is_erg_record: boolean;
  is_verified: boolean;
  source: string;
  drag_factor: number | null;
  place: number | null;
  margin_seconds: number | null;
  regatta_central_url: string | null;
  created_at: string;
}

export interface Concept2LogbookEntry {
  id: number;
  event: string;
  event_date: string;
  distance_meters: number | null;
  result_seconds: number;
  result_display: string;
  split_seconds: number | null;
  split_display: string | null;
  watts_avg: number | null;
  stroke_rate_avg: number | null;
  heart_rate_avg: number | null;
  drag_factor: number | null;
  prorata_standard_distance: number | null;
  prorata_seconds: number | null;
  prorata_display: string | null;
  is_best_prorata: boolean;
  is_selected: boolean;
  is_erg_record: boolean;
}

export interface Concept2LogbookResponse {
  entries: Concept2LogbookEntry[];
  config_2k_seconds: number | null;
  config_5k_seconds: number | null;
  config_6k_seconds: number | null;
}

export interface AthleteSportView {
  id: number;
  sport_code: string;
  is_primary: boolean;
  years_experience: number | null;
  current_club: string | null;
  current_coach: string | null;
  recruiting_status: string | null;
  reference_coaches: ReferenceCoachView[];
  config: Record<string, unknown> | null;
  performances: Record<string, unknown>[];
}

// Snake_case section types matching actual API response (for coach view)
export interface CoachViewPersonalInfo {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  height_feet: number | null;
  height_inches: number | null;
  weight_lbs: number | null;
}

export interface CoachViewAddress {
  id: number;
  street_line_1: string | null;
  street_line_2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string;
  is_verified: boolean;
}

export interface CoachViewContactDetails {
  id: number;
  phone_primary: string | null;
  phone_type: string | null;
  phone_type_other: string | null;
  phone_secondary: string | null;
  email_primary: string | null;
  email_secondary: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  social_tiktok: string | null;
}

export interface CoachViewDemographics {
  id: number;
  gender: string | null;
  legal_sex: string | null;
  pronouns: string | null;
  birth_country: string | null;
  citizenship_status: string | null;
  citizenship_country_other: string | null;
  is_military_connected: boolean | null;
  military_status: string | null;
  military_branch: string | null;
  ethnicity: string[] | null;
}

export interface CoachViewAcademics {
  id: number;
  // Education fields
  high_school_name: string | null;
  high_school_city: string | null;
  high_school_state: string | null;
  high_school_country: string;
  high_school_ceeb: string | null;
  graduation_year: number | null;
  gpa_unweighted: number | null;
  gpa_weighted: number | null;
  gpa_scale: number;
  class_rank: number | null;
  class_size: number | null;
  academic_honors: string | null;
  ncaa_core_gpa: number | null;
  ncaa_registered: boolean | null;
  ncaa_id: string | null;
  // Testing fields
  sat_total: number | null;
  sat_reading_writing: number | null;
  sat_math: number | null;
  sat_date: string | null;
  act_composite: number | null;
  act_english: number | null;
  act_math: number | null;
  act_reading: number | null;
  act_science: number | null;
  act_writing: number | null;
  act_date: string | null;
  ap_scores: Record<string, unknown>[] | null;
  is_test_optional: boolean;
  // Document fields
  transcript_url: string | null;
  transcript_uploaded_at: string | null;
  sat_score_url: string | null;
  sat_score_uploaded_at: string | null;
  act_score_url: string | null;
  act_score_uploaded_at: string | null;
  // Academic Index (computed)
  cgs: number | null;
  rai_cgs: number | null;
  rai_sat: number | null;
  rai_act: number | null;
  academic_index: number | null;
  // Document extraction status
  extraction_status: string | null;
  extraction_fields: string[] | null;
  extraction_error: string | null;
  extraction_completed_at: string | null;
}

export interface CoachViewFamilyInfo {
  id: number;
  is_first_gen_college: boolean | null;
  parent1_education: string | null;
  parent2_education: string | null;
  needs_financial_aid: boolean | null;
  estimated_family_contribution: string | null;
  sibling_count: number | null;
  siblings_in_college: number | null;
  legacy_schools: string[] | null;
}

export interface CoachViewWriting {
  id: number;
  personal_statement: string | null;
  personal_statement_word_count: number | null;
  personal_statement_updated_at: string | null;
  essays: Record<string, unknown>[] | null;
  athletic_statement: string | null;
  athletic_statement_word_count: number | null;
}

export interface CoachViewActivity {
  id: number;
  activity_type: string;
  name: string;
  organization: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  hours_per_week: number | null;
  weeks_per_year: number | null;
  position_title: string | null;
  recognition_level: string | null;
  display_order: number;
}

export interface CoachViewParentGuardian {
  id: number;
  first_name: string;
  last_name: string;
  relation: string;
  email: string | null;
  phone: string | null;
  display_order: number;
}

export interface AthleteCoachView {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  profile_completion_pct: number;
  is_verified: boolean;
  // Legacy fields from AthleteBase
  sport: string | null;
  position: string | null;
  school: string | null;
  graduation_year: number | null;
  height_feet: number | null;
  height_inches: number | null;
  weight: number | null;
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // 1:1 sections
  personal_info: CoachViewPersonalInfo | null;
  address: CoachViewAddress | null;
  contact_details: CoachViewContactDetails | null;
  demographics: CoachViewDemographics | null;
  academics: CoachViewAcademics | null;
  family_info: CoachViewFamilyInfo | null;
  writing: CoachViewWriting | null;
  // 1:many
  activities: CoachViewActivity[];
  parent_guardians: CoachViewParentGuardian[];
  // Sports
  sports: AthleteSportView[];
}

// ── Search ──

export interface AthleteSearchHit {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string | null;
  primary_sport: string | null;
  sports: string[];
  position: string | null;
  school: string | null;
  high_school_name: string | null;
  high_school_state: string | null;
  graduation_year: number | null;
  gpa_unweighted: number | null;
  height_inches: number | null;
  weight_lbs: number | null;
  sat_total: number | null;
  act_composite: number | null;
  profile_completion_pct: number;
  _score: number;
  // Sport-specific fields are included dynamically (e.g. rowing_best_2k_seconds)
  [key: string]: unknown;
}

export interface AggBucket {
  key: string;
  count: number;
}

export interface AthleteSearchResponse {
  hits: AthleteSearchHit[];
  total: number;
  aggregations: Record<string, AggBucket[]>;
  max_score: number;
}

// ── Sport Management (athlete self-service) ──

export interface SportInfo {
  code: string;
  name: string;
}

export interface AthleteSportDetail {
  id: number;
  sport_code: string;
  sport_name: string;
  is_primary: boolean;
  years_experience: number | null;
  current_club: string | null;
  current_coach: string | null;
  recruiting_status: string | null;
  created_at: string;
  reference_coaches: ReferenceCoachView[];
  config: Record<string, unknown> | null;
  has_config: boolean;
}

export interface ReferenceCoachInput {
  first_name: string;
  last_name: string;
  organization?: string | null;
  email?: string | null;
  phone?: string | null;
  display_order?: number;
}

// ── Integrations ──

export interface IntegrationProviderInfo {
  code: string;
  name: string;
  auth_method: string;
  description: string;
}

export interface IntegrationConnection {
  id: number;
  provider_code: string;
  status: string;
  external_user_id: string | null;
  external_username: string | null;
  last_sync_at: string | null;
  sync_error_count: number;
  created_at: string;
}

export interface IntegrationSyncLog {
  id: number;
  trigger: string;
  status: string;
  records_fetched: number;
  records_created: number;
  records_updated: number;
  records_skipped: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

// ── Nylas ──

export interface NylasConnection {
  id: number;
  email_address: string;
  provider: string;
  status: string;
  last_message_sync_at: string | null;
  last_event_sync_at: string | null;
  sync_error_count: number;
  created_at: string;
}

export interface NylasSyncLog {
  id: number;
  sync_type: string;
  trigger: string;
  status: string;
  messages_fetched: number;
  messages_created: number;
  messages_skipped: number;
  events_fetched: number;
  events_created: number;
  events_skipped: number;
  athletes_matched: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface MatchedAthleteRef {
  athlete_id: number;
  first_name: string;
  last_name: string;
  match_source: string;
}

export interface CoachEmailRead {
  id: number;
  nylas_message_id: string;
  thread_id: string | null;
  subject: string | null;
  snippet: string | null;
  from_email: string;
  from_name: string | null;
  to_emails: string[];
  cc_emails: string[];
  date: string;
  direction: string;
  folders: string[];
  matched_athletes: MatchedAthleteRef[];
}

export interface CoachCalendarEventRead {
  id: number;
  title: string | null;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  participants: Record<string, unknown>[];
  event_status: string | null;
  matched_athletes: MatchedAthleteRef[];
}

export interface AthleteCommunications {
  athlete_id: number;
  emails: CoachEmailRead[];
  events: CoachCalendarEventRead[];
}
