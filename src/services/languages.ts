import { apiClient } from "./api-client";

export interface LanguageEntry {
  id: number;
  language: string;
  proficiency: string;
}

export interface LanguageCreateInput {
  language: string;
  proficiency: string;
}

export interface LanguageUpdateInput {
  language?: string;
  proficiency?: string;
}

export async function listLanguages(token: string): Promise<LanguageEntry[]> {
  return apiClient<LanguageEntry[]>("/api/v1/athletes/me/languages", token);
}

export async function createLanguage(
  token: string,
  data: LanguageCreateInput
): Promise<LanguageEntry> {
  return apiClient<LanguageEntry>("/api/v1/athletes/me/languages", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLanguage(
  token: string,
  langId: number,
  data: LanguageUpdateInput
): Promise<LanguageEntry> {
  return apiClient<LanguageEntry>(`/api/v1/athletes/me/languages/${langId}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteLanguage(token: string, langId: number): Promise<void> {
  return apiClient<void>(`/api/v1/athletes/me/languages/${langId}`, token, {
    method: "DELETE",
  });
}
