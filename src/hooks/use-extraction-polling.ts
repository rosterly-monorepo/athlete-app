"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { athleteKeys } from "./use-athlete";

export type ExtractionPollingStatus = "idle" | "polling" | "complete" | "failed" | "empty";

/** Per-document extraction job from the backend `extractions` JSON. */
interface ExtractionJob {
  status: "pending" | "complete" | "failed";
  fields: string[];
  error: string | null;
  completed_at: string | null;
}

/** Fast polling for the first 30 seconds (most extractions finish here). */
const FAST_INTERVAL_MS = 2_000;
/** Slower polling after 30 seconds to avoid unnecessary requests. */
const SLOW_INTERVAL_MS = 10_000;
/** Switch from fast to slow polling after this threshold. */
const SLOW_THRESHOLD_MS = 30_000;
/** Stop polling entirely after 5 minutes. */
const POLL_TIMEOUT_MS = 300_000;

/** Convert snake_case API field names to camelCase form field names. */
function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Check if any extraction job in the dict has status "pending". */
function hasAnyPending(extractions: Record<string, ExtractionJob> | null | undefined): boolean {
  if (!extractions) return false;
  return Object.values(extractions).some((job) => job.status === "pending");
}

/** Collect all extracted field names from all completed jobs. */
function collectExtractedFields(
  extractions: Record<string, ExtractionJob> | null | undefined
): string[] {
  if (!extractions) return [];
  const fields: string[] = [];
  for (const job of Object.values(extractions)) {
    if (job.status === "complete" && job.fields.length > 0) {
      fields.push(...job.fields);
    }
  }
  return fields;
}

interface UseExtractionPollingOptions {
  enabled: boolean;
  profileKey: string;
}

interface UseExtractionPollingReturn {
  status: ExtractionPollingStatus;
  /** camelCase form field names of ALL extracted fields across documents */
  extractedFields: string[];
  /** Error message from the backend if any extraction failed */
  extractionError: string | null;
}

/**
 * Polls the profile endpoint after a document upload to detect when
 * backend extraction has completed, failed, or found no data.
 *
 * Per-document state: each document's extraction is tracked independently
 * in the `extractions` JSON column. Polling continues as long as ANY
 * extraction is pending. Uploading a second document does not reset
 * the first document's completed state.
 *
 * Uses two-phase polling: fast (every 2s) for the first 30 seconds,
 * then slower (every 10s) for up to 5 minutes total.
 */
export function useExtractionPolling({
  enabled,
  profileKey,
}: UseExtractionPollingOptions): UseExtractionPollingReturn {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ExtractionPollingStatus>("idle");
  const [extractedFields, setExtractedFields] = useState<string[]>([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  // Track which fields we've already reported as "newly completed"
  // so we don't re-highlight on every poll cycle
  const reportedFieldsRef = useRef<Set<string>>(new Set());

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    const elapsed = Date.now() - startTimeRef.current;

    if (elapsed > POLL_TIMEOUT_MS) {
      stopPolling();
      setStatus("idle");
      return;
    }

    // Switch from fast to slow polling at the threshold
    if (elapsed > SLOW_THRESHOLD_MS && intervalRef.current !== null) {
      stopPolling();
      intervalRef.current = setInterval(poll, SLOW_INTERVAL_MS);
    }

    try {
      await queryClient.refetchQueries({ queryKey: athleteKeys.myProfile });

      const profile = queryClient.getQueryData<Record<string, unknown>>(athleteKeys.myProfile);
      if (!profile) return;

      const section = profile[profileKey] as Record<string, unknown> | null | undefined;
      if (!section) return;

      const extractions = section.extractions as Record<string, ExtractionJob> | null | undefined;

      // Check if any extractions just completed (fields we haven't reported yet)
      const allFields = collectExtractedFields(extractions);
      const newFields = allFields.filter((f) => !reportedFieldsRef.current.has(f));

      if (newFields.length > 0) {
        // Report newly extracted fields for highlighting
        newFields.forEach((f) => reportedFieldsRef.current.add(f));
        setExtractedFields(newFields.map(snakeToCamel));
        setStatus("complete");
      }

      // Check for any failed extractions
      if (extractions) {
        for (const job of Object.values(extractions)) {
          if (job.status === "failed" && job.error) {
            setExtractionError(job.error);
            // Don't stop polling — other extractions may still be pending
          }
        }
      }

      // Stop polling if nothing is pending anymore
      if (!hasAnyPending(extractions)) {
        stopPolling();
        // If we never found any fields, report empty (only if we didn't already complete)
        if (allFields.length === 0 && status !== "complete") {
          setStatus("empty");
        }
      }
    } catch {
      // Silently continue polling on error
    }
  }, [queryClient, profileKey, stopPolling, status]);

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return () => {};
    }

    setStatus("polling");
    // Don't reset extractedFields — preserve previously completed extractions
    setExtractionError(null);
    startTimeRef.current = Date.now();
    poll();
    // Start with fast polling
    intervalRef.current = setInterval(poll, FAST_INTERVAL_MS);

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { status, extractedFields, extractionError };
}

/**
 * Check if any extraction in the profile data is pending.
 * Used to auto-enable polling on mount (e.g. navigate away and back).
 */
export function hasAnyPendingExtraction(initialData: Record<string, unknown> | undefined): boolean {
  if (!initialData) return false;
  const extractions = initialData.extractions as Record<string, ExtractionJob> | null | undefined;
  return hasAnyPending(extractions);
}
