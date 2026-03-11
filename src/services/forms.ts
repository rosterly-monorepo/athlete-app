/**
 * API client functions for form schema endpoints.
 * Fetches JSON Schema definitions for dynamic form generation.
 */

import { apiClient } from "./api-client";
import type {
  FormSectionsResponse,
  FormSectionResponse,
  AllFormSchemasResponse,
} from "@/types/form-schema";

/**
 * List all available form sections.
 * GET /api/v1/forms/sections
 */
export async function getFormSections(token: string): Promise<FormSectionsResponse> {
  return apiClient<FormSectionsResponse>("/api/v1/forms/sections", token);
}

/**
 * Get the JSON Schema for a specific section.
 * GET /api/v1/forms/sections/{section}
 */
export async function getFormSchema(token: string, section: string): Promise<FormSectionResponse> {
  return apiClient<FormSectionResponse>(`/api/v1/forms/sections/${section}`, token);
}

/**
 * Batch fetch all form schemas at once.
 * GET /api/v1/forms/sections/all
 */
export async function getAllFormSchemas(token: string): Promise<AllFormSchemasResponse> {
  return apiClient<AllFormSchemasResponse>("/api/v1/forms/sections/all", token);
}

/**
 * Save data for a specific profile section.
 * PATCH /api/v1/athletes/me/profile/{section}
 */
export async function saveProfileSection<T extends Record<string, unknown>>(
  token: string,
  section: string,
  data: T
): Promise<T> {
  return apiClient<T>(`/api/v1/athletes/me/profile/${section}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
