/**
 * API client functions for sport management endpoints.
 */

import { apiClient } from "./api-client";
import type {
  SportInfo,
  AthleteSportDetail,
  RowingPerformanceView,
  ReferenceCoachView,
  ReferenceCoachInput,
  Concept2LogbookResponse,
} from "./types";
import type { FormSchema } from "@/types/form-schema";

// ── Available Sports ──

export async function getAvailableSports(token: string): Promise<{ sports: SportInfo[] }> {
  return apiClient<{ sports: SportInfo[] }>("/api/v1/athletes/me/sports/available", token);
}

// ── My Sports CRUD ──

export async function getMySports(token: string): Promise<AthleteSportDetail[]> {
  return apiClient<AthleteSportDetail[]>("/api/v1/athletes/me/sports", token);
}

export async function addSport(
  token: string,
  data: { sport_code: string; is_primary?: boolean }
): Promise<AthleteSportDetail> {
  return apiClient<AthleteSportDetail>("/api/v1/athletes/me/sports", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSport(
  token: string,
  sportId: number,
  data: Record<string, unknown>
): Promise<AthleteSportDetail> {
  return apiClient<AthleteSportDetail>(`/api/v1/athletes/me/sports/${sportId}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function removeSport(token: string, sportId: number): Promise<void> {
  return apiClient<void>(`/api/v1/athletes/me/sports/${sportId}`, token, {
    method: "DELETE",
  });
}

// ── Sport Config ──

export async function getSportConfigSchema(
  token: string,
  sportCode: string
): Promise<{ sport: string; type: string; schema: FormSchema }> {
  return apiClient(`/api/v1/forms/sports/${sportCode}/config`, token);
}

export async function getSportConfig(
  token: string,
  sportCode: string
): Promise<Record<string, unknown>> {
  return apiClient(`/api/v1/sports/${sportCode}/me/config`, token);
}

export async function updateSportConfig(
  token: string,
  sportCode: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return apiClient(`/api/v1/sports/${sportCode}/me/config`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ── Performances ──

export async function getPerformanceSchema(
  token: string,
  sportCode: string
): Promise<{ sport: string; type: string; schema: FormSchema }> {
  return apiClient(`/api/v1/forms/sports/${sportCode}/performance`, token);
}

export async function getPerformances(
  token: string,
  sportId: number
): Promise<RowingPerformanceView[]> {
  return apiClient<RowingPerformanceView[]>(
    `/api/v1/athletes/me/sports/${sportId}/performances`,
    token
  );
}

export async function createPerformance(
  token: string,
  sportId: number,
  data: Record<string, unknown>
): Promise<RowingPerformanceView> {
  return apiClient<RowingPerformanceView>(
    `/api/v1/athletes/me/sports/${sportId}/performances`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function updatePerformance(
  token: string,
  sportId: number,
  perfId: number,
  data: Record<string, unknown>
): Promise<RowingPerformanceView> {
  return apiClient<RowingPerformanceView>(
    `/api/v1/athletes/me/sports/${sportId}/performances/${perfId}`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function deletePerformance(
  token: string,
  sportId: number,
  perfId: number
): Promise<void> {
  return apiClient<void>(`/api/v1/athletes/me/sports/${sportId}/performances/${perfId}`, token, {
    method: "DELETE",
  });
}

// ── Concept2 Logbook ──

export async function getConcept2Logbook(token: string): Promise<Concept2LogbookResponse> {
  return apiClient<Concept2LogbookResponse>("/api/v1/sports/rowing/me/concept2-logbook", token);
}

// ── Reference Coaches ──

export async function getReferenceCoaches(
  token: string,
  sportId: number
): Promise<ReferenceCoachView[]> {
  return apiClient<ReferenceCoachView[]>(
    `/api/v1/athletes/me/sports/${sportId}/reference-coaches`,
    token
  );
}

export async function addReferenceCoach(
  token: string,
  sportId: number,
  data: ReferenceCoachInput
): Promise<ReferenceCoachView> {
  return apiClient<ReferenceCoachView>(
    `/api/v1/athletes/me/sports/${sportId}/reference-coaches`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function updateReferenceCoach(
  token: string,
  sportId: number,
  coachId: number,
  data: Partial<ReferenceCoachInput>
): Promise<ReferenceCoachView> {
  return apiClient<ReferenceCoachView>(
    `/api/v1/athletes/me/sports/${sportId}/reference-coaches/${coachId}`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function deleteReferenceCoach(
  token: string,
  sportId: number,
  coachId: number
): Promise<void> {
  return apiClient<void>(
    `/api/v1/athletes/me/sports/${sportId}/reference-coaches/${coachId}`,
    token,
    { method: "DELETE" }
  );
}
