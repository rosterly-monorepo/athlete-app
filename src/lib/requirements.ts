import { formatErgTime, formatHeight } from "@/lib/format";
import type {
  AthleteSearchHit,
  MetricDirection,
  ProgramMinimum,
  ProgramRequirements,
  SearchFilterSchema,
} from "@/services/types";

export type MatchStatus = "met" | "missed" | "unknown";

export interface MatchResult {
  field_name: string;
  label: string;
  min_value: number;
  athlete_value: number | null;
  status: MatchStatus;
  display_format?: string | null;
  unit?: string | null;
  direction: MetricDirection;
}

const ACADEMIC_DIRECTION: Record<string, MetricDirection> = {
  gpa_unweighted: "higher_is_better",
  gpa_weighted: "higher_is_better",
  academic_index: "higher_is_better",
  sat_total: "higher_is_better",
  act_composite: "higher_is_better",
};

function resolveDirection(
  field_name: string,
  schema: SearchFilterSchema | undefined
): MetricDirection {
  if (schema?.direction) return schema.direction;
  return ACADEMIC_DIRECTION[field_name] ?? "higher_is_better";
}

function getNumericHitValue(hit: AthleteSearchHit, field: string): number | null {
  const raw = (hit as unknown as Record<string, unknown>)[field];
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

function meetsMinimum(
  athlete_value: number,
  min_value: number,
  direction: MetricDirection
): boolean {
  return direction === "lower_is_better" ? athlete_value <= min_value : athlete_value >= min_value;
}

export function evaluateRequirements(
  hit: AthleteSearchHit,
  requirements: ProgramRequirements | null | undefined,
  schemas: SearchFilterSchema[]
): MatchResult[] {
  if (!requirements?.minimums?.length) return [];
  const schemaByField = new Map(schemas.map((s) => [s.field, s]));

  return requirements.minimums.map<MatchResult>((m) => {
    const schema = schemaByField.get(m.field_name);
    const direction = resolveDirection(m.field_name, schema);
    const athlete_value = getNumericHitValue(hit, m.field_name);
    const status: MatchStatus =
      athlete_value === null
        ? "unknown"
        : meetsMinimum(athlete_value, m.min_value, direction)
          ? "met"
          : "missed";

    return {
      field_name: m.field_name,
      label: schema?.label ?? shortLabelFor(m.field_name),
      min_value: m.min_value,
      athlete_value,
      status,
      display_format: schema?.display_format ?? null,
      unit: schema?.unit ?? null,
      direction,
    };
  });
}

export function shortLabelFor(field_name: string): string {
  switch (field_name) {
    case "gpa_unweighted":
      return "GPA";
    case "gpa_weighted":
      return "Weighted GPA";
    case "academic_index":
      return "RAI";
    case "sat_total":
      return "SAT";
    case "act_composite":
      return "ACT";
    default:
      return field_name;
  }
}

/** Format a numeric value using the same display_format dispatcher used by the range filter. */
export function formatRequirementValue(
  value: number,
  display_format: string | null | undefined,
  unit: string | null | undefined
): string {
  if (display_format === "rowing_time" || display_format === "track_time") {
    return formatErgTime(value);
  }
  if (display_format === "height_inches") {
    return formatHeight(value);
  }
  // Whole-number integers render bare; decimals keep up to 2 places.
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Seed range-filter values from program requirements.
 * URL-derived values take precedence — we only fill fields that aren't already set.
 */
export function seedFiltersFromRequirements(
  schemas: SearchFilterSchema[],
  requirements: ProgramRequirements | null | undefined,
  existing: Record<string, unknown>
): Record<string, unknown> {
  if (!requirements?.minimums?.length) return existing;
  const schemaByField = new Map(schemas.map((s) => [s.field, s]));
  const next: Record<string, unknown> = { ...existing };

  for (const m of requirements.minimums) {
    if (next[m.field_name] !== undefined) continue; // URL wins
    const schema = schemaByField.get(m.field_name);
    if (!schema || schema.filter_type !== "range") continue;

    const direction = resolveDirection(m.field_name, schema);
    const min = schema.min ?? 0;
    const max = schema.max ?? m.min_value;
    next[m.field_name] = direction === "lower_is_better" ? [min, m.min_value] : [m.min_value, max];
  }

  return next;
}

/** Look up a specific minimum by field name — handy for summary UIs like the dashboard. */
export function findMinimum(
  requirements: ProgramRequirements | null | undefined,
  field_name: string
): ProgramMinimum | undefined {
  return requirements?.minimums.find((m) => m.field_name === field_name);
}
