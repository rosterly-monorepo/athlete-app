"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFile, deleteFile } from "@/services/upload";
import { athleteKeys } from "./use-athlete";
import type { UIUpload } from "@/types/form-schema";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UseFileUploadOptions {
  /** Field name (e.g., "avatar", "transcript") */
  field: string;
  /** Upload configuration from schema */
  uploadConfig?: UIUpload;
  /** Callback on successful upload */
  onSuccess?: (url: string) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseFileUploadReturn {
  status: UploadStatus;
  progress: number;
  error: string | null;
  upload: (file: File) => Promise<string | null>;
  remove: () => Promise<boolean>;
  validateFile: (file: File) => string | null;
}

/**
 * Hook for handling file uploads with progress tracking and validation.
 */
export function useFileUpload({
  field,
  uploadConfig,
  onSuccess,
  onError,
}: UseFileUploadOptions): UseFileUploadReturn {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate file against upload configuration.
   * Returns error message if invalid, null if valid.
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!uploadConfig) return null;

      // Check file type
      if (uploadConfig.accept) {
        const acceptTypes = uploadConfig.accept.split(",").map((t) => t.trim());
        const isValidType = acceptTypes.some((type) => {
          if (type.endsWith("/*")) {
            // Wildcard like "image/*"
            const category = type.replace("/*", "/");
            return file.type.startsWith(category);
          }
          return file.type === type;
        });

        if (!isValidType) {
          return `Invalid file type. Allowed: ${uploadConfig.accept}`;
        }
      }

      // Check file size
      if (uploadConfig.maxSizeMB) {
        const maxBytes = uploadConfig.maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
          return `File too large. Maximum size: ${uploadConfig.maxSizeMB}MB`;
        }
      }

      return null;
    },
    [uploadConfig]
  );

  /**
   * Upload a file. Returns the CDN URL on success, null on failure.
   */
  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      // Validate first
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setStatus("error");
        onError?.(new Error(validationError));
        return null;
      }

      setStatus("uploading");
      setProgress(0);
      setError(null);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Not authenticated");
        }

        const url = await uploadFile(token, field, file, setProgress);

        setStatus("success");
        setProgress(100);

        // Invalidate profile cache so the new URL is reflected
        queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });

        onSuccess?.(url);
        return url;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        setStatus("error");
        onError?.(err instanceof Error ? err : new Error(message));
        return null;
      }
    },
    [field, getToken, queryClient, validateFile, onSuccess, onError]
  );

  /**
   * Delete the uploaded file. Returns true on success.
   */
  const remove = useCallback(async (): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      await deleteFile(token, field);

      setStatus("idle");
      setProgress(0);
      setError(null);

      // Invalidate profile cache
      queryClient.invalidateQueries({ queryKey: athleteKeys.myProfile });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      setError(message);
      setStatus("error");
      return false;
    }
  }, [field, getToken, queryClient]);

  return { status, progress, error, upload, remove, validateFile };
}
