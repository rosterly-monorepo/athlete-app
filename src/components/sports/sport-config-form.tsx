"use client";

import { DynamicForm, DynamicFormSkeleton } from "@/components/dynamic-forms";
import { useSportConfigSchema, useSportConfig, useSaveSportConfig } from "@/hooks/use-sports";

interface SportConfigFormProps {
  sportCode: string;
}

export function SportConfigForm({ sportCode }: SportConfigFormProps) {
  const { data: schema, isLoading: schemaLoading } = useSportConfigSchema(sportCode);
  const { data: config, isLoading: configLoading } = useSportConfig(sportCode);
  const saveMutation = useSaveSportConfig(sportCode);

  if (schemaLoading || configLoading) {
    return <DynamicFormSkeleton />;
  }

  if (!schema) {
    return (
      <p className="text-muted-foreground text-sm">
        No configuration form available for this sport.
      </p>
    );
  }

  return (
    <DynamicForm
      schema={schema}
      initialData={config}
      onSubmit={(data) => saveMutation.mutate(data)}
      isSubmitting={saveMutation.isPending}
      submitLabel="Save"
    />
  );
}
