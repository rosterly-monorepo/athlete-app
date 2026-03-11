"use client";

import { useUser } from "@clerk/nextjs";
import { useMyProfile } from "@/hooks/use-athlete";
import { useAllFormSchemas, useSaveProfileSection } from "@/hooks/use-form-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicForm, DynamicFormSkeleton } from "@/components/dynamic-forms";
import type { FormSchema } from "@/types/form-schema";

// Fallback schemas for when API is unavailable
// These mirror what the backend would provide via /api/v1/forms/sections/all
const FALLBACK_SCHEMAS: Record<string, FormSchema> = {
  athletics: {
    type: "object",
    title: "Athletics",
    properties: {
      sport: {
        type: "string",
        title: "Sport",
        "x-ui-widget": "select",
        "x-ui-options": [
          { value: "football", label: "Football" },
          { value: "basketball", label: "Basketball" },
          { value: "baseball", label: "Baseball" },
          { value: "soccer", label: "Soccer" },
          { value: "track_and_field", label: "Track & Field" },
          { value: "swimming", label: "Swimming" },
          { value: "volleyball", label: "Volleyball" },
          { value: "tennis", label: "Tennis" },
          { value: "golf", label: "Golf" },
          { value: "wrestling", label: "Wrestling" },
          { value: "lacrosse", label: "Lacrosse" },
          { value: "softball", label: "Softball" },
          { value: "other", label: "Other" },
        ],
        "x-ui-placeholder": "Select sport...",
      },
      position: {
        type: "string",
        title: "Position",
        "x-ui-widget": "text",
        "x-ui-placeholder": "e.g. Point Guard",
      },
      school: {
        type: "string",
        title: "School",
        "x-ui-widget": "text",
        "x-ui-placeholder": "e.g. University of Texas",
      },
      graduationYear: {
        type: "integer",
        title: "Graduation Year",
        "x-ui-widget": "select",
        "x-ui-options": [
          { value: "2025", label: "2025" },
          { value: "2026", label: "2026" },
          { value: "2027", label: "2027" },
          { value: "2028", label: "2028" },
          { value: "2029", label: "2029" },
          { value: "2030", label: "2030" },
        ],
        "x-ui-placeholder": "Select year...",
      },
    },
    "x-ui-order": ["sport", "position", "school", "graduationYear"],
  },
  physical: {
    type: "object",
    title: "Physical Stats",
    properties: {
      heightFeet: {
        type: "integer",
        title: "Height (ft)",
        "x-ui-widget": "number",
        "x-ui-validation": { min: 4, max: 7 },
      },
      heightInches: {
        type: "integer",
        title: "Height (in)",
        "x-ui-widget": "number",
        "x-ui-validation": { min: 0, max: 11 },
      },
      weight: {
        type: "number",
        title: "Weight (lbs)",
        "x-ui-widget": "number",
      },
    },
    "x-ui-order": ["heightFeet", "heightInches", "weight"],
  },
  about: {
    type: "object",
    title: "About You",
    properties: {
      bio: {
        type: "string",
        title: "Bio",
        "x-ui-widget": "textarea",
        "x-ui-placeholder": "Tell coaches and recruiters about yourself...",
        "x-ui-validation": { maxLength: 2000 },
      },
    },
  },
};

export default function ProfilePage() {
  const { user } = useUser();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  // Try to fetch schemas from API, fall back to hardcoded
  const { data: apiSchemas, isLoading: schemasLoading, isError } = useAllFormSchemas();
  const schemas = isError || !apiSchemas ? FALLBACK_SCHEMAS : apiSchemas;

  if (profileLoading || schemasLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Athlete Profile</h1>
      <p className="text-muted-foreground mb-8">
        This information will appear on your public athlete profile page.
      </p>

      <div className="space-y-6">
        {/* Clerk-managed identity section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={user?.fullName || ""}
              disabled
              className="border-input bg-muted w-full rounded-md border px-3 py-2 text-sm opacity-60"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Managed through your account settings.
            </p>
          </CardContent>
        </Card>

        {/* Dynamic sections from schemas */}
        {Object.entries(schemas).map(([sectionId, schema]) => (
          <ProfileSection
            key={sectionId}
            sectionId={sectionId}
            schema={schema}
            initialData={extractSectionData(
              sectionId,
              profile as Record<string, unknown> | undefined
            )}
          />
        ))}
      </div>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{schema.title || sectionId}</CardTitle>
      </CardHeader>
      <CardContent>
        <DynamicForm
          schema={schema}
          initialData={initialData}
          onSubmit={(data) => mutation.mutate(data)}
          isSubmitting={mutation.isPending}
          submitLabel={`Save ${schema.title || sectionId}`}
        />
      </CardContent>
    </Card>
  );
}

/**
 * Extract data for a specific section from the full profile.
 */
function extractSectionData(
  sectionId: string,
  profile?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!profile) return undefined;

  // Map section IDs to their field names
  const sectionFields: Record<string, string[]> = {
    athletics: ["sport", "position", "school", "graduationYear"],
    physical: ["heightFeet", "heightInches", "weight"],
    about: ["bio"],
  };

  const fields = sectionFields[sectionId];
  if (!fields) return undefined;

  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (profile[field] !== undefined) {
      data[field] = profile[field];
    }
  }
  return data;
}

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <DynamicFormSkeleton />
    </div>
  );
}
