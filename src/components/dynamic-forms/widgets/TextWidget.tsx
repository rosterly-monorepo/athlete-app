"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";

interface TextWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
}

export function TextWidget({ field, property, fieldKey, error }: TextWidgetProps) {
  const widget = property["x-ui-widget"];
  const inputType =
    widget === "email" ? "email" : widget === "tel" ? "tel" : widget === "url" ? "url" : "text";

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldKey}>{property.title || fieldKey}</Label>
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
