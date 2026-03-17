"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";
import {
  TextWidget,
  TextareaWidget,
  NumberWidget,
  DateWidget,
  SelectWidget,
  CheckboxWidget,
  SwitchWidget,
  ImageUploadWidget,
  VideoUploadWidget,
  DocumentUploadWidget,
  ComboboxWidget,
  DependentComboboxWidget,
  TimeInputWidget,
} from "./widgets";

interface FormFieldRendererProps {
  fieldKey: string;
  property: FormSchemaProperty;
  required?: boolean;
}

const WIDGET_MAP = {
  text: TextWidget,
  email: TextWidget,
  tel: TextWidget,
  url: TextWidget,
  textarea: TextareaWidget,
  number: NumberWidget,
  date: DateWidget,
  select: SelectWidget,
  checkbox: CheckboxWidget,
  switch: SwitchWidget,
  "country-select": ComboboxWidget,
  "state-select": DependentComboboxWidget,
  "language-select": ComboboxWidget,
  "image-upload": ImageUploadWidget,
  "video-upload": VideoUploadWidget,
  "document-upload": DocumentUploadWidget,
  "time-input": TimeInputWidget,
} as const;

/**
 * Infer widget type from JSON Schema property when x-ui-widget is not specified.
 */
function inferWidgetType(property: FormSchemaProperty): string {
  // Check for enum or options → select
  if (property.enum || property["x-ui-options"]) {
    return "select";
  }

  // Infer from type
  switch (property.type) {
    case "boolean":
      return "checkbox";
    case "number":
    case "integer":
      return "number";
    case "array":
      return "select"; // Multi-select
    default:
      return "text";
  }
}

/**
 * Renders a single form field based on the JSON Schema property definition.
 * Maps x-ui-widget to the appropriate widget component.
 */
export function FormFieldRenderer({ fieldKey, property, required }: FormFieldRendererProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Determine widget type: explicit x-ui-widget or infer from type
  const widgetType = property["x-ui-widget"] || inferWidgetType(property);
  const Widget = WIDGET_MAP[widgetType as keyof typeof WIDGET_MAP] || TextWidget;

  const error = errors[fieldKey]?.message as string | undefined;

  return (
    <Controller
      name={fieldKey}
      control={control}
      render={({ field }) => (
        <Widget
          field={field}
          property={property}
          fieldKey={fieldKey}
          error={error}
          required={required}
        />
      )}
    />
  );
}
