"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getMyPrograms } from "@/services/program";

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
