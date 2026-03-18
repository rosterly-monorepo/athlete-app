"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

export type AutoSaveStatus = "idle" | "pending" | "saved";

interface UseAutoSaveOptions {
  /** React Hook Form methods instance */
  formMethods: UseFormReturn;
  /** Called with dirty field data when auto-save triggers */
  onSave: (dirtyData: Record<string, unknown>) => void;
  /** Debounce delay in ms (default 3000) */
  delay?: number;
  /** Enable/disable auto-save (default true) */
  enabled?: boolean;
  /** Whether the save mutation is currently in flight */
  isSaving?: boolean;
}

interface UseAutoSaveReturn {
  /** Immediately save any pending dirty fields (cancels debounce timer) */
  flush: () => void;
  /** Current auto-save status */
  status: AutoSaveStatus;
}

/**
 * Hook that watches React Hook Form state and debounces saves.
 * Validates before saving — skips if validation fails.
 * Exposes flush() for immediate save (e.g., on section change).
 */
export function useAutoSave({
  formMethods,
  onSave,
  delay = 3000,
  enabled = true,
  isSaving = false,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const isSavingRef = useRef(isSaving);

  // Keep refs in sync to avoid stale closures
  onSaveRef.current = onSave;
  isSavingRef.current = isSaving;

  // Subscribe to all form value changes
  const watchedValues = useWatch({ control: formMethods.control });

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const performSave = useCallback(async () => {
    clearTimer();

    const { isDirty, dirtyFields } = formMethods.formState;
    if (!isDirty) return;

    // Don't auto-save while another save is in flight
    if (isSavingRef.current) return;

    // Validate before saving
    const isValid = await formMethods.trigger();
    if (!isValid) return;

    // Filter to only dirty fields
    const allValues = formMethods.getValues();
    const dirtyData: Record<string, unknown> = {};
    for (const key of Object.keys(allValues)) {
      if ((dirtyFields as Record<string, unknown>)[key]) {
        dirtyData[key] = allValues[key];
      }
    }

    if (Object.keys(dirtyData).length === 0) return;

    setStatus("pending");
    onSaveRef.current(dirtyData);

    // Reset dirty state while keeping current values
    formMethods.reset(allValues, { keepValues: true });
  }, [formMethods, clearTimer]);

  // When the save mutation finishes, show "saved" briefly
  useEffect(() => {
    if (status === "pending" && !isSaving) {
      setStatus("saved");
      const fadeTimer = setTimeout(() => setStatus("idle"), 2000);
      return () => clearTimeout(fadeTimer);
    }
  }, [isSaving, status]);

  // Debounce: restart timer when watched values change
  useEffect(() => {
    if (!enabled) return;
    if (!formMethods.formState.isDirty) return;

    clearTimer();
    timerRef.current = setTimeout(() => {
      performSave();
    }, delay);

    return () => clearTimer();
    // watchedValues triggers re-run when any form value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues, enabled, delay, clearTimer, performSave]);

  // Flush on unmount so pending changes aren't lost
  useEffect(() => {
    return () => {
      clearTimer();
      // Check dirty state synchronously on unmount
      if (formMethods.formState.isDirty) {
        const allValues = formMethods.getValues();
        const dirtyFields = formMethods.formState.dirtyFields;
        const dirtyData: Record<string, unknown> = {};
        for (const key of Object.keys(allValues)) {
          if ((dirtyFields as Record<string, unknown>)[key]) {
            dirtyData[key] = allValues[key];
          }
        }
        if (Object.keys(dirtyData).length > 0) {
          onSaveRef.current(dirtyData);
        }
      }
    };
    // Only run cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flush = useCallback(() => {
    performSave();
  }, [performSave]);

  return { flush, status };
}
