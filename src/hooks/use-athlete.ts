"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateProfile, getAthleteById, getAthletes } from "@/services/athlete";
import type { UpdateProfileInput } from "@/services/types";
import { toast } from "sonner";

export const athleteKeys = {
  all: ["athletes"] as const,
  list: (filters?: Record<string, string | number | undefined>) =>
    ["athletes", "list", filters] as const,
  byId: (id: string) => ["athletes", id] as const,
  myProfile: ["my-profile"] as const,
};

// ── Read hooks ──

export function useMyProfile() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: athleteKeys.myProfile,
    queryFn: async () => {
      const token = await getToken();
      return getMyProfile(token!);
    },
  });
}

export function useAthlete(id: string) {
  return useQuery({
    queryKey: athleteKeys.byId(id),
    queryFn: () => getAthleteById(id), // public endpoint, no token
    enabled: !!id,
  });
}

export function useAthletes(filters?: { sport?: string; school?: string; page?: number }) {
  return useQuery({
    queryKey: athleteKeys.list(filters),
    queryFn: () => getAthletes(filters), // public endpoint, no token
  });
}

// ── Write hooks ──

export function useUpdateProfile() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const token = await getToken();
      return updateProfile(token!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });
      toast.success("Profile saved", { description: "Your athlete profile has been updated." });
    },
    onError: () => {
      toast.error("Failed to save profile", {
        description: "Something went wrong. Please try again.",
      });
    },
  });
}
