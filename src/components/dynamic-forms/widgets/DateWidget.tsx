"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";

interface DateWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
}

export function DateWidget({ field, property, fieldKey, error }: DateWidgetProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldKey}>{property.title || fieldKey}</Label>
      <Input
        id={fieldKey}
        type="date"
        placeholder={property["x-ui-placeholder"]}
        disabled={property["x-ui-disabled"]}
        aria-invalid={!!error}
        {...field}
        value={field.value ?? ""}
      />
      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
