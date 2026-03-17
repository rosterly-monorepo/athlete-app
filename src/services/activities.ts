import { apiClient } from "./api-client";

export interface ActivityEntry {
  id: number;
  activity_type: string;
  name: string;
  organization: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  hours_per_week: number | null;
  weeks_per_year: number | null;
  position_title: string | null;
  recognition_level: string | null;
  display_order: number;
}

export interface ActivityCreateInput {
  activity_type: string;
  name: string;
  organization?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  hours_per_week?: number | null;
  weeks_per_year?: number | null;
  position_title?: string | null;
  recognition_level?: string | null;
}

export interface ActivityUpdateInput {
  activity_type?: string;
  name?: string;
  organization?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  hours_per_week?: number | null;
  weeks_per_year?: number | null;
  position_title?: string | null;
  recognition_level?: string | null;
  display_order?: number;
}

export async function listActivities(token: string): Promise<ActivityEntry[]> {
  return apiClient<ActivityEntry[]>("/api/v1/athletes/me/activities", token);
}

export async function createActivity(
  token: string,
  data: ActivityCreateInput
): Promise<ActivityEntry> {
  return apiClient<ActivityEntry>("/api/v1/athletes/me/activities", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateActivity(
  token: string,
  activityId: number,
  data: ActivityUpdateInput
): Promise<ActivityEntry> {
  return apiClient<ActivityEntry>(`/api/v1/athletes/me/activities/${activityId}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteActivity(token: string, activityId: number): Promise<void> {
  return apiClient<void>(`/api/v1/athletes/me/activities/${activityId}`, token, {
    method: "DELETE",
  });
}
