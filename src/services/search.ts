import { apiClient } from "./api-client";
import type { SearchFiltersResponse, AthleteSearchRequest, AthleteSearchResponse } from "./types";

export async function getSearchFilters(token: string): Promise<SearchFiltersResponse> {
  return apiClient<SearchFiltersResponse>("/api/v1/search/filters", token);
}

export async function searchAthletes(
  token: string,
  params: AthleteSearchRequest
): Promise<AthleteSearchResponse> {
  return apiClient<AthleteSearchResponse>("/api/v1/search/athletes/advanced", token, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
