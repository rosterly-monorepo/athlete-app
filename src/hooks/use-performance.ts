"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyResults, addResult, deleteResult } from "@/services/performance";
import type { AddResultInput } from "@/services/types";
import { toast } from "sonner";

export const performanceKeys = {
  myResults: ["my-results"] as const,
};

export function useMyResults() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: performanceKeys.myResults,
    queryFn: async () => {
      const token = await getToken();
      return getMyResults(token!);
    },
  });
}

export function useAddResult() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddResultInput) => {
      const token = await getToken();
      return addResult(token!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.myResults });
      toast.success("Result added", { description: "Your competition result has been saved." });
    },
    onError: () => {
      toast.error("Failed to add result", { description: "Something went wrong. Please try again." });
    },
  });
}

export function useDeleteResult() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteResult(token!, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.myResults });
      toast.success("Result deleted");
    },
    onError: () => {
      toast.error("Failed to delete result", { description: "Something went wrong. Please try again." });
    },
  });
}
