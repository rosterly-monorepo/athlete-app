import { apiClient } from "./api-client";
import type { OrganizationProgram } from "./types";

export interface OrganizationProfile {
  id: number;
  name: string;
  slug: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  website_url: string | null;
  clerk_org_id: string;
  subscription_tier: string;
  subscription_status: string;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getMyOrganization(token: string): Promise<OrganizationProfile> {
  return apiClient<OrganizationProfile>("/api/v1/organizations/me/org", token);
}

export async function completeOnboarding(token: string): Promise<OrganizationProfile> {
  return apiClient<OrganizationProfile>("/api/v1/organizations/me/org/complete-onboarding", token, {
    method: "POST",
  });
}

export interface CreateProgramInput {
  sport_code: string;
  division?: string;
  conference?: string;
  region?: string;
  program_website?: string;
  recruiting_email?: string;
  minimum_gpa?: number;
  minimum_sat?: number;
  minimum_act?: number;
  minimum_height_inches?: number;
  graduation_years_of_interest?: number[];
  geographic_preferences?: string[];
  citizenship_requirements?: string;
  roster_spots?: number;
}

export async function createProgram(
  token: string,
  data: CreateProgramInput
): Promise<OrganizationProgram> {
  return apiClient("/api/v1/organizations/me/programs", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProgram(
  token: string,
  programId: number,
  data: Partial<CreateProgramInput>
): Promise<OrganizationProgram> {
  return apiClient(`/api/v1/organizations/me/programs/${programId}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
