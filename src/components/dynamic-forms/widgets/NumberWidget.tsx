"use client";

import { Input } from "@/components/ui/input";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";
import { FieldLabel } from "../FieldLabel";

interface NumberWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function NumberWidget({ field, property, fieldKey, error, required }: NumberWidgetProps) {
  const validation = property["x-ui-validation"] || {};
  const isInteger = property.type === "integer";

  return (
    <div className="grid gap-2">
      <FieldLabel fieldKey={fieldKey} property={property} required={required} />
      <Input
        id={fieldKey}
        type="number"
        min={validation.min}
        max={validation.max}
        step={isInteger ? 1 : 0.01}
        placeholder={property["x-ui-placeholder"]}
        disabled={property["x-ui-disabled"]}
        aria-invalid={!!error}
        {...field}
        value={field.value ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "") {
            field.onChange(undefined);
          } else {
            field.onChange(isInteger ? parseInt(value, 10) : parseFloat(value));
          }
        }}
      />
      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
