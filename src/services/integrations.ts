import { apiClient } from "./api-client";
import type { IntegrationConnection, IntegrationProviderInfo, IntegrationSyncLog } from "./types";

// ── Provider Discovery ──

export async function getIntegrationsForSport(
  token: string,
  sportCode: string
): Promise<IntegrationProviderInfo[]> {
  return apiClient<IntegrationProviderInfo[]>(`/api/v1/integrations/available/${sportCode}`, token);
}

// ── Connection Management ──

export async function getMyConnections(token: string): Promise<IntegrationConnection[]> {
  return apiClient<IntegrationConnection[]>("/api/v1/integrations/me", token);
}

export async function getConnection(
  token: string,
  providerCode: string
): Promise<IntegrationConnection> {
  return apiClient<IntegrationConnection>(`/api/v1/integrations/me/${providerCode}`, token);
}

export async function triggerSync(
  token: string,
  providerCode: string
): Promise<IntegrationSyncLog> {
  return apiClient<IntegrationSyncLog>(`/api/v1/integrations/me/${providerCode}/sync`, token, {
    method: "POST",
  });
}

export async function disconnectIntegration(token: string, providerCode: string): Promise<void> {
  return apiClient<void>(`/api/v1/integrations/me/${providerCode}`, token, {
    method: "DELETE",
  });
}

// ── OAuth ──

export async function getAuthUrl(
  token: string,
  providerCode: string
): Promise<{ auth_url: string }> {
  return apiClient<{ auth_url: string }>(`/api/v1/integrations/${providerCode}/auth-url`, token);
}

export async function exchangeCode(
  token: string,
  providerCode: string,
  code: string,
  state: string
): Promise<IntegrationConnection> {
  const params = new URLSearchParams({ code, state });
  return apiClient<IntegrationConnection>(
    `/api/v1/integrations/${providerCode}/callback?${params.toString()}`,
    token,
    { method: "POST" }
  );
}
