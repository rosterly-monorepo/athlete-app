"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { SearchFilterSchema } from "@/services/types";

interface ToggleFilterProps {
  filter: SearchFilterSchema;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}

export function ToggleFilter({ filter, value, onChange }: ToggleFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={filter.field}
        checked={value ?? false}
        onCheckedChange={(checked) => onChange(checked || undefined)}
      />
      <Label htmlFor={filter.field} className="cursor-pointer text-sm font-normal">
        {filter.label}
      </Label>
    </div>
  );
}
