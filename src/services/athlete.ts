import { apiClient } from "./api-client";
import type { AthleteCoachView, AthleteProfile, UpdateProfileInput } from "./types";

// ── Athlete self-profile ──

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

// ── Coach athlete view ──

export async function getAthleteCoachView(
  token: string,
  athleteId: number
): Promise<AthleteCoachView> {
  return apiClient<AthleteCoachView>(`/api/v1/athletes/${athleteId}/coach-view`, token);
}
