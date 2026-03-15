"use client";

import { useEffect, useRef, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty, UIOption } from "@/types/form-schema";
import { ComboboxWidget } from "./ComboboxWidget";

interface DependentComboboxWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function DependentComboboxWidget({
  field,
  property,
  fieldKey,
  error,
  required,
}: DependentComboboxWidgetProps) {
  const { watch, setValue } = useFormContext();
  const dependsOn = property["x-ui-depends-on"];

  const parentValue = dependsOn ? watch(dependsOn.field) : undefined;
  const prevParentValue = useRef(parentValue);

  const allOptions = useMemo<UIOption[]>(() => property["x-ui-options"] || [], [property]);

  // Filter options based on parent field value
  const filteredProperty = useMemo(() => {
    if (!dependsOn || !parentValue) {
      // No parent selected — show all options
      return property;
    }

    const filtered = allOptions.filter(
      (opt) => opt[dependsOn.options_key as keyof UIOption] === parentValue
    );

    return {
      ...property,
      "x-ui-options": filtered,
    };
  }, [property, dependsOn, parentValue, allOptions]);

  // Clear this field when parent value changes and current selection is invalid
  useEffect(() => {
    if (!dependsOn) return;

    if (prevParentValue.current !== parentValue && field.value) {
      const stillValid = allOptions.some(
        (opt) =>
          opt.value === field.value && opt[dependsOn.options_key as keyof UIOption] === parentValue
      );
      if (!stillValid) {
        setValue(fieldKey, "");
      }
    }
    prevParentValue.current = parentValue;
  }, [parentValue, dependsOn, field.value, allOptions, fieldKey, setValue]);

  // If no dependency configured, just render as a regular combobox
  if (!dependsOn) {
    return (
      <ComboboxWidget
        field={field}
        property={property}
        fieldKey={fieldKey}
        error={error}
        required={required}
      />
    );
  }

  return (
    <ComboboxWidget
      field={field}
      property={filteredProperty}
      fieldKey={fieldKey}
      error={error}
      required={required}
    />
  );
}
