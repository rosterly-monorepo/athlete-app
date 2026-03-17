"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecruitmentBoard,
  addRecord,
  reorderRecords,
  getRecord,
  updateRecord,
  moveRecord,
  archiveRecord,
  addNote,
  updateNote,
  deleteNote,
} from "@/services/recruitment";
import type {
  RecruitmentBoard,
  RecruitmentRecordWithAthlete,
  AddRecordInput,
  UpdateRecordInput,
  MoveRecordInput,
  ReorderInput,
  AddNoteInput,
  UpdateNoteInput,
  RecruitmentStage,
} from "@/services/types";
import { ApiClientError } from "@/services/api-client";
import { toast } from "sonner";

// ── Query Keys ──

export const recruitmentKeys = {
  all: ["recruitment"] as const,
  board: (programId: number) => ["recruitment", "board", programId] as const,
  record: (recordId: number) => ["recruitment", "record", recordId] as const,
};

// ── Board Hooks ──

export function useRecruitmentBoard(programId: number) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: recruitmentKeys.board(programId),
    queryFn: async () => {
      const token = await getToken();
      return getRecruitmentBoard(token!, programId);
    },
    enabled: !!programId,
  });
}

export function useAddRecord(programId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddRecordInput) => {
      const token = await getToken();
      return addRecord(token!, programId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.board(programId),
      });
      queryClient.invalidateQueries({
        queryKey: ["recruitment", "pipeline-athletes"],
      });
      toast.success("Athlete added to board");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to add athlete", { description: message });
    },
  });
}

// ── Pipeline membership check ──

/**
 * Returns a Set of athlete IDs that are already on any of the coach's program boards.
 * Used by search and profile pages to show "In Pipeline" status.
 */
export function usePipelineAthleteIds(programIds: number[]) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["recruitment", "pipeline-athletes", programIds],
    queryFn: async () => {
      const token = await getToken();
      const ids = new Set<number>();
      for (const pid of programIds) {
        const board = await getRecruitmentBoard(token!, pid);
        for (const col of board.columns) {
          for (const rec of col.records) {
            ids.add(rec.athlete_id);
          }
        }
      }
      return [...ids];
    },
    enabled: programIds.length > 0,
    staleTime: 30_000, // 30s — pipeline doesn't change frequently
  });
}

// ── Move Record with Optimistic Update ──

export function useMoveRecord(programId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, data }: { recordId: number; data: MoveRecordInput }) => {
      const token = await getToken();
      return moveRecord(token!, recordId, data);
    },
    onMutate: async ({ recordId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: recruitmentKeys.board(programId),
      });

      // Snapshot previous value
      const previousBoard = queryClient.getQueryData<RecruitmentBoard>(
        recruitmentKeys.board(programId)
      );

      // Optimistically update
      queryClient.setQueryData<RecruitmentBoard>(recruitmentKeys.board(programId), (old) => {
        if (!old) return old;

        // Find the record and its current column
        let movedRecord: RecruitmentRecordWithAthlete | undefined;
        let sourceStage: RecruitmentStage | undefined;

        for (const col of old.columns) {
          const found = col.records.find((r) => r.id === recordId);
          if (found) {
            movedRecord = found;
            sourceStage = col.stage;
            break;
          }
        }

        if (!movedRecord || !sourceStage) return old;

        return {
          ...old,
          columns: old.columns.map((col) => {
            if (col.stage === sourceStage && col.stage !== data.new_stage) {
              // Remove from source
              return {
                ...col,
                records: col.records.filter((r) => r.id !== recordId),
                count: col.count - 1,
              };
            }
            if (col.stage === data.new_stage) {
              // Add to destination at position
              const newRecords = col.records.filter((r) => r.id !== recordId);
              const updatedRecord: RecruitmentRecordWithAthlete = {
                ...movedRecord!,
                stage: data.new_stage,
                stage_order: data.new_order,
              };
              newRecords.splice(data.new_order, 0, updatedRecord);
              return {
                ...col,
                records: newRecords.map((r, i) => ({
                  ...r,
                  stage_order: i,
                })),
                count: sourceStage === data.new_stage ? col.count : col.count + 1,
              };
            }
            return col;
          }),
        };
      });

      return { previousBoard };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousBoard) {
        queryClient.setQueryData(recruitmentKeys.board(programId), context.previousBoard);
      }
      const message = _err instanceof ApiClientError ? _err.userMessage : "Something went wrong.";
      toast.error("Failed to move athlete", { description: message });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.board(programId),
      });
    },
  });
}

