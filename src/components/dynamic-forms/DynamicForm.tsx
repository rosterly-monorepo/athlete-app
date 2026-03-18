"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { jsonSchemaToZod, getDefaultValues } from "./utils/schema-to-zod";
import { getOrderedFields, getUngroupedFields, hasGroups } from "./utils/field-ordering";
import type { FormSchema } from "@/types/form-schema";

interface DynamicFormProps {
  /** The JSON Schema defining the form */
  schema: FormSchema;
  /** Initial values to populate the form */
  initialData?: Record<string, unknown>;
  /** Called when form is submitted with valid data */
  onSubmit: (data: Record<string, unknown>) => void;
  /** Whether form is currently submitting */
  isSubmitting?: boolean;
  /** Label for the submit button */
  submitLabel?: string;
  /** Show the form title from schema */
  showTitle?: boolean;
  /** Backend field-level validation errors. Keys are field names, values are messages. */
  serverErrors?: Record<string, string>;
  /** Form-level error message (not tied to a specific field). */
  formError?: string | null;
}

/**
 * Main dynamic form component that renders a form from JSON Schema.
 * Supports grouped layout via x-ui-groups and field ordering via x-ui-order.
 */
export function DynamicForm({
  schema,
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  showTitle = false,
  serverErrors,
  formError,
}: DynamicFormProps) {
  const zodSchema = jsonSchemaToZod(schema);
  const defaultValues = { ...getDefaultValues(schema), ...initialData };

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: "onBlur",
  });

  // Reset form when initialData actually changes (not just reference).
  // keepDirtyValues preserves fields the user has touched while updating untouched fields.
  const prevDataRef = useRef<string | null>(null);
  useEffect(() => {
    if (!initialData) return;
    const serialized = JSON.stringify(initialData);
    if (serialized === prevDataRef.current) return;
    prevDataRef.current = serialized;
    methods.reset({ ...getDefaultValues(schema), ...initialData }, { keepDirtyValues: true });
  }, [initialData, methods, schema]);

  // Apply server-side field errors to the form
  const serverErrorFieldsRef = useRef<string[]>([]);
  useEffect(() => {
    // Clear previously applied server errors
    for (const field of serverErrorFieldsRef.current) {
      methods.clearErrors(field);
    }

    if (!serverErrors || Object.keys(serverErrors).length === 0) {
      serverErrorFieldsRef.current = [];
      return;
    }

    const fields = Object.keys(serverErrors);
    for (const [field, message] of Object.entries(serverErrors)) {
      methods.setError(field, { type: "server", message });
    }
    serverErrorFieldsRef.current = fields;
  }, [serverErrors, methods]);

  const handleSubmit = (data: Record<string, unknown>) => {
    const dirty = methods.formState.dirtyFields;
    const filtered: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      if ((dirty as Record<string, unknown>)[key]) {
        filtered[key] = data[key];
      }
    }
    onSubmit(filtered);
  };

  const groups = schema["x-ui-groups"];
  const useGroupedLayout = hasGroups(schema);
  const requiredFields = new Set(schema.required || []);

  const errorBanner = formError ? (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{formError}</AlertDescription>
    </Alert>
  ) : null;

  if (useGroupedLayout && groups) {
    // Render grouped layout
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
          {showTitle && schema.title && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{schema.title}</h2>
              {schema.description && (
                <p className="text-muted-foreground text-sm">{schema.description}</p>
              )}
            </div>
          )}

          {errorBanner}

          {groups.map((group) => (
            <Card key={group.name}>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">{group.title || group.name}</CardTitle>
                {group.description && <CardDescription>{group.description}</CardDescription>}
              </CardHeader>
              <CardContent className={group.inline ? "flex gap-4" : "space-y-4"}>
                {group.fields.map((fieldKey) => {
                  const property = schema.properties[fieldKey];
                  if (!property || property["x-ui-hidden"]) return null;
                  return (
                    <div key={fieldKey} className={group.inline ? "min-w-0 flex-1" : undefined}>
                      <FormFieldRenderer
                        fieldKey={fieldKey}
                        property={property}
                        required={requiredFields.has(fieldKey)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          {/* Render any ungrouped fields */}
          {getUngroupedFields(schema).length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Other</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getUngroupedFields(schema).map(([fieldKey, property]) => (
                  <FormFieldRenderer
                    key={fieldKey}
                    fieldKey={fieldKey}
                    property={property}
                    required={requiredFields.has(fieldKey)}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </form>
      </FormProvider>
    );
  }

  // Render flat layout with ordering
  const orderedFields = getOrderedFields(schema);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
        {showTitle && schema.title && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{schema.title}</h2>
            {schema.description && (
              <p className="text-muted-foreground text-sm">{schema.description}</p>
            )}
          </div>
        )}

        {errorBanner}

        {orderedFields.map(([fieldKey, property]) => (
          <FormFieldRenderer
            key={fieldKey}
            fieldKey={fieldKey}
            property={property}
            required={requiredFields.has(fieldKey)}
          />
        ))}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </form>
    </FormProvider>
  );
}

/**
 * Loading skeleton for DynamicForm.
 */
export function DynamicFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-10 w-24" />
    </div>
  );
}
