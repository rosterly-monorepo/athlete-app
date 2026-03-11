/**
 * File upload service for the 3-step presigned URL upload flow.
 *
 * Flow:
 * 1. POST /athletes/me/{field} → get presigned upload URL
 * 2. PUT to presigned URL → upload file directly to cloud storage
 * 3. POST /athletes/me/{field}/confirm → confirm upload completed
 */

import { apiClient } from "./api-client";

/** Response from initiating an upload */
export interface InitUploadResponse {
  upload_url: string;
  avatar_url: string; // Final CDN URL after upload
  expires_at: string;
  max_size_bytes: number;
}

/** Response from confirming an upload */
export interface ConfirmUploadResponse {
  url: string;
  confirmed_at: string;
}

/**
 * Step 1: Initialize upload - gets a presigned URL for direct cloud upload.
 */
export async function initFileUpload(
  token: string,
  field: string,
  contentType: string
): Promise<InitUploadResponse> {
  return apiClient<InitUploadResponse>(`/api/v1/athletes/me/${field}`, token, {
    method: "POST",
    body: JSON.stringify({ content_type: contentType }),
  });
}

/**
 * Step 2: Upload file directly to cloud storage using presigned URL.
 * Uses XMLHttpRequest for progress tracking.
 */
export async function uploadToStorage(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed due to network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was aborted"));
    });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

/**
 * Step 3: Confirm the upload completed successfully.
 */
export async function confirmFileUpload(
  token: string,
  field: string,
  fileUrl: string
): Promise<ConfirmUploadResponse> {
  return apiClient<ConfirmUploadResponse>(`/api/v1/athletes/me/${field}/confirm`, token, {
    method: "POST",
    body: JSON.stringify({ avatar_url: fileUrl }),
  });
}

/**
 * Delete an uploaded file.
 */
export async function deleteFile(token: string, field: string): Promise<void> {
  return apiClient<void>(`/api/v1/athletes/me/${field}`, token, {
    method: "DELETE",
  });
}

/**
 * Complete 3-step upload flow orchestrator.
 * Returns the final CDN URL on success.
 */
export async function uploadFile(
  token: string,
  field: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Step 1: Get presigned URL
  const { upload_url, avatar_url } = await initFileUpload(token, field, file.type);

  // Step 2: Upload to cloud storage
  await uploadToStorage(upload_url, file, onProgress);

  // Step 3: Confirm upload
  await confirmFileUpload(token, field, avatar_url);

  return avatar_url;
}
