import { describe, it, expect } from "vitest";
import { format, subYears } from "date-fns";
import type { FormSchemaProperty } from "@/types/form-schema";
import { applyFieldValidations, getDateConstraints, FIELD_RULES } from "./field-validations";
import { z } from "zod";

const dateProperty: FormSchemaProperty = {
  type: "string",
  title: "Date of Birth",
  "x-ui-widget": "date",
};

const otherDateProperty: FormSchemaProperty = {
  type: "string",
  title: "SAT Date",
  "x-ui-widget": "date",
};

describe("date-of-birth rule", () => {
  const rule = FIELD_RULES.find((r) => r.name === "date-of-birth")!;

  it("matches date_of_birth field with date widget", () => {
    expect(rule.matches("date_of_birth", dateProperty)).toBe(true);
  });

  it("does not match other date fields", () => {
    expect(rule.matches("sat_date", otherDateProperty)).toBe(false);
    expect(rule.matches("start_date", otherDateProperty)).toBe(false);
  });

  it("does not match date_of_birth with wrong widget", () => {
    const textProp: FormSchemaProperty = { type: "string", "x-ui-widget": "text" };
    expect(rule.matches("date_of_birth", textProp)).toBe(false);
  });
});

describe("applyFieldValidations", () => {
  function validate(fieldKey: string, property: FormSchemaProperty, value: string) {
    const base = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");
    const refined = applyFieldValidations(base, fieldKey, property);
    return refined.safeParse(value);
  }

  it("rejects future dates for date_of_birth", () => {
    const future = format(new Date(Date.now() + 86400000 * 30), "yyyy-MM-dd");
    const result = validate("date_of_birth", dateProperty, future);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Date of birth must be in the past");
    }
  });

  it("rejects age under 13", () => {
    const tooYoung = format(subYears(new Date(), 10), "yyyy-MM-dd");
    const result = validate("date_of_birth", dateProperty, tooYoung);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Athlete must be at least 13 years old");
    }
  });

  it("rejects age over 25", () => {
    const tooOld = format(subYears(new Date(), 30), "yyyy-MM-dd");
    const result = validate("date_of_birth", dateProperty, tooOld);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please verify this date of birth");
    }
  });

  it("accepts valid age (13-25)", () => {
    const valid = format(subYears(new Date(), 16), "yyyy-MM-dd");
    const result = validate("date_of_birth", dateProperty, valid);
    expect(result.success).toBe(true);
  });

  it("passes empty string through (optional field handling)", () => {
    const base = z.string();
    const refined = applyFieldValidations(base, "date_of_birth", dateProperty);
    const result = refined.safeParse("");
    expect(result.success).toBe(true);
  });

  it("does not apply date_of_birth rules to other date fields", () => {
    const future = format(new Date(Date.now() + 86400000 * 30), "yyyy-MM-dd");
    const result = validate("sat_date", otherDateProperty, future);
    expect(result.success).toBe(true);
  });
});

const telProperty: FormSchemaProperty = {
  type: "string",
  title: "Phone Number",
  "x-ui-widget": "tel",
};

describe("phone-number rule", () => {
  const rule = FIELD_RULES.find((r) => r.name === "phone-number")!;

  it("matches any field with tel widget", () => {
    expect(rule.matches("phone_primary", telProperty)).toBe(true);
    expect(rule.matches("phone_secondary", telProperty)).toBe(true);
  });

  it("does not match non-tel widgets", () => {
    const textProp: FormSchemaProperty = { type: "string", "x-ui-widget": "text" };
    expect(rule.matches("phone_primary", textProp)).toBe(false);
  });

  function validatePhone(value: string) {
    const base = z.string();
    const refined = applyFieldValidations(base, "phone_primary", telProperty);
    return refined.safeParse(value);
  }

  it("accepts standard US format (555) 123-4567", () => {
    expect(validatePhone("(555) 123-4567").success).toBe(true);
  });

  it("accepts digits only", () => {
    expect(validatePhone("5551234567").success).toBe(true);
  });

  it("accepts international format +1 555 123 4567", () => {
    expect(validatePhone("+1 555 123 4567").success).toBe(true);
  });

  it("rejects too few digits", () => {
    const result = validatePhone("555-1234");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please enter a valid phone number");
    }
  });

  it("rejects non-numeric input", () => {
    expect(validatePhone("not-a-phone").success).toBe(false);
  });

  it("passes empty string through (optional field handling)", () => {
    expect(validatePhone("").success).toBe(true);
  });
});

describe("getDateConstraints", () => {
  it("returns constraints for date_of_birth", () => {
    const constraints = getDateConstraints("date_of_birth", dateProperty);
    expect(constraints).toBeDefined();
    expect(constraints!.fromDate).toBeInstanceOf(Date);
    expect(constraints!.toDate).toBeInstanceOf(Date);
    expect(constraints!.toDate!.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("returns undefined for unrecognized fields", () => {
    expect(getDateConstraints("sat_date", otherDateProperty)).toBeUndefined();
    expect(getDateConstraints("some_field", { type: "string" })).toBeUndefined();
  });
});
