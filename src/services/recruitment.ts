import { apiClient } from "./api-client";
import type {
  RecruitmentBoard,
  RecruitmentRecordWithAthlete,
  RecruitmentRecordDetail,
  RecruitmentNote,
  AddRecordInput,
  UpdateRecordInput,
  MoveRecordInput,
  ReorderInput,
  AddNoteInput,
  UpdateNoteInput,
} from "./types";

// ── Board ──

export async function getRecruitmentBoard(
  token: string,
  programId: number
): Promise<RecruitmentBoard> {
  return apiClient<RecruitmentBoard>(`/api/v1/recruitment/programs/${programId}/board`, token);
}

export async function addRecord(
  token: string,
  programId: number,
  data: AddRecordInput
): Promise<RecruitmentRecordWithAthlete> {
  return apiClient<RecruitmentRecordWithAthlete>(
    `/api/v1/recruitment/programs/${programId}/records`,
    token,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function reorderRecords(
  token: string,
  programId: number,
  data: ReorderInput
): Promise<void> {
  return apiClient(`/api/v1/recruitment/programs/${programId}/reorder`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Record ──

export async function getRecord(token: string, recordId: number): Promise<RecruitmentRecordDetail> {
  return apiClient<RecruitmentRecordDetail>(`/api/v1/recruitment/records/${recordId}`, token);
}

export async function updateRecord(
  token: string,
  recordId: number,
  data: UpdateRecordInput
): Promise<RecruitmentRecordWithAthlete> {
  return apiClient<RecruitmentRecordWithAthlete>(`/api/v1/recruitment/records/${recordId}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function moveRecord(
  token: string,
  recordId: number,
  data: MoveRecordInput
): Promise<RecruitmentRecordWithAthlete> {
  return apiClient<RecruitmentRecordWithAthlete>(
    `/api/v1/recruitment/records/${recordId}/move`,
    token,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function archiveRecord(token: string, recordId: number): Promise<void> {
  return apiClient(`/api/v1/recruitment/records/${recordId}`, token, {
    method: "DELETE",
  });
}

// ── Notes ──

export async function addNote(
  token: string,
  recordId: number,
  data: AddNoteInput
): Promise<RecruitmentNote> {
  return apiClient<RecruitmentNote>(`/api/v1/recruitment/records/${recordId}/notes`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateNote(
  token: string,
  noteId: number,
  data: UpdateNoteInput
): Promise<RecruitmentNote> {
  return apiClient<RecruitmentNote>(`/api/v1/recruitment/notes/${noteId}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteNote(token: string, noteId: number): Promise<void> {
  return apiClient(`/api/v1/recruitment/notes/${noteId}`, token, {
    method: "DELETE",
  });
}
