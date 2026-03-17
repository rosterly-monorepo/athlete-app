"use client";

import { Input } from "@/components/ui/input";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";
import { FieldLabel } from "../FieldLabel";

interface TextWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function TextWidget({ field, property, fieldKey, error, required }: TextWidgetProps) {
  const widget = property["x-ui-widget"];
  const inputType =
    widget === "email" ? "email" : widget === "tel" ? "tel" : widget === "url" ? "url" : "text";

  return (
    <div className="grid gap-2">
      <FieldLabel fieldKey={fieldKey} property={property} required={required} />
      <Input
        id={fieldKey}
        type={inputType}
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
