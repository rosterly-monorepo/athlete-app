"use client";

import { useCallback, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useMyProfile } from "@/hooks/use-athlete";
import { useAllFormSchemas, useSaveProfileSection } from "@/hooks/use-form-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicForm, DynamicFormSkeleton } from "@/components/dynamic-forms";
import { Progress } from "@/components/ui/progress";
import {
  getSectionCompletion,
  getFirstIncompleteSection,
  getFirstUnfilledField,
  getOverallCompletion,
} from "@/lib/profile-completion";
import type { FormSchema } from "@/types/form-schema";

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: schemas, isLoading: schemasLoading, isError } = useAllFormSchemas();

  const sectionEntries = Object.entries(schemas ?? {});
  const profileData = profile as Record<string, unknown> | undefined;

  const initialSection = schemas
    ? getFirstIncompleteSection(schemas, profileData, extractSectionData) || sectionEntries[0]?.[0]
    : undefined;
  const [activeTab, setActiveTab] = useState<string | undefined>(initialSection);

  // Keep activeTab in sync when data loads for the first time
  const resolvedTab = activeTab || initialSection;

  const nextUnfilled = schemas
    ? getFirstUnfilledField(schemas, profileData, extractSectionData)
    : null;

  const handleContinue = useCallback(() => {
    if (!nextUnfilled) return;
    setActiveTab(nextUnfilled.sectionId);
    // Wait for tab content to render, then focus the field
    requestAnimationFrame(() => {
      const el = document.getElementById(nextUnfilled.fieldKey);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    });
  }, [nextUnfilled]);

  if (profileLoading || schemasLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !schemas) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">Athlete Profile</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Something went wrong loading your profile. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallPct = getOverallCompletion(schemas, profileData, extractSectionData);

  return (
    <div className="max-w-2xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Athlete Profile</h1>
        <span className="text-sm font-medium">{overallPct}% complete</span>
      </div>
      <Progress value={overallPct} className="mb-2 h-2" />
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          This information will appear on your public athlete profile page.
        </p>
        {nextUnfilled && (
          <Button size="sm" className="ml-4 shrink-0 gap-1.5" onClick={handleContinue}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tabbed profile sections */}
      {resolvedTab && (
        <Tabs value={resolvedTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="!h-auto w-full flex-wrap justify-start gap-y-1 pb-2">
            {sectionEntries.map(([sectionId, schema]) => {
              const completion = getSectionCompletion(
                schema,
                extractSectionData(schema, profileData)
              );
              return (
                <TabsTrigger key={sectionId} value={sectionId} className="gap-1.5">
                  {schema.title || sectionId}
                  {completion.total > 0 &&
                    (completion.done ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {Math.round((completion.filled / completion.total) * 100)}%
                      </span>
                    ))}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="mt-4">
            {sectionEntries.map(([sectionId, schema]) => (
              <TabsContent key={sectionId} value={sectionId}>
                <ProfileSection
                  sectionId={sectionId}
                  schema={schema}
                  initialData={extractSectionData(schema, profileData)}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}
    </div>
  );
}

interface ProfileSectionProps {
  sectionId: string;
  schema: FormSchema;
  initialData?: Record<string, unknown>;
}

function ProfileSection({ sectionId, schema, initialData }: ProfileSectionProps) {
  const mutation = useSaveProfileSection(sectionId, {
    successMessage: `${schema.title || sectionId} saved`,
  });

  return (
    <DynamicForm
      schema={schema}
      initialData={initialData}
      onSubmit={(data) => mutation.mutate(data)}
      isSubmitting={mutation.isPending}
      submitLabel={`Save ${schema.title || sectionId}`}
    />
  );
}

/**
 * Extract data for a specific section from the full profile.
 * Uses x-profile-key from the schema (derived from the SQLModel __tablename__)
 * so the mapping stays in sync with the backend models automatically.
 */
function extractSectionData(
  schema: FormSchema,
  profile?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!profile) return undefined;

  const key = schema["x-profile-key"];
  if (!key) return undefined;

  const section = profile[key];
  if (!section || typeof section !== "object") return undefined;

  return section as Record<string, unknown>;
}

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <Skeleton className="mt-6 h-24 w-full rounded-xl" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>
      <div className="mt-4">
        <DynamicFormSkeleton />
      </div>
    </div>
  );
}
