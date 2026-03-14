"use client";

import { useCallback, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import type { SearchFilterSchema } from "@/services/types";

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

function formatRowingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatValue(value: number, filter: SearchFilterSchema): string {
  if (filter.display_format === "height_inches") return formatHeight(value);
  if (filter.display_format === "rowing_time") return formatRowingTime(value);
  if (filter.unit) return `${value} ${filter.unit}`;
  return String(value);
}

interface RangeFilterProps {
  filter: SearchFilterSchema;
  value: [number, number] | undefined;
  onChange: (value: [number, number] | undefined) => void;
}

export function RangeFilter({ filter, value, onChange }: RangeFilterProps) {
  const min = filter.min ?? 0;
  const max = filter.max ?? 100;
  const step = filter.step ?? 1;

  const currentValue = useMemo<[number, number]>(() => value ?? [min, max], [value, min, max]);

  const isDefault = currentValue[0] === min && currentValue[1] === max;

  const handleChange = useCallback(
    (newValue: number[]) => {
      const range: [number, number] = [newValue[0], newValue[1]];
      if (range[0] === min && range[1] === max) {
        onChange(undefined);
      } else {
        onChange(range);
      }
    },
    [min, max, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{formatValue(currentValue[0], filter)}</span>
        <span>{formatValue(currentValue[1], filter)}</span>
      </div>
      <Slider min={min} max={max} step={step} value={currentValue} onValueChange={handleChange} />
      {!isDefault && (
        <button
          className="text-muted-foreground hover:text-foreground text-xs"
          onClick={() => onChange(undefined)}
        >
          Reset
        </button>
      )}
    </div>
  );
}
