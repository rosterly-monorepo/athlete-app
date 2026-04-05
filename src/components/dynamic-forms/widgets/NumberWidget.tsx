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
  const isInteger = property.type === "integer";
  const numericPattern = isInteger ? /^-?\d*$/ : /^-?\d*\.?\d*$/;

  return (
    <div className="grid gap-2">
      <FieldLabel fieldKey={fieldKey} property={property} required={required} />
      <Input
        id={fieldKey}
        type="text"
        inputMode={isInteger ? "numeric" : "decimal"}
        placeholder={property["x-ui-placeholder"]}
        disabled={property["x-ui-disabled"]}
        aria-invalid={!!error}
        {...field}
        value={field.value ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "") {
            field.onChange(undefined);
          } else if (numericPattern.test(value)) {
            // Store the parsed number when complete, or the raw string for
            // intermediate states (e.g. "4." while typing "4.0").
            // Zod preprocess in schema-to-zod.ts handles string→number on submit.
            const parsed = isInteger ? parseInt(value, 10) : parseFloat(value);
            if (!isNaN(parsed)) {
              // Keep the raw string when it would display differently after
              // round-tripping through Number (e.g. "4.0" → 4 → "4"), or
              // for incomplete input like "-" or "3.".
              field.onChange(String(parsed) !== value ? value : parsed);
            } else {
              // Incomplete but valid partial input (e.g. "-", ".")
              field.onChange(value);
            }
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
