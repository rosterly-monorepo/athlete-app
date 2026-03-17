"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";
import { FieldTooltip } from "../FieldLabel";

interface SwitchWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function SwitchWidget({ field, property, fieldKey, error, required }: SwitchWidgetProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center space-x-2">
        <Switch
          id={fieldKey}
          checked={field.value ?? false}
          onCheckedChange={field.onChange}
          disabled={property["x-ui-disabled"]}
          aria-invalid={!!error}
        />
        <Label
          htmlFor={fieldKey}
          className="flex items-center gap-1 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {property.title || fieldKey}
          {required && <span className="text-destructive">*</span>}
          {property["x-ui-tooltip"] && <FieldTooltip tooltip={property["x-ui-tooltip"]} />}
        </Label>
      </div>
      {property.description && (
        <p className="text-muted-foreground ml-12 text-xs">{property.description}</p>
      )}
      {error && <p className="text-destructive ml-12 text-xs">{error}</p>}
    </div>
  );
}
