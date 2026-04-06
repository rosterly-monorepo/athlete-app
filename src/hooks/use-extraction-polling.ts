"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { athleteKeys } from "./use-athlete";

export type ExtractionPollingStatus =
  | "idle"
  | "polling"
  | "complete"
  | "failed"
  | "empty"
  | "pending";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

/** Map from snake_case API field names to camelCase form field names */
const FIELD_TO_FORM_KEY: Record<string, string> = {
  high_school_name: "highSchoolName",
  high_school_city: "highSchoolCity",
  high_school_state: "highSchoolState",
  graduation_year: "graduationYear",
  gpa_unweighted: "gpaUnweighted",
  gpa_weighted: "gpaWeighted",
  gpa_scale: "gpaScale",
  class_rank: "classRank",
  class_size: "classSize",
  sat_total: "satTotal",
  sat_reading_writing: "satReadingWriting",
  sat_math: "satMath",
  act_composite: "actComposite",
  act_english: "actEnglish",
  act_math: "actMath",
  act_reading: "actReading",
  act_science: "actScience",
  ap_scores: "apScores",
};

interface UseExtractionPollingOptions {
  enabled: boolean;
  profileKey: string;
}

interface UseExtractionPollingReturn {
  status: ExtractionPollingStatus;
  /** camelCase form field names of extracted fields */
  extractedFields: string[];
  /** Error message from the backend if extraction failed */
  extractionError: string | null;
}

/**
 * Polls the profile endpoint after a document upload to detect when
 * backend extraction has completed, failed, or found no data.
 *
 * Checks `extraction_status` on the academics section instead of
 * diffing field values — gives a definitive signal for all outcomes.
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

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (Date.now() - startTimeRef.current > POLL_TIMEOUT_MS) {
      stopPolling();
      // Extraction is still running on the backend — don't mislead the user
      setStatus("pending");
      return;
    }

    try {
      await queryClient.refetchQueries({ queryKey: athleteKeys.myProfile });

      const profile = queryClient.getQueryData<Record<string, unknown>>(athleteKeys.myProfile);
      if (!profile) return;

      const section = profile[profileKey] as Record<string, unknown> | null | undefined;
      if (!section) return;

      const extractionStatus = section.extraction_status as string | null;

      if (extractionStatus === "complete") {
        stopPolling();
        const apiFields = (section.extraction_fields as string[] | null) ?? [];
        const formFields = apiFields.map((f) => FIELD_TO_FORM_KEY[f] ?? f);

        if (formFields.length > 0) {
          setExtractedFields(formFields);
          setStatus("complete");
        } else {
          setStatus("empty");
        }
        return;
      }

      if (extractionStatus === "failed") {
        stopPolling();
        setExtractionError((section.extraction_error as string | null) ?? "Extraction failed");
        setStatus("failed");
        return;
      }

      // "pending" or still null → keep polling
    } catch {
      // Silently continue polling on error
    }
  }, [queryClient, profileKey, stopPolling]);

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return () => {};
    }

    setStatus("polling");
    setExtractedFields([]);
    setExtractionError(null);
    startTimeRef.current = Date.now();
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { status, extractedFields, extractionError };
}
