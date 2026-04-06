"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  UserCircle,
  MapPin,
  Phone,
  Users,
  GraduationCap,
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
import { toast } from "sonner";
import { DynamicForm, DynamicFormSkeleton } from "@/components/dynamic-forms";
import { AcademicUploadHero } from "@/components/dynamic-forms/AcademicUploadHero";
import { ActivityCollection } from "@/components/forms/ActivityCollection";
import { LanguageCollection } from "@/components/forms/LanguageCollection";
import { useExtractionPolling } from "@/hooks/use-extraction-polling";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";
import {
  getSectionCompletion,
  getFirstIncompleteSection,
  getOverallCompletion,
} from "@/lib/profile-completion";
import type { FormSchema } from "@/types/form-schema";
import { ApiClientError } from "@/services/api-client";
import type { LucideIcon } from "lucide-react";

const sectionIcons: Record<string, LucideIcon> = {
  personal_info: UserCircle,
  address: MapPin,
  contact: Phone,
  demographics: Users,
  academics: GraduationCap,
  family: Heart,
  writing: PenLine,
  college_preferences: GraduationCap,
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

  const allSchemaEntries = Object.entries(schemas ?? {});
  const embeddedSchemas = Object.fromEntries(
    allSchemaEntries.filter(([, schema]) => schema["x-ui-embedded-in"])
  );
  const sectionEntries = allSchemaEntries.filter(([, schema]) => !schema["x-ui-embedded-in"]);
  const sectionIds = sectionEntries.map(([id]) => id);
  const profileData = profile as Record<string, unknown> | undefined;

  const initialSection = schemas
    ? getFirstIncompleteSection(sectionIds, profileData) || sectionEntries[0]?.[0]
    : undefined;
  const [activeTab, setActiveTab] = useState<string | undefined>(initialSection);

  // Keep activeTab in sync when data loads for the first time
  const resolvedTab = activeTab || initialSection;

  // Ref for flushing auto-save when switching sections
  const flushRef = useRef<(() => void) | null>(null);

  const handleTabChange = useCallback((newTab: string) => {
    // Flush any pending auto-save from the current section before switching
    flushRef.current?.();
    setActiveTab(newTab);
  }, []);

  const nextIncompleteSection = schemas
    ? getFirstIncompleteSection(sectionIds, profileData)
    : undefined;
  // Only show "Continue" when there's an incomplete section that isn't the current one
  const showContinue = nextIncompleteSection && nextIncompleteSection !== resolvedTab;

  const handleContinue = () => {
    if (!nextIncompleteSection) return;
    flushRef.current?.();
    setActiveTab(nextIncompleteSection);
  };

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

  const overallPct = getOverallCompletion(sectionIds, profileData);

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
        {showContinue && (
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
              const completion = getSectionCompletion(sectionId, profileData);
              const isActive = resolvedTab === sectionId;
              return (
                <button
                  key={sectionId}
                  onClick={() => handleTabChange(sectionId)}
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
                  const completion = getSectionCompletion(sectionId, profileData);
                  const isActive = resolvedTab === sectionId;
                  const Icon = sectionIcons[sectionId];

                  return (
                    <button
                      key={sectionId}
                      onClick={() => handleTabChange(sectionId)}
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
                    embeddedSchemas={embeddedSchemas}
                    flushRef={flushRef}
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
                  embeddedSchemas={embeddedSchemas}
                  flushRef={flushRef}
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
  embeddedSchemas?: Record<string, FormSchema>;
  flushRef?: React.MutableRefObject<(() => void) | null>;
}

function ProfileSection({
  sectionId,
  schema,
  initialData,
  embeddedSchemas,
  flushRef,
}: ProfileSectionProps) {
  // Collection sections get their own dedicated components
  if (sectionId === "language") {
    return <LanguageCollection schema={schema} />;
  }
  if (sectionId === "activity") {
    return <ActivityCollection schema={schema} />;
  }

  // Sections with embedded sub-sections (e.g., address + alternate address)
  const embedded = Object.entries(embeddedSchemas ?? {}).filter(
    ([, s]) => s["x-ui-embedded-in"] === sectionId
  );
  if (embedded.length > 0) {
    return (
      <SectionWithEmbedded
        sectionId={sectionId}
        schema={schema}
        initialData={initialData}
        embeddedSections={embedded}
        flushRef={flushRef}
      />
    );
  }

  if (sectionId === "academics") {
    return (
      <AcademicsProfileSection
        sectionId={sectionId}
        schema={schema}
        initialData={initialData}
        flushRef={flushRef}
      />
    );
  }

  return (
    <StandardProfileSection
      sectionId={sectionId}
      schema={schema}
      initialData={initialData}
      flushRef={flushRef}
    />
  );
}

interface SectionWithEmbeddedProps {
  sectionId: string;
  schema: FormSchema;
  initialData?: Record<string, unknown>;
  embeddedSections: [string, FormSchema][];
  flushRef?: React.MutableRefObject<(() => void) | null>;
}

function SectionWithEmbedded({
  sectionId,
  schema,
  initialData,
  embeddedSections,
  flushRef,
}: SectionWithEmbeddedProps) {
  const mutation = useSaveProfileSection(sectionId, {
    successMessage: `${schema.title || sectionId} saved`,
  });
  const autoSaveMutation = useSaveProfileSection(sectionId, {
    silent: true,
  });

  const { fieldErrors, formError } = useMemo(() => {
    // Show errors from whichever mutation errored most recently
    const err = mutation.error || autoSaveMutation.error;
    if (!err || !(err instanceof ApiClientError)) {
      return { fieldErrors: {} as Record<string, string>, formError: null as string | null };
    }
    return { fieldErrors: err.fieldErrors, formError: err.userMessage };
  }, [mutation.error, autoSaveMutation.error]);

  const { data: profile } = useMyProfile();
  const profileData = profile as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <DynamicForm
        schema={schema}
        initialData={initialData}
        onSubmit={(data) => mutation.mutate(data)}
        isSubmitting={mutation.isPending}
        submitLabel={`Save ${schema.title || sectionId}`}
        serverErrors={Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined}
        formError={mutation.error ? formError : null}
        autoSave
        onAutoSave={(data) => autoSaveMutation.mutate(data)}
        isAutoSaving={autoSaveMutation.isPending}
        flushRef={flushRef}
        sectionId={sectionId}
      />

      {embeddedSections.map(([embeddedId, embeddedSchema]) => (
        <EmbeddedCollapsibleSection
          key={embeddedId}
          sectionId={embeddedId}
          schema={embeddedSchema}
          initialData={extractSectionData(embeddedSchema, profileData)}
        />
      ))}
    </div>
  );
}

function EmbeddedCollapsibleSection({
  sectionId,
  schema,
  initialData,
}: {
  sectionId: string;
  schema: FormSchema;
  initialData?: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const mutation = useSaveProfileSection(sectionId, {
    successMessage: `${schema.title || sectionId} saved`,
  });
  const autoSaveMutation = useSaveProfileSection(sectionId, {
    silent: true,
  });

  const { fieldErrors, formError } = useMemo(() => {
    const err = mutation.error || autoSaveMutation.error;
    if (!err || !(err instanceof ApiClientError)) {
      return { fieldErrors: {} as Record<string, string>, formError: null as string | null };
    }
    return { fieldErrors: err.fieldErrors, formError: err.userMessage };
  }, [mutation.error, autoSaveMutation.error]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex w-full items-center justify-between px-0">
          <span className="text-sm font-medium">{schema.title || sectionId}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2">
          <DynamicForm
            schema={schema}
            initialData={initialData}
            onSubmit={(data) => mutation.mutate(data)}
            isSubmitting={mutation.isPending}
            submitLabel={`Save ${schema.title || sectionId}`}
            serverErrors={Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined}
            formError={mutation.error ? formError : null}
            autoSave
            onAutoSave={(data) => autoSaveMutation.mutate(data)}
            isAutoSaving={autoSaveMutation.isPending}
            sectionId={sectionId}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function StandardProfileSection({ sectionId, schema, initialData, flushRef }: ProfileSectionProps) {
  const mutation = useSaveProfileSection(sectionId, {
    successMessage: `${schema.title || sectionId} saved`,
  });
  const autoSaveMutation = useSaveProfileSection(sectionId, {
    silent: true,
  });

  const { fieldErrors, formError } = useMemo(() => {
    const err = mutation.error || autoSaveMutation.error;
    if (!err || !(err instanceof ApiClientError)) {
      return { fieldErrors: {} as Record<string, string>, formError: null as string | null };
    }
    return { fieldErrors: err.fieldErrors, formError: err.userMessage };
  }, [mutation.error, autoSaveMutation.error]);

  return (
    <DynamicForm
      schema={schema}
      initialData={initialData}
      onSubmit={(data) => mutation.mutate(data)}
      isSubmitting={mutation.isPending}
      submitLabel={`Save ${schema.title || sectionId}`}
      serverErrors={Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined}
      formError={mutation.error ? formError : null}
      autoSave
      onAutoSave={(data) => autoSaveMutation.mutate(data)}
      isAutoSaving={autoSaveMutation.isPending}
      flushRef={flushRef}
      sectionId={sectionId}
    />
  );
}

function AcademicsProfileSection({
  sectionId,
  schema,
  initialData,
  flushRef,
}: Omit<ProfileSectionProps, "embeddedSchemas">) {
  const mutation = useSaveProfileSection(sectionId, {
    successMessage: `${schema.title || sectionId} saved`,
  });
  const autoSaveMutation = useSaveProfileSection(sectionId, {
    silent: true,
  });

  const { fieldErrors, formError } = useMemo(() => {
    const err = mutation.error || autoSaveMutation.error;
    if (!err || !(err instanceof ApiClientError)) {
      return { fieldErrors: {} as Record<string, string>, formError: null as string | null };
    }
    return { fieldErrors: err.fieldErrors, formError: err.userMessage };
  }, [mutation.error, autoSaveMutation.error]);

  // ── Extraction orchestration ──
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());

  const {
    status: pollStatus,
    extractedFields,
    extractionError,
  } = useExtractionPolling({
    enabled: pollingEnabled,
    profileKey: "academics",
  });

  // React to extraction polling status changes
  useEffect(() => {
    if (pollStatus === "complete" && extractedFields.length > 0) {
      const handleComplete = () => {
        setHighlightedFields(new Set(extractedFields));
        setPollingEnabled(false);
        toast.success("Successfully extracted data from your document");
      };
      handleComplete();
      const timer = setTimeout(() => setHighlightedFields(new Set()), 3000);
      return () => clearTimeout(timer);
    }
    if (pollStatus === "failed") {
      const handleFailed = () => {
        setPollingEnabled(false);
        toast.error(extractionError || "Document extraction failed");
      };
      handleFailed();
    }
    if (pollStatus === "empty") {
      const handleEmpty = () => setPollingEnabled(false);
      handleEmpty();
    }
  }, [pollStatus, extractedFields, extractionError]);

  const handleExtractionStart = useCallback(() => {
    setPollingEnabled(true);
  }, []);

  const heroElement = (
    <AcademicUploadHero
      initialData={initialData}
      onExtractionStart={handleExtractionStart}
      extractionStatus={pollStatus}
      extractedFields={extractedFields}
      extractionError={extractionError}
    />
  );

  return (
    <DynamicForm
      schema={schema}
      initialData={initialData}
      heroElement={heroElement}
      highlightedFields={highlightedFields}
      onSubmit={(data) => mutation.mutate(data)}
      isSubmitting={mutation.isPending}
      submitLabel={`Save ${schema.title || sectionId}`}
      serverErrors={Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined}
      formError={mutation.error ? formError : null}
      autoSave
      onAutoSave={(data) => autoSaveMutation.mutate(data)}
      isAutoSaving={autoSaveMutation.isPending}
      flushRef={flushRef}
      sectionId={sectionId}
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
