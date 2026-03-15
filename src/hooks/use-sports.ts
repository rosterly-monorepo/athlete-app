"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  referenceCoaches: (sportId: number) => [...sportsKeys.all, "reference-coaches", sportId] as const,
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
    onError: () => {
      toast.error("Failed to add sport");
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
    onError: () => {
      toast.error("Failed to update sport");
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
    onError: () => {
      toast.error("Failed to remove sport");
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
    onError: () => {
      toast.error("Failed to save sport profile");
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
    onError: () => {
      toast.error("Failed to add reference coach");
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
    onError: () => {
      toast.error("Failed to update reference coach");
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
    onError: () => {
      toast.error("Failed to remove reference coach");
    },
  });
}
