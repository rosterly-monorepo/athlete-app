/**
 * Profile section completion — reads server-computed values from the profile response.
 *
 * The backend computes completion per-section using FormField(required=True) annotations
 * on the table models. Collection sections (languages, activities) use custom rules
 * defined via __form_completion__ on the model. The frontend just reads the numbers.
 */

export interface SectionCompletion {
  /** Total number of required fields/items in this section */
  total: number;
  /** Number of required fields/items that have a value */
  filled: number;
  /** Whether all required fields are filled */
  done: boolean;
}

/**
 * Read completion status for a single profile section from the profile response.
 * Sections not present in section_completion are treated as done (no requirements).
 */
export function getSectionCompletion(
  sectionId: string,
  profile?: Record<string, unknown>
): SectionCompletion {
  const completions = profile?.section_completion as
    | Record<string, { total: number; filled: number }>
    | undefined;
  const c = completions?.[sectionId];
  if (!c || c.total === 0) return { total: 0, filled: 0, done: true };
  return { total: c.total, filled: c.filled, done: c.filled >= c.total };
}

/**
 * Compute overall profile completion percentage across all sections.
 * Only counts sections that have required fields.
 */
export function getOverallCompletion(
  sectionIds: string[],
  profile?: Record<string, unknown>
): number {
  let totalRequired = 0;
  let totalFilled = 0;

  for (const id of sectionIds) {
    const c = getSectionCompletion(id, profile);
    totalRequired += c.total;
    totalFilled += c.filled;
  }

  if (totalRequired === 0) return 100;
  return Math.round((totalFilled / totalRequired) * 100);
}

/**
 * Find the first incomplete section from an ordered list of section IDs.
 * Returns the sectionId, or the first section if all are complete.
 */
export function getFirstIncompleteSection(
  sectionIds: string[],
  profile?: Record<string, unknown>
): string | undefined {
  if (sectionIds.length === 0) return undefined;

  for (const id of sectionIds) {
    const c = getSectionCompletion(id, profile);
    if (!c.done) return id;
  }

  return sectionIds[0];
}
