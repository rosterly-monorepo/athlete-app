"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { AlertCircle, Check, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { jsonSchemaToZod, getDefaultValues } from "./utils/schema-to-zod";
import { getOrderedFields, getUngroupedFields, hasGroups } from "./utils/field-ordering";
import { useAutoSave } from "@/hooks/use-auto-save";
import type { AutoSaveStatus } from "@/hooks/use-auto-save";
import type { FormSchema, FormSchemaGroup } from "@/types/form-schema";

interface DynamicFormProps {
  /** The JSON Schema defining the form */
  schema: FormSchema;
  /** Initial values to populate the form */
  initialData?: Record<string, unknown>;
  /** Called when form is submitted with valid data (manual save) */
  onSubmit: (data: Record<string, unknown>) => void;
  /** Whether form is currently submitting (manual save) */
  isSubmitting?: boolean;
  /** Label for the submit button */
  submitLabel?: string;
  /** Show the form title from schema */
  showTitle?: boolean;
  /** Backend field-level validation errors. Keys are field names, values are messages. */
  serverErrors?: Record<string, string>;
  /** Form-level error message (not tied to a specific field). */
  formError?: string | null;
  /** Compact mode: lightweight group rendering without Card wrappers (for dialogs). */
  compact?: boolean;
  /** Enable debounced auto-save. Pass true for default (3s) or { delay: ms }. */
  autoSave?: boolean | { delay: number };
  /** Called with dirty field data on auto-save (should be a silent mutation). */
  onAutoSave?: (data: Record<string, unknown>) => void;
  /** Whether the auto-save mutation is in flight. */
  isAutoSaving?: boolean;
  /** Ref that will be populated with a flush function to trigger immediate save. */
  flushRef?: React.MutableRefObject<(() => void) | null>;
}

/**
 * Inline auto-save status indicator shown next to the save button.
 */
function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  if (status === "pending") {
    return (
      <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving...
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="text-muted-foreground animate-in fade-in flex items-center gap-1.5 text-sm">
        <Check className="h-3.5 w-3.5 text-emerald-500" />
        All changes saved
      </span>
    );
  }
  return null;
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
  compact = false,
  autoSave,
  onAutoSave,
  isAutoSaving = false,
  flushRef,
}: DynamicFormProps) {
  const zodSchema = jsonSchemaToZod(schema);
  const defaultValues = { ...getDefaultValues(schema), ...initialData };

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: "onBlur",
  });

  // Auto-save integration
  const autoSaveEnabled = !!autoSave && !!onAutoSave;
  const autoSaveDelay = typeof autoSave === "object" ? autoSave.delay : 3000;

  const { flush, status: autoSaveStatus } = useAutoSave({
    formMethods: methods,
    onSave: onAutoSave ?? (() => {}),
    delay: autoSaveDelay,
    enabled: autoSaveEnabled,
    isSaving: isAutoSaving || isSubmitting,
  });

  // Expose flush function to parent via ref
  useEffect(() => {
    if (flushRef) {
      flushRef.current = autoSaveEnabled ? flush : null;
    }
    return () => {
      if (flushRef) flushRef.current = null;
    };
  }, [flushRef, flush, autoSaveEnabled]);

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

  const submitButton = (
    <div className="flex items-center gap-3">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
      {autoSaveEnabled && <AutoSaveIndicator status={autoSaveStatus} />}
    </div>
  );

  if (useGroupedLayout && groups) {
    // Render grouped layout
    const renderGroupFields = (group: FormSchemaGroup) => {
      const visibleFields = group.fields.filter(
        (fk) => schema.properties[fk] && !schema.properties[fk]["x-ui-hidden"]
      );
      if (visibleFields.length === 0) return null;

      return (
        <div className={group.inline ? "flex gap-3" : "space-y-4"}>
          {visibleFields.map((fieldKey) => (
            <div key={fieldKey} className={group.inline ? "min-w-0 flex-1" : undefined}>
              <FormFieldRenderer
                fieldKey={fieldKey}
                property={schema.properties[fieldKey]}
                required={requiredFields.has(fieldKey)}
              />
            </div>
          ))}
        </div>
      );
    };

    return (
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className={compact ? "space-y-4" : "space-y-6"}
        >
          {showTitle && schema.title && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{schema.title}</h2>
              {schema.description && (
                <p className="text-muted-foreground text-sm">{schema.description}</p>
              )}
            </div>
          )}

          {errorBanner}

          {groups.map((group) => {
            const fields = renderGroupFields(group);
            if (!fields) return null;

            if (compact) {
              // Compact mode: lightweight divs, collapsible for collapsed groups
              if (group.collapsed) {
                return (
                  <Collapsible key={group.name}>
                    <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors [&[data-state=open]>svg]:rotate-90">
                      <ChevronRight className="h-4 w-4 transition-transform" />
                      {group.title || group.name}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">{fields}</CollapsibleContent>
                  </Collapsible>
                );
              }
              return (
                <div key={group.name}>
                  {group.title && (
                    <p className="text-muted-foreground mb-2 text-sm font-medium">{group.title}</p>
                  )}
                  {fields}
                </div>
              );
            }

            // Default mode: Card-wrapped groups
            return (
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
            );
          })}

          {/* Render any ungrouped fields */}
          {getUngroupedFields(schema).length > 0 &&
            (compact ? (
              <div className="space-y-4">
                {getUngroupedFields(schema).map(([fieldKey, property]) => (
                  <FormFieldRenderer
                    key={fieldKey}
                    fieldKey={fieldKey}
                    property={property}
                    required={requiredFields.has(fieldKey)}
                  />
                ))}
              </div>
            ) : (
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
            ))}

          {submitButton}
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

        {submitButton}
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
