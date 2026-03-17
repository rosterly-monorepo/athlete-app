"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiClientError } from "@/services/api-client";
import {
  disconnectIntegration,
  exchangeCode,
  getAuthUrl,
  getIntegrationsForSport,
  getMyConnections,
  triggerSync,
} from "@/services/integrations";
import { sportsKeys } from "@/hooks/use-sports";

// ── Query Keys ──

export const integrationKeys = {
  all: ["integrations"] as const,
  forSport: (sportCode: string) => [...integrationKeys.all, "for-sport", sportCode] as const,
  myConnections: () => [...integrationKeys.all, "connections"] as const,
  connection: (providerCode: string) =>
    [...integrationKeys.all, "connections", providerCode] as const,
};

// ── Queries ──

export function useIntegrationsForSport(sportCode: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: integrationKeys.forSport(sportCode),
    queryFn: async () => {
      const token = await getToken();
      return getIntegrationsForSport(token!, sportCode);
    },
    enabled: !!sportCode,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMyConnections() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: integrationKeys.myConnections(),
    queryFn: async () => {
      const token = await getToken();
      return getMyConnections(token!);
    },
  });
}

// ── Mutations ──

export function useConnectIntegration() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (providerCode: string) => {
      const token = await getToken();
      const { auth_url } = await getAuthUrl(token!, providerCode);
      return auth_url;
    },
    onSuccess: (authUrl) => {
      window.location.href = authUrl;
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to connect", { description: message });
    },
  });
}

export function useExchangeCode(providerCode: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const token = await getToken();
      return exchangeCode(token!, providerCode, code, state);
    },
    onSuccess: (connection) => {
      queryClient.invalidateQueries({
        queryKey: integrationKeys.myConnections(),
      });
      toast.success(`Connected to ${connection.external_username || providerCode}`);
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.userMessage : "Failed to complete connection.";
      toast.error("Connection failed", { description: message });
    },
  });
}

export function useTriggerSync(providerCode: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return triggerSync(token!, providerCode);
    },
    onSuccess: (log) => {
      queryClient.invalidateQueries({
        queryKey: integrationKeys.myConnections(),
      });
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });

      if (log.status === "success") {
        const parts = [];
        if (log.records_created > 0) parts.push(`${log.records_created} new`);
        if (log.records_skipped > 0) parts.push(`${log.records_skipped} already imported`);
        const desc = parts.length > 0 ? parts.join(", ") : "No new records";
        toast.success("Sync complete", { description: desc });
      } else {
        toast.error("Sync had issues", {
          description: log.error_message || "Check your connection status.",
        });
      }
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Sync failed", { description: message });
    },
  });
}

export function useDisconnect(providerCode: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return disconnectIntegration(token!, providerCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: integrationKeys.myConnections(),
      });
      toast.success("Disconnected");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to disconnect", { description: message });
    },
  });
}
