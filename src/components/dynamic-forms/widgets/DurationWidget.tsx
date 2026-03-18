"use client";

import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";
import { FieldLabel } from "../FieldLabel";

interface DurationWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

/** Break total seconds into { hours, minutes, seconds }. */
function decompose(totalSeconds: number | null | undefined): {
  h: string;
  m: string;
  s: string;
} {
  if (totalSeconds == null) return { h: "", m: "", s: "" };
  const total = Math.round(totalSeconds * 10) / 10;
  const h = Math.floor(total / 3600);
  const remainder = total - h * 3600;
  const m = Math.floor(remainder / 60);
  const s = Math.round((remainder - m * 60) * 10) / 10;
  return {
    h: h > 0 ? String(h) : "",
    m: String(m),
    s: s % 1 === 0 ? String(s) : s.toFixed(1),
  };
}

/** Recompose h/m/s strings to total seconds. Returns null if all empty. */
function recompose(h: string, m: string, s: string): number | null {
  const hVal = h.trim() ? parseFloat(h) : 0;
  const mVal = m.trim() ? parseFloat(m) : 0;
  const sVal = s.trim() ? parseFloat(s) : 0;
  if (!h.trim() && !m.trim() && !s.trim()) return null;
  if (isNaN(hVal) || isNaN(mVal) || isNaN(sVal)) return null;
  return Math.round((hVal * 3600 + mVal * 60 + sVal) * 10) / 10;
}

export function DurationWidget({
  field,
  property,
  fieldKey,
  error,
  required,
}: DurationWidgetProps) {
  const [editing, setEditing] = useState(false);
  const derived = decompose(field.value);
  const [editH, setEditH] = useState(derived.h);
  const [editM, setEditM] = useState(derived.m);
  const [editS, setEditS] = useState(derived.s);
  const [localError, setLocalError] = useState<string>();

  // Track which element has focus to handle blur across the three inputs
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startEditing = useCallback(() => {
    if (!editing) {
      const d = decompose(field.value);
      setEditH(d.h);
      setEditM(d.m);
      setEditS(d.s);
      setEditing(true);
      setLocalError(undefined);
    }
  }, [editing, field.value]);

  const handleBlur = useCallback(() => {
    // Delay to check if focus moved to another input within the widget
    blurTimeoutRef.current = setTimeout(() => {
      if (containerRef.current && containerRef.current.contains(document.activeElement)) {
        return; // Focus moved to another input in this widget
      }
      field.onBlur();
      setEditing(false);

      if (!editH.trim() && !editM.trim() && !editS.trim()) {
        field.onChange(undefined);
        setLocalError(undefined);
        return;
      }

      const mVal = parseFloat(editM || "0");
      const sVal = parseFloat(editS || "0");
      if (mVal >= 60) {
        setLocalError("Minutes must be 0–59");
        setEditing(true);
        return;
      }
      if (sVal >= 60) {
        setLocalError("Seconds must be 0–59.9");
        setEditing(true);
        return;
      }

      const total = recompose(editH, editM, editS);
      if (total === null) {
        field.onChange(undefined);
      } else {
        field.onChange(total);
      }
      setLocalError(undefined);
    }, 0);
  }, [editH, editM, editS, field]);

  const handleFocus = useCallback(() => {
    clearTimeout(blurTimeoutRef.current);
    startEditing();
  }, [startEditing]);

  const displayH = editing ? editH : derived.h;
  const displayM = editing ? editM : derived.m;
  const displayS = editing ? editS : derived.s;
  const disabled = property["x-ui-disabled"];
  const shownError = localError || error;

  return (
    <div className="grid gap-2">
      <FieldLabel fieldKey={fieldKey} property={property} required={required} />
      <div ref={containerRef} className="flex items-center gap-1">
        <div className="grid gap-0.5">
          <Input
            id={`${fieldKey}-h`}
            type="number"
            min={0}
            placeholder="0"
            disabled={disabled}
            aria-label="Hours"
            aria-invalid={!!shownError}
            className="h-9 w-16 text-center tabular-nums"
            value={displayH}
            onFocus={handleFocus}
            onChange={(e) => setEditH(e.target.value)}
            onBlur={handleBlur}
          />
          <span className="text-muted-foreground text-center text-[10px]">h</span>
        </div>
        <span className="text-muted-foreground pb-4 text-sm font-medium">:</span>
        <div className="grid gap-0.5">
          <Input
            id={`${fieldKey}-m`}
            type="number"
            min={0}
            max={59}
            placeholder="00"
            disabled={disabled}
            aria-label="Minutes"
            aria-invalid={!!shownError}
            className="h-9 w-16 text-center tabular-nums"
            value={displayM}
            onFocus={handleFocus}
            onChange={(e) => setEditM(e.target.value)}
            onBlur={handleBlur}
          />
          <span className="text-muted-foreground text-center text-[10px]">m</span>
        </div>
        <span className="text-muted-foreground pb-4 text-sm font-medium">:</span>
        <div className="grid gap-0.5">
          <Input
            id={`${fieldKey}-s`}
            type="number"
            min={0}
            max={59.9}
            step={0.1}
            placeholder="00.0"
            disabled={disabled}
            aria-label="Seconds"
            aria-invalid={!!shownError}
            className="h-9 w-20 text-center tabular-nums"
            value={displayS}
            onFocus={handleFocus}
            onChange={(e) => setEditS(e.target.value)}
            onBlur={handleBlur}
          />
          <span className="text-muted-foreground text-center text-[10px]">s</span>
        </div>
      </div>
      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {shownError && <p className="text-destructive text-xs">{shownError}</p>}
    </div>
  );
}
