"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiClientError } from "@/services/api-client";
import {
  disconnect,
  exchangeCode,
  getAthleteCommunications,
  getAuthUrl,
  getConnections,
  getEmailBody,
  reportOAuthError,
  triggerSync,
} from "@/services/nylas";

// ── Query Keys ──

export const nylasKeys = {
  all: ["nylas"] as const,
  connections: () => [...nylasKeys.all, "connections"] as const,
  syncLogs: (connectionId: number) => [...nylasKeys.all, "sync-logs", connectionId] as const,
  communications: (athleteId: number) => [...nylasKeys.all, "communications", athleteId] as const,
  emailBody: (emailId: number) => [...nylasKeys.all, "email-body", emailId] as const,
};

// ── Queries ──

export function useNylasConnections() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: nylasKeys.connections(),
    queryFn: async () => {
      const token = await getToken();
      return getConnections(token!);
    },
  });
}

export function useAthleteCommunications(athleteId: number) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: nylasKeys.communications(athleteId),
    queryFn: async () => {
      const token = await getToken();
      return getAthleteCommunications(token!, athleteId);
    },
    enabled: athleteId > 0,
  });
}

export function useEmailBody(emailId: number) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: nylasKeys.emailBody(emailId),
    queryFn: async () => {
      const token = await getToken();
      return getEmailBody(token!, emailId);
    },
    enabled: emailId > 0,
    staleTime: Infinity,
  });
}

// ── Mutations ──

export function useConnectNylas() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const { auth_url } = await getAuthUrl(token!);
      return auth_url;
    },
    onSuccess: (authUrl) => {
      window.location.href = authUrl;
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to connect email", { description: message });
    },
  });
}

export function useReportNylasOAuthError() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (report: {
      error: string;
      error_description?: string | null;
      error_uri?: string | null;
      had_code?: boolean;
      had_state?: boolean;
    }) => {
      const token = await getToken();
      return reportOAuthError(token!, report);
    },
    // Fire-and-forget — purely for backend observability
  });
}

export function useExchangeNylasCode() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const token = await getToken();
      return exchangeCode(token!, code, state);
    },
    onSuccess: (connection) => {
      queryClient.invalidateQueries({ queryKey: nylasKeys.connections() });
      toast.success(`Connected ${connection.email_address}`, {
        description: "Initial sync is running in the background (last 365 days).",
      });
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.userMessage : "Failed to complete connection.";
      toast.error("Connection failed", { description: message });
    },
  });
}

export function useTriggerNylasSync(connectionId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return triggerSync(token!, connectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nylasKeys.connections() });
      toast.success("Sync queued", {
        description: "Syncing emails and calendar events in the background.",
      });
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Sync failed", { description: message });
    },
  });
}

export function useDisconnectNylas(connectionId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return disconnect(token!, connectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nylasKeys.connections() });
      toast.success("Email disconnected", {
        description: "All synced emails and events have been removed.",
      });
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to disconnect", { description: message });
    },
  });
}
