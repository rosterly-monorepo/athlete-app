import { apiClient } from "./api-client";
import type { AthleteCommunications, NylasConnection, NylasSyncLog } from "./types";

// ── OAuth ──

export async function getAuthUrl(token: string): Promise<{ auth_url: string }> {
  return apiClient<{ auth_url: string }>("/api/v1/nylas/auth-url", token);
}

export async function exchangeCode(
  token: string,
  code: string,
  state: string
): Promise<NylasConnection> {
  const params = new URLSearchParams({ code, state });
  return apiClient<NylasConnection>(`/api/v1/nylas/callback?${params.toString()}`, token, {
    method: "POST",
  });
}

export async function reportOAuthError(
  token: string,
  report: {
    error: string;
    error_description?: string | null;
    error_uri?: string | null;
    had_code?: boolean;
    had_state?: boolean;
  }
): Promise<void> {
  return apiClient<void>("/api/v1/nylas/oauth-error", token, {
    method: "POST",
    body: JSON.stringify(report),
  });
}

// ── Connections ──

export async function getConnections(token: string): Promise<NylasConnection[]> {
  return apiClient<NylasConnection[]>("/api/v1/nylas/connections", token);
}

export async function triggerSync(token: string, connectionId: number): Promise<NylasSyncLog> {
  return apiClient<NylasSyncLog>(`/api/v1/nylas/connections/${connectionId}/sync`, token, {
    method: "POST",
  });
}

export async function disconnect(token: string, connectionId: number): Promise<void> {
  return apiClient<void>(`/api/v1/nylas/connections/${connectionId}`, token, {
    method: "DELETE",
  });
}

// ── Sync Logs ──

export async function getSyncLogs(token: string, connectionId: number): Promise<NylasSyncLog[]> {
  return apiClient<NylasSyncLog[]>(`/api/v1/nylas/connections/${connectionId}/sync-logs`, token);
}

// ── Communications ──

export async function getAthleteCommunications(
  token: string,
  athleteId: number
): Promise<AthleteCommunications> {
  return apiClient<AthleteCommunications>(
    `/api/v1/nylas/athletes/${athleteId}/communications`,
    token
  );
}

export async function getEmailBody(token: string, emailId: number): Promise<{ body: string }> {
  return apiClient<{ body: string }>(`/api/v1/nylas/emails/${emailId}/body`, token);
}
