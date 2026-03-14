"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";

interface TextareaWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function TextareaWidget({
  field,
  property,
  fieldKey,
  error,
  required,
}: TextareaWidgetProps) {
  const maxLength = property["x-ui-validation"]?.maxLength;

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldKey}>
        {property.title || fieldKey}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={fieldKey}
        placeholder={property["x-ui-placeholder"]}
        disabled={property["x-ui-disabled"]}
        maxLength={maxLength}
        aria-invalid={!!error}
        rows={4}
        {...field}
        value={field.value ?? ""}
      />
      {(property.description || maxLength) && (
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{property.description}</span>
          {maxLength && (
            <span>
              {field.value?.length ?? 0} / {maxLength}
            </span>
          )}
        </div>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
