"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFormSections,
  getFormSchema,
  getAllFormSchemas,
  saveProfileSection,
} from "@/services/forms";
import { toast } from "sonner";
import type { FormSchema } from "@/types/form-schema";
import { athleteKeys } from "./use-athlete";

// ── Query Keys ──

export const formSchemaKeys = {
  all: ["form-schemas"] as const,
  sections: () => [...formSchemaKeys.all, "sections"] as const,
  section: (id: string) => [...formSchemaKeys.all, "section", id] as const,
  allSchemas: () => [...formSchemaKeys.all, "all"] as const,
};

// ── Read Hooks ──

/**
 * Fetch list of available form sections.
 */
export function useFormSections() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: formSchemaKeys.sections(),
    queryFn: async () => {
      const token = await getToken();
      return getFormSections(token!);
    },
    staleTime: 5 * 60 * 1000, // Schemas rarely change, cache for 5 minutes
  });
}

/**
 * Fetch the JSON Schema for a specific section.
 */
export function useFormSchema(section: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: formSchemaKeys.section(section),
    queryFn: async () => {
      const token = await getToken();
      const response = await getFormSchema(token!, section);
      return response.schema;
    },
    enabled: !!section,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Batch fetch all form schemas at once.
 * Use this for caching all schemas on app load.
 */
export function useAllFormSchemas() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: formSchemaKeys.allSchemas(),
    queryFn: async () => {
      const token = await getToken();
      const response = await getAllFormSchemas(token!);
      return response.schemas;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Write Hooks ──

interface UseSaveProfileSectionOptions {
  /** Custom success message */
  successMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Callback on success */
  onSuccess?: () => void;
}

/**
 * Save data for a specific profile section.
 * Invalidates profile cache on success.
 */
export function useSaveProfileSection<T extends Record<string, unknown>>(
  section: string,
  options: UseSaveProfileSectionOptions = {}
) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { successMessage = "Section saved", errorMessage = "Failed to save", onSuccess } = options;

  return useMutation({
    mutationFn: async (data: T) => {
      const token = await getToken();
      return saveProfileSection<T>(token!, section, data);
    },
    onSuccess: () => {
      // Invalidate profile cache so updated data is fetched
      queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });
      toast.success(successMessage, {
        description: `Your ${section.replace(/_/g, " ")} information has been updated.`,
      });
      onSuccess?.();
    },
    onError: () => {
      toast.error(errorMessage, {
        description: "Something went wrong. Please try again.",
      });
    },
  });
}

/**
 * Hook to get a specific schema from the cached all-schemas response.
 * Useful when you've already loaded all schemas.
 */
export function useCachedSchema(section: string): FormSchema | undefined {
  const { data: schemas } = useAllFormSchemas();
  return schemas?.[section];
}
