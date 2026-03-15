"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "@/services/languages";
import type { LanguageCreateInput, LanguageUpdateInput } from "@/services/languages";
import { toast } from "sonner";
import { athleteKeys } from "./use-athlete";

export const languageKeys = {
  all: ["languages"] as const,
  list: () => [...languageKeys.all, "list"] as const,
};

export function useLanguages() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: languageKeys.list(),
    queryFn: async () => {
      const token = await getToken();
      return listLanguages(token!);
    },
  });
}

export function useCreateLanguage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LanguageCreateInput) => {
      const token = await getToken();
      return createLanguage(token!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languageKeys.all });
      queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });
      toast.success("Language added");
    },
    onError: () => {
      toast.error("Failed to add language");
    },
  });
}

export function useUpdateLanguage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LanguageUpdateInput }) => {
      const token = await getToken();
      return updateLanguage(token!, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languageKeys.all });
      queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });
      toast.success("Language updated");
    },
    onError: () => {
      toast.error("Failed to update language");
    },
  });
}

export function useDeleteLanguage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (langId: number) => {
      const token = await getToken();
      return deleteLanguage(token!, langId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languageKeys.all });
      queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });
      toast.success("Language removed");
    },
    onError: () => {
      toast.error("Failed to remove language");
    },
  });
}
