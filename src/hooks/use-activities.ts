"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "@/services/activities";
import type { ActivityCreateInput, ActivityUpdateInput } from "@/services/activities";
import { ApiClientError } from "@/services/api-client";
import { toast } from "sonner";
import { athleteKeys } from "./use-athlete";

export const activityKeys = {
  all: ["activities"] as const,
  list: () => [...activityKeys.all, "list"] as const,
};

export function useActivities() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: activityKeys.list(),
    queryFn: async () => {
      const token = await getToken();
      return listActivities(token!);
    },
  });
}

export function useCreateActivity() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ActivityCreateInput) => {
      const token = await getToken();
      return createActivity(token!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });
      toast.success("Activity added");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to add activity", { description: message });
    },
  });
}

export function useUpdateActivity() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ActivityUpdateInput }) => {
      const token = await getToken();
      return updateActivity(token!, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });
      toast.success("Activity updated");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to update activity", { description: message });
    },
  });
}

export function useDeleteActivity() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: number) => {
      const token = await getToken();
      return deleteActivity(token!, activityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });
      toast.success("Activity removed");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to remove activity", { description: message });
    },
  });
}
