"use client";

import { useRef, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useExtractionHighlight } from "@/contexts/extraction-highlight-context";
import type { FormSchemaProperty } from "@/types/form-schema";
import {
  TextWidget,
  TextareaWidget,
  NumberWidget,
  DateWidget,
  SelectWidget,
  MultiSelectWidget,
  CheckboxWidget,
  SwitchWidget,
  ImageUploadWidget,
  VideoUploadWidget,
  DocumentUploadWidget,
  ComboboxWidget,
  DependentComboboxWidget,
  TimeInputWidget,
  DurationWidget,
  APScoresWidget,
} from "./widgets";

interface FormFieldRendererProps {
  fieldKey: string;
  property: FormSchemaProperty;
  required?: boolean;
  sectionId?: string;
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
  "multi-select": MultiSelectWidget,
  checkbox: CheckboxWidget,
  switch: SwitchWidget,
  "country-select": ComboboxWidget,
  "state-select": DependentComboboxWidget,
  "language-select": ComboboxWidget,
  "image-upload": ImageUploadWidget,
  "video-upload": VideoUploadWidget,
  "document-upload": DocumentUploadWidget,
  "time-input": TimeInputWidget,
  duration: DurationWidget,
  "ap-scores": APScoresWidget,
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
export function FormFieldRenderer({
  fieldKey,
  property,
  required,
  sectionId,
}: FormFieldRendererProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Determine widget type: explicit x-ui-widget or infer from type
  const widgetType = property["x-ui-widget"] || inferWidgetType(property);
  const Widget = WIDGET_MAP[widgetType as keyof typeof WIDGET_MAP] || TextWidget;

  const error = errors[fieldKey]?.message as string | undefined;
  const highlightedFields = useExtractionHighlight();
  const isHighlighted = highlightedFields.has(fieldKey);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Scroll the first highlighted field into view
  useEffect(() => {
    if (isHighlighted && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isHighlighted]);

  // Upload widgets need the section context for document upload routing
  const extraProps =
    widgetType === "document-upload" ||
    widgetType === "image-upload" ||
    widgetType === "video-upload"
      ? { section: sectionId }
      : {};

  return (
    <div
      ref={isHighlighted ? highlightRef : undefined}
      className={isHighlighted ? "animate-extraction-glow rounded-lg" : undefined}
    >
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
            {...extraProps}
          />
        )}
      />
    </div>
  );
}
