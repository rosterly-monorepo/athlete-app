import type { FormSchema } from "@/types/form-schema";

export interface SectionCompletion {
  /** Total number of required fields in this section */
  total: number;
  /** Number of required fields that have a value */
  filled: number;
  /** Whether all required fields are filled */
  done: boolean;
}

/**
 * Compute completion status for a single profile section.
 * A section with no required fields is always "done".
 */
export function getSectionCompletion(
  schema: FormSchema,
  data?: Record<string, unknown>
): SectionCompletion {
  const requiredFields = schema.required || [];
  const total = requiredFields.length;

  if (total === 0) return { total: 0, filled: 0, done: true };
  if (!data) return { total, filled: 0, done: false };

  const filled = requiredFields.filter((field) => {
    const value = data[field];
    return value !== null && value !== undefined && value !== "";
  }).length;

  return { total, filled, done: filled === total };
}

/**
 * Compute overall profile completion percentage across all sections.
 * Only counts sections that have required fields.
 */
export function getOverallCompletion(
  schemas: Record<string, FormSchema>,
  profile?: Record<string, unknown>,
  extractSectionData?: (
    schema: FormSchema,
    profile?: Record<string, unknown>
  ) => Record<string, unknown> | undefined
): number {
  let totalRequired = 0;
  let totalFilled = 0;

  for (const schema of Object.values(schemas)) {
    const data = extractSectionData?.(schema, profile);
    const completion = getSectionCompletion(schema, data);
    totalRequired += completion.total;
    totalFilled += completion.filled;
  }

  if (totalRequired === 0) return 100;
  return Math.round((totalFilled / totalRequired) * 100);
}

/**
 * Find the first incomplete section from an ordered list of schemas.
 * Returns the sectionId, or the first section if all are complete.
 */
export function getFirstIncompleteSection(
  schemas: Record<string, FormSchema>,
  profile?: Record<string, unknown>,
  extractSectionData?: (
    schema: FormSchema,
    profile?: Record<string, unknown>
  ) => Record<string, unknown> | undefined
): string | undefined {
  const entries = Object.entries(schemas);
  if (entries.length === 0) return undefined;

  for (const [sectionId, schema] of entries) {
    const data = extractSectionData?.(schema, profile);
    const completion = getSectionCompletion(schema, data);
    if (!completion.done) return sectionId;
  }

  return entries[0]?.[0];
}

/**
 * Find the first unfilled required field across all sections.
 * Returns { sectionId, fieldKey } or null if everything is complete.
 */
export function getFirstUnfilledField(
  schemas: Record<string, FormSchema>,
  profile?: Record<string, unknown>,
  extractSectionData?: (
    schema: FormSchema,
    profile?: Record<string, unknown>
  ) => Record<string, unknown> | undefined
): { sectionId: string; fieldKey: string } | null {
  for (const [sectionId, schema] of Object.entries(schemas)) {
    const requiredFields = schema.required || [];
    if (requiredFields.length === 0) continue;

    const data = extractSectionData?.(schema, profile);
    for (const fieldKey of requiredFields) {
      const value = data?.[fieldKey];
      if (value === null || value === undefined || value === "") {
        return { sectionId, fieldKey };
      }
    }
  }
  return null;
}
