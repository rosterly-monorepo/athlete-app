import { apiClient } from "./api-client";
import type {
  Athlete,
  AthleteProfile,
  UpdateProfileInput,
  PaginatedResponse,
} from "./types";

// ── Public (no token needed) ──

export async function getAthleteById(id: string): Promise<Athlete> {
  return apiClient<Athlete>(`/api/v1/athletes/${id}`, null);
}

export async function getAthletes(params?: {
  sport?: string;
  school?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Athlete>> {
  const searchParams = new URLSearchParams();
  if (params?.sport) searchParams.set("sport", params.sport);
  if (params?.school) searchParams.set("school", params.school);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

  const qs = searchParams.toString();
  return apiClient(`/api/v1/athletes${qs ? `?${qs}` : ""}`, null);
}

// ── Authenticated (token required) ──

export async function getMyProfile(token: string): Promise<AthleteProfile> {
  return apiClient<AthleteProfile>("/api/v1/athletes/me/profile", token);
}

export async function updateProfile(
  token: string,
  data: UpdateProfileInput
): Promise<AthleteProfile> {
  return apiClient<AthleteProfile>("/api/v1/athletes/me/profile", token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
