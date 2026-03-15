"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  UserCircle,
  MapPin,
  Phone,
  Users,
  GraduationCap,
  ClipboardCheck,
  Heart,
  PenLine,
  Globe,
  Activity,
} from "lucide-react";
import { useMyProfile } from "@/hooks/use-athlete";
import { useAllFormSchemas, useSaveProfileSection } from "@/hooks/use-form-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicForm, DynamicFormSkeleton } from "@/components/dynamic-forms";
import { LanguageCollection } from "@/components/forms/LanguageCollection";
import { Progress } from "@/components/ui/progress";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";
import {
  getSectionCompletion,
  getFirstIncompleteSection,
  getFirstUnfilledField,
  getOverallCompletion,
} from "@/lib/profile-completion";
import type { FormSchema } from "@/types/form-schema";
import type { LucideIcon } from "lucide-react";

const sectionIcons: Record<string, LucideIcon> = {
  personal_info: UserCircle,
  address: MapPin,
  contact: Phone,
  demographics: Users,
  education: GraduationCap,
  testing: ClipboardCheck,
  family: Heart,
  writing: PenLine,
  language: Globe,
  activity: Activity,
};

export default function ProfilePage() {
  const { setCollapsed } = useSidebar();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: schemas, isLoading: schemasLoading, isError } = useAllFormSchemas();

  // Auto-collapse the main sidebar when editing profile
  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
  }, [setCollapsed]);

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
    // Wait for content to render, then focus the field
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
    <div>
      {/* Header */}
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

      {resolvedTab && (
        <>
          {/* Mobile: horizontal scrollable section nav */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-2 md:hidden">
            {sectionEntries.map(([sectionId, schema]) => {
              const completion = getSectionCompletion(
                schema,
                extractSectionData(schema, profileData)
              );
              const isActive = resolvedTab === sectionId;
              return (
                <button
                  key={sectionId}
                  onClick={() => setActiveTab(sectionId)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {schema.title || sectionId}
                  {completion.total > 0 &&
                    (completion.done ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <span className="text-xs opacity-70">
                        {Math.round((completion.filled / completion.total) * 100)}%
                      </span>
                    ))}
                </button>
              );
            })}
          </div>

          {/* Desktop: side nav + form content */}
          <div className="hidden md:flex md:gap-6">
            {/* Section nav */}
            <nav className="sticky top-20 w-52 shrink-0 self-start">
              <div className="flex flex-col gap-0.5">
                {sectionEntries.map(([sectionId, schema]) => {
                  const completion = getSectionCompletion(
                    schema,
                    extractSectionData(schema, profileData)
                  );
                  const isActive = resolvedTab === sectionId;
                  const Icon = sectionIcons[sectionId];

                  return (
                    <button
                      key={sectionId}
                      onClick={() => setActiveTab(sectionId)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{schema.title || sectionId}</span>
                      {completion.total > 0 && (
                        <span className="ml-auto shrink-0">
                          {completion.done ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <span className="text-xs opacity-70">
                              {Math.round((completion.filled / completion.total) * 100)}%
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Form content */}
            <div className="max-w-2xl min-w-0 flex-1">
              {sectionEntries.map(([sectionId, schema]) =>
                resolvedTab === sectionId ? (
                  <ProfileSection
                    key={sectionId}
                    sectionId={sectionId}
                    schema={schema}
                    initialData={extractSectionData(schema, profileData)}
                  />
                ) : null
              )}
            </div>
          </div>

          {/* Mobile: form content */}
          <div className="md:hidden">
            {sectionEntries.map(([sectionId, schema]) =>
              resolvedTab === sectionId ? (
                <ProfileSection
                  key={sectionId}
                  sectionId={sectionId}
                  schema={schema}
                  initialData={extractSectionData(schema, profileData)}
                />
              ) : null
            )}
          </div>
        </>
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
  // Collection sections get their own dedicated components
  if (sectionId === "language") {
    return <LanguageCollection schema={schema} />;
  }

  return <StandardProfileSection sectionId={sectionId} schema={schema} initialData={initialData} />;
}

function StandardProfileSection({ sectionId, schema, initialData }: ProfileSectionProps) {
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
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
      <div className="mt-6 hidden md:flex md:gap-6">
        {/* Section nav skeleton */}
        <div className="flex w-52 shrink-0 flex-col gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
        {/* Form skeleton */}
        <div className="max-w-2xl min-w-0 flex-1">
          <DynamicFormSkeleton />
        </div>
      </div>
      {/* Mobile skeleton */}
      <div className="mt-6 md:hidden">
        <div className="mb-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-md" />
          ))}
        </div>
        <DynamicFormSkeleton />
      </div>
    </div>
  );
}
