"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateProfile, getAthleteCoachView } from "@/services/athlete";
import type { UpdateProfileInput } from "@/services/types";
import { toast } from "sonner";

export const athleteKeys = {
  all: ["athletes"] as const,
  myProfile: ["my-profile"] as const,
  coachView: (id: number) => ["athletes", "coach-view", id] as const,
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

export function useAthleteCoachView(id: number) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: athleteKeys.coachView(id),
    queryFn: async () => {
      const token = await getToken();
      return getAthleteCoachView(token!, id);
    },
    enabled: !!id,
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
