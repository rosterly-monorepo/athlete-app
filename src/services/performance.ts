import { apiClient } from "./api-client";
import type { CompetitionResult, AddResultInput } from "./types";

export async function getMyResults(token: string): Promise<CompetitionResult[]> {
  return apiClient<CompetitionResult[]>("/api/v1/performance", token);
}

export async function addResult(token: string, data: AddResultInput): Promise<CompetitionResult> {
  return apiClient<CompetitionResult>("/api/v1/performance", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteResult(token: string, id: string): Promise<void> {
  return apiClient(`/api/v1/performance/${id}`, token, { method: "DELETE" });
}
