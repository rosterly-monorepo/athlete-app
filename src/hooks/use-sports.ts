"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@/services/api-client";
import { toast } from "sonner";
import {
  getAvailableSports,
  getMySports,
  addSport,
  updateSport,
  removeSport,
  getSportConfigSchema,
  getSportConfig,
  updateSportConfig,
  getPerformanceSchema,
  getPerformances,
  createPerformance,
  updatePerformance,
  deletePerformance,
  getConcept2Logbook,
  getReferenceCoaches,
  addReferenceCoach,
  updateReferenceCoach,
  deleteReferenceCoach,
} from "@/services/sports";
import type { ReferenceCoachInput } from "@/services/types";

// ── Query Keys ──

export const sportsKeys = {
  all: ["sports"] as const,
  available: () => [...sportsKeys.all, "available"] as const,
  mine: () => [...sportsKeys.all, "mine"] as const,
  configSchema: (sportCode: string) => [...sportsKeys.all, "config-schema", sportCode] as const,
  config: (sportCode: string) => [...sportsKeys.all, "config", sportCode] as const,
  performances: (sportId: number) => [...sportsKeys.all, "performances", sportId] as const,
  performanceSchema: (sportCode: string) =>
    [...sportsKeys.all, "performance-schema", sportCode] as const,
  referenceCoaches: (sportId: number) => [...sportsKeys.all, "reference-coaches", sportId] as const,
  concept2Logbook: () => [...sportsKeys.all, "concept2-logbook"] as const,
};

// ── Available Sports ──

export function useAvailableSports() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sportsKeys.available(),
    queryFn: async () => {
      const token = await getToken();
      const res = await getAvailableSports(token!);
      return res.sports;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ── My Sports ──

export function useMySports() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sportsKeys.mine(),
    queryFn: async () => {
      const token = await getToken();
      return getMySports(token!);
    },
  });
}

export function useAddSport() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sport_code: string; is_primary?: boolean }) => {
      const token = await getToken();
      return addSport(token!, data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success(`${result.sport_name} added`);
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to add sport", { description: message });
    },
  });
}

export function useUpdateSport() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sportId, data }: { sportId: number; data: Record<string, unknown> }) => {
      const token = await getToken();
      return updateSport(token!, sportId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success("Sport updated");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to update sport", { description: message });
    },
  });
}

export function useRemoveSport() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sportId: number) => {
      const token = await getToken();
      return removeSport(token!, sportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success("Sport removed");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to remove sport", { description: message });
    },
  });
}

// ── Sport Config ──

export function useSportConfigSchema(sportCode: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sportsKeys.configSchema(sportCode),
    queryFn: async () => {
      const token = await getToken();
      const res = await getSportConfigSchema(token!, sportCode);
      return res.schema;
    },
    enabled: !!sportCode,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSportConfig(sportCode: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sportsKeys.config(sportCode),
    queryFn: async () => {
      const token = await getToken();
      return getSportConfig(token!, sportCode);
    },
    enabled: !!sportCode,
    staleTime: 30 * 1000,
  });
}

export function useSaveSportConfig(sportCode: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const token = await getToken();
      return updateSportConfig(token!, sportCode, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsKeys.config(sportCode) });
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success("Sport profile saved");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to save sport profile", { description: message });
    },
  });
}

// ── Performances ──

export function usePerformanceSchema(sportCode: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sportsKeys.performanceSchema(sportCode),
    queryFn: async () => {
      const token = await getToken();
      const res = await getPerformanceSchema(token!, sportCode);
      return res.schema;
    },
    enabled: !!sportCode,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePerformances(sportId: number) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sportsKeys.performances(sportId),
    queryFn: async () => {
      const token = await getToken();
      return getPerformances(token!, sportId);
    },
    enabled: !!sportId,
  });
}

export function useCreatePerformance(sportId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const token = await getToken();
      return createPerformance(token!, sportId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsKeys.performances(sportId) });
      queryClient.invalidateQueries({ queryKey: sportsKeys.concept2Logbook() });
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success("Performance added");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to add performance", { description: message });
    },
  });
}

export function useUpdatePerformance(sportId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ perfId, data }: { perfId: number; data: Record<string, unknown> }) => {
      const token = await getToken();
      return updatePerformance(token!, sportId, perfId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsKeys.performances(sportId) });
      queryClient.invalidateQueries({ queryKey: sportsKeys.concept2Logbook() });
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success("Performance updated");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to update performance", { description: message });
    },
  });
}

export function useDeletePerformance(sportId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (perfId: number) => {
      const token = await getToken();
      return deletePerformance(token!, sportId, perfId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sportsKeys.performances(sportId) });
      queryClient.invalidateQueries({ queryKey: sportsKeys.concept2Logbook() });
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success("Performance removed");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to remove performance", { description: message });
    },
  });
}

// ── Concept2 Logbook ──

export function useConcept2Logbook() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sportsKeys.concept2Logbook(),
    queryFn: async () => {
      const token = await getToken();
      return getConcept2Logbook(token!);
    },
  });
}

// ── Reference Coaches ──

export function useReferenceCoaches(sportId: number) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: sportsKeys.referenceCoaches(sportId),
    queryFn: async () => {
      const token = await getToken();
      return getReferenceCoaches(token!, sportId);
    },
    enabled: !!sportId,
  });
}

export function useAddReferenceCoach(sportId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReferenceCoachInput) => {
      const token = await getToken();
      return addReferenceCoach(token!, sportId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sportsKeys.referenceCoaches(sportId),
      });
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success("Reference coach added");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to add reference coach", { description: message });
    },
  });
}

export function useUpdateReferenceCoach(sportId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coachId,
      data,
    }: {
      coachId: number;
      data: Partial<ReferenceCoachInput>;
    }) => {
      const token = await getToken();
      return updateReferenceCoach(token!, sportId, coachId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sportsKeys.referenceCoaches(sportId),
      });
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success("Reference coach updated");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to update reference coach", { description: message });
    },
  });
}

export function useDeleteReferenceCoach(sportId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coachId: number) => {
      const token = await getToken();
      return deleteReferenceCoach(token!, sportId, coachId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sportsKeys.referenceCoaches(sportId),
      });
      queryClient.invalidateQueries({ queryKey: sportsKeys.mine() });
      toast.success("Reference coach removed");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to remove reference coach", { description: message });
    },
  });
}
