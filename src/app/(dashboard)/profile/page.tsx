"use client";

import { useUser } from "@clerk/nextjs";
import { useMyProfile } from "@/hooks/use-athlete";
import { useAllFormSchemas, useSaveProfileSection } from "@/hooks/use-form-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicForm, DynamicFormSkeleton } from "@/components/dynamic-forms";
import type { FormSchema } from "@/types/form-schema";

export default function ProfilePage() {
  const { user } = useUser();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  const { data: schemas, isLoading: schemasLoading, isError } = useAllFormSchemas();

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