// ── Reorder within column ──

export function useReorderRecords(programId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderInput) => {
      const token = await getToken();
      return reorderRecords(token!, programId, data);
    },
    onMutate: async ({ stage, record_ids }) => {
      await queryClient.cancelQueries({
        queryKey: recruitmentKeys.board(programId),
      });

      const previousBoard = queryClient.getQueryData<RecruitmentBoard>(
        recruitmentKeys.board(programId)
      );

      queryClient.setQueryData<RecruitmentBoard>(recruitmentKeys.board(programId), (old) => {
        if (!old) return old;

        return {
          ...old,
          columns: old.columns.map((col) => {
            if (col.stage !== stage) return col;

            // Reorder based on new positions
            const recordMap = new Map(col.records.map((r) => [r.id, r]));
            const newRecords = record_ids
              .map((id) => recordMap.get(id))
              .filter(Boolean) as RecruitmentRecordWithAthlete[];

            return {
              ...col,
              records: newRecords.map((r, i) => ({
                ...r,
                stage_order: i,
              })),
            };
          }),
        };
      });

      return { previousBoard };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(recruitmentKeys.board(programId), context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.board(programId),
      });
    },
  });
}

// ── Record Hooks ──

export function useRecord(recordId: number) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: recruitmentKeys.record(recordId),
    queryFn: async () => {
      const token = await getToken();
      return getRecord(token!, recordId);
    },
    enabled: !!recordId,
  });
}

export function useUpdateRecord(programId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, data }: { recordId: number; data: UpdateRecordInput }) => {
      const token = await getToken();
      return updateRecord(token!, recordId, data);
    },
    onSuccess: (updatedRecord) => {
      // Update in board cache
      queryClient.setQueryData<RecruitmentBoard>(recruitmentKeys.board(programId), (old) => {
        if (!old) return old;
        return {
          ...old,
          columns: old.columns.map((col) => ({
            ...col,
            records: col.records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)),
          })),
        };
      });
      // Invalidate individual record cache
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.record(updatedRecord.id),
      });
      toast.success("Record updated");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to update record", { description: message });
    },
  });
}

export function useArchiveRecord(programId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: number) => {
      const token = await getToken();
      return archiveRecord(token!, recordId);
    },
    onSuccess: (_data, recordId) => {
      queryClient.setQueryData<RecruitmentBoard>(recruitmentKeys.board(programId), (old) => {
        if (!old) return old;
        return {
          ...old,
          columns: old.columns.map((col) => ({
            ...col,
            records: col.records.filter((r) => r.id !== recordId),
            count: col.records.some((r) => r.id === recordId) ? col.count - 1 : col.count,
          })),
          total_count: old.total_count - 1,
        };
      });
      toast.success("Athlete archived");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to archive athlete", { description: message });
    },
  });
}

// ── Note Hooks ──

export function useAddNote(programId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, data }: { recordId: number; data: AddNoteInput }) => {
      const token = await getToken();
      return addNote(token!, recordId, data);
    },
    onSuccess: (_newNote, { recordId }) => {
      // Invalidate board and record caches
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.board(programId),
      });
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.record(recordId),
      });
      toast.success("Note added");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to add note", { description: message });
    },
  });
}

export function useUpdateNote(programId: number, recordId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, data }: { noteId: number; data: UpdateNoteInput }) => {
      const token = await getToken();
      return updateNote(token!, noteId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.board(programId),
      });
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.record(recordId),
      });
      toast.success("Note updated");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to update note", { description: message });
    },
  });
}

export function useDeleteNote(programId: number, recordId: number) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: number) => {
      const token = await getToken();
      return deleteNote(token!, noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.board(programId),
      });
      queryClient.invalidateQueries({
        queryKey: recruitmentKeys.record(recordId),
      });
      toast.success("Note deleted");
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.userMessage : "Something went wrong.";
      toast.error("Failed to delete note", { description: message });
    },
  });
}
