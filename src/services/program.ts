import { apiClient } from "./api-client";
import type { OrganizationProgram } from "./types";

/**
 * Get all programs for the current organization.
 */
export async function getMyPrograms(token: string): Promise<OrganizationProgram[]> {
  return apiClient<OrganizationProgram[]>("/api/v1/organizations/me/programs", token);
}
