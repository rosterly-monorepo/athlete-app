/**
 * Client-side field validation rules inferred from widget type + field name.
 *
 * Layer 2 of the client smart defaults: the server tells us the widget type
 * (e.g. "date") and the field name (e.g. "date_of_birth"), and we derive
 * common-sense validation constraints without the backend having to spell
 * them out explicitly.
 */

import type { ZodString, ZodTypeAny } from "zod";
import { parse, isValid, isBefore, differenceInYears, subYears } from "date-fns";
import type { FormSchemaProperty } from "@/types/form-schema";

interface FieldRule {
  /** Human-readable name for debugging/testing */
  name: string;
  /** Return true when this rule should apply */
  matches: (fieldKey: string, property: FormSchemaProperty) => boolean;
  /** Wrap/refine the Zod schema with additional constraints */
  refine: (schema: ZodTypeAny) => ZodTypeAny;
  /** Optional calendar bounds for date widgets */
  dateConstraints?: { fromDate?: Date; toDate?: Date };
}

function parseDate(val: string): Date | null {
  const parsed = parse(val, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : null;
}

const dateOfBirthRule: FieldRule = {
  name: "date-of-birth",
  matches: (key, prop) => key === "date_of_birth" && prop["x-ui-widget"] === "date",
  refine: (schema) => {
    return (schema as ZodString)
      .refine(
        (val) => {
          if (!val) return true;
          const d = parseDate(val);
          return d !== null && isBefore(d, new Date());
        },
        { message: "Date of birth must be in the past" }
      )
      .refine(
        (val) => {
          if (!val) return true;
          const d = parseDate(val);
          if (!d) return true; // let format check handle invalid dates
          return differenceInYears(new Date(), d) >= 13;
        },
        { message: "Athlete must be at least 13 years old" }
      )
      .refine(
        (val) => {
          if (!val) return true;
          const d = parseDate(val);
          if (!d) return true;
          return differenceInYears(new Date(), d) <= 25;
        },
        { message: "Please verify this date of birth" }
      );
  },
  dateConstraints: {
    fromDate: subYears(new Date(), 25),
    toDate: new Date(),
  },
};

const FIELD_RULES: FieldRule[] = [dateOfBirthRule];

/**
 * Apply all matching field validation rules to a Zod schema.
 * Called in schema-to-zod.ts after propertyToZod() and before .optional().
 */
export function applyFieldValidations(
  schema: ZodTypeAny,
  fieldKey: string,
  property: FormSchemaProperty
): ZodTypeAny {
  let result = schema;
  for (const rule of FIELD_RULES) {
    if (rule.matches(fieldKey, property)) {
      result = rule.refine(result);
    }
  }
  return result;
}

/**
 * Get calendar UI constraints (fromDate/toDate) for a date field.
 * Returns undefined if no rule matches — calendar will be unconstrained.
 */
export function getDateConstraints(
  fieldKey: string,
  property: FormSchemaProperty
): { fromDate?: Date; toDate?: Date } | undefined {
  for (const rule of FIELD_RULES) {
    if (rule.matches(fieldKey, property) && rule.dateConstraints) {
      return rule.dateConstraints;
    }
  }
  return undefined;
}

// Exported for testing
export { FIELD_RULES };
export type { FieldRule };
