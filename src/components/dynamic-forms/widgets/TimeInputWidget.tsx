"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";
import { FieldLabel } from "../FieldLabel";

interface TimeInputWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

/** Convert total seconds to mm:ss.t display string. */
function secondsToDisplay(seconds: number | null | undefined): string {
  if (seconds == null) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  // Show one decimal place for tenths
  const secsStr = secs < 10 ? `0${secs.toFixed(1)}` : secs.toFixed(1);
  return `${mins}:${secsStr}`;
}

/** Parse mm:ss.t (or ss.t) input string to total seconds. Returns null if invalid. */
function parseTimeInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match mm:ss.t or mm:ss or m:ss.t or m:ss
  const colonMatch = trimmed.match(/^(\d{1,3}):(\d{1,2}(?:\.\d{0,2})?)$/);
  if (colonMatch) {
    const mins = parseInt(colonMatch[1], 10);
    const secs = parseFloat(colonMatch[2]);
    if (secs >= 60) return null;
    return Math.round((mins * 60 + secs) * 10) / 10;
  }

  // Allow plain seconds for short times (e.g., "10.5" for 100m)
  const plainMatch = trimmed.match(/^\d+(?:\.\d{0,2})?$/);
  if (plainMatch) {
    return Math.round(parseFloat(trimmed) * 10) / 10;
  }

  return null;
}

export function TimeInputWidget({
  field,
  property,
  fieldKey,
  error,
  required,
}: TimeInputWidgetProps) {
  // While editing, we keep the raw text. When not editing, derive from field.value.
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [localError, setLocalError] = useState<string>();

  const displayValue = editing ? editText : secondsToDisplay(field.value);

  const handleFocus = useCallback(() => {
    setEditing(true);
    setEditText(secondsToDisplay(field.value));
    setLocalError(undefined);
  }, [field.value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
    setLocalError(undefined);
  }, []);

  const handleBlur = useCallback(() => {
    field.onBlur();
    setEditing(false);
    if (!editText.trim()) {
      field.onChange(undefined);
      setLocalError(undefined);
      return;
    }
    const parsed = parseTimeInput(editText);
    if (parsed === null) {
      setLocalError("Enter time as m:ss.t (e.g., 6:15.4)");
      setEditing(true); // Keep editing so user can fix
    } else {
      field.onChange(parsed);
      setLocalError(undefined);
    }
  }, [editText, field]);

  const shownError = localError || error;

  return (
    <div className="grid gap-2">
      <FieldLabel fieldKey={fieldKey} property={property} required={required} />
      <Input
        id={fieldKey}
        type="text"
        inputMode="decimal"
        placeholder={property["x-ui-placeholder"] || "m:ss.t"}
        disabled={property["x-ui-disabled"]}
        aria-invalid={!!shownError}
        value={displayValue}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {shownError && <p className="text-destructive text-xs">{shownError}</p>}
    </div>
  );
}
