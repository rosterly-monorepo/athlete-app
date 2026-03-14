"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";

interface SelectWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function SelectWidget({ field, property, fieldKey, error, required }: SelectWidgetProps) {
  // Get options from x-ui-options or build from enum
  const options: Array<{ value: string; label: string; category?: string }> =
    property["x-ui-options"] || property.enum?.map((v) => ({ value: v, label: v })) || [];

  // Group options by category if present
  const hasCategories = options.some((opt) => opt.category);

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldKey}>
        {property.title || fieldKey}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={field.value ?? ""}
        onValueChange={field.onChange}
        disabled={property["x-ui-disabled"]}
      >
        <SelectTrigger id={fieldKey} aria-invalid={!!error}>
          <SelectValue placeholder={property["x-ui-placeholder"] || "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {hasCategories
            ? // Group by category
              Object.entries(
                options.reduce(
                  (acc, opt) => {
                    const cat = opt.category || "Other";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(opt);
                    return acc;
                  },
                  {} as Record<string, typeof options>
                )
              ).map(([category, categoryOptions]) => (
                <div key={category}>
                  <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
                    {category}
                  </div>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </div>
              ))
            : // Flat list
              options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>
      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
