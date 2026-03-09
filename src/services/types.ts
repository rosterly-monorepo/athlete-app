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
