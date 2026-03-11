"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";

interface CheckboxWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
}

export function CheckboxWidget({ field, property, fieldKey, error }: CheckboxWidgetProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={fieldKey}
          checked={field.value ?? false}
          onCheckedChange={field.onChange}
          disabled={property["x-ui-disabled"]}
          aria-invalid={!!error}
        />
        <Label
          htmlFor={fieldKey}
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {property.title || fieldKey}
        </Label>
      </div>
      {property.description && (
        <p className="text-muted-foreground ml-6 text-xs">{property.description}</p>
      )}
      {error && <p className="text-destructive ml-6 text-xs">{error}</p>}
    </div>
  );
}
