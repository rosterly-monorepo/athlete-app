"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyPrograms } from "@/services/program";
import { getAvailableMetrics, updateProgram } from "@/services/organization";
import type { CreateProgramInput } from "@/services/organization";

export const programKeys = {
  all: ["programs"] as const,
  myPrograms: ["programs", "mine"] as const,
};

/**
 * Fetch all programs for the current organization.
 */
export function useMyPrograms() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: programKeys.myPrograms,
    queryFn: async () => {
      const token = await getToken();
      return getMyPrograms(token!);
    },
  });
}

/**
 * Fetch available performance metrics for a program.
 */
export function useAvailableMetrics(programId: number | null) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [...programKeys.myPrograms, programId, "metrics"],
    queryFn: async () => {
      const token = await getToken();
      return getAvailableMetrics(token!, programId!);
    },
    enabled: !!programId,
  });
}

/**
 * Update a program (head coach only).
 */
export function useUpdateProgram() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      programId,
      data,
    }: {
      programId: number;
      data: Partial<CreateProgramInput>;
    }) => {
      const token = await getToken();
      return updateProgram(token!, programId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.myPrograms });
    },
  });
}
