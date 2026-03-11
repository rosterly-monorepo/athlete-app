/**
 * Converts JSON Schema with x-ui-validation hints to Zod validators.
 * Enables client-side validation matching backend schema constraints.
 */

import type { ZodTypeAny } from "zod";
import { z } from "zod";
import type { FormSchema, FormSchemaProperty } from "@/types/form-schema";

/**
 * Convert a full JSON Schema to a Zod object schema.
 */
export function jsonSchemaToZod(schema: FormSchema): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};
  const requiredFields = new Set(schema.required || []);

  for (const [key, prop] of Object.entries(schema.properties)) {
    // Skip hidden fields
    if (prop["x-ui-hidden"]) continue;

    let zodType = propertyToZod(prop);

    // Apply required/optional based on schema.required or x-ui-validation.required
    const isRequired = requiredFields.has(key) || prop["x-ui-validation"]?.required;

    if (!isRequired) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  return z.object(shape);
}

/**
 * Convert a single property to a Zod type.
 */
function propertyToZod(prop: FormSchemaProperty): ZodTypeAny {
  const validation = prop["x-ui-validation"] || {};

  switch (prop.type) {
    case "string":
      return stringPropertyToZod(prop, validation);

    case "number":
    case "integer":
      return numberPropertyToZod(prop, validation);

    case "boolean":
      return z.boolean();

    case "array":
      // For multi-select arrays of strings
      return z.array(z.string());

    default:
      return z.unknown();
  }
}

/**
 * Convert a string property with validation to Zod.
 */
function stringPropertyToZod(
  prop: FormSchemaProperty,
  validation: NonNullable<FormSchemaProperty["x-ui-validation"]>
): z.ZodString {
  let schema = z.string();

  // Apply max length
  if (validation.maxLength) {
    schema = schema.max(validation.maxLength, `Maximum ${validation.maxLength} characters`);
  }

  // Apply min length
  if (validation.minLength) {
    schema = schema.min(validation.minLength, `Minimum ${validation.minLength} characters`);
  }

  // Apply pattern
  if (validation.pattern) {
    schema = schema.regex(new RegExp(validation.pattern), "Invalid format");
  }

  // Widget-specific validation
  const widget = prop["x-ui-widget"];
  if (widget === "email") {
    schema = schema.email("Invalid email address");
  } else if (widget === "url") {
    schema = schema.url("Invalid URL");
  } else if (widget === "date") {
    schema = schema.regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");
  } else if (
    widget === "image-upload" ||
    widget === "video-upload" ||
    widget === "document-upload"
  ) {
    // Upload fields store CDN URLs - must be a valid URL when present
    // Empty string or null is allowed for optional uploads
    return z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().url("Invalid file URL").optional()
    ) as unknown as z.ZodString;
  }

  return schema;
}

/**
 * Convert a number property with validation to Zod.
 */
function numberPropertyToZod(
  prop: FormSchemaProperty,
  validation: NonNullable<FormSchemaProperty["x-ui-validation"]>
): ZodTypeAny {
  let schema = z.number();

  // Apply min value
  if (validation.min !== undefined) {
    schema = schema.min(validation.min, `Minimum value is ${validation.min}`);
  }

  // Apply max value
  if (validation.max !== undefined) {
    schema = schema.max(validation.max, `Maximum value is ${validation.max}`);
  }

  // Integer validation
  if (prop.type === "integer") {
    schema = schema.int("Must be a whole number");
  }

  // Numbers are often optional, so we need to handle empty strings from inputs
  // Use a transform to coerce empty values
  return z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    if (typeof val === "string") return parseFloat(val);
    return val;
  }, schema.optional().or(z.undefined()));
}

/**
 * Generate default values from a schema.
 * Returns an object with type-appropriate default values for each field.
 */
export function getDefaultValues(schema: FormSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const [key, prop] of Object.entries(schema.properties)) {
    // Skip hidden fields
    if (prop["x-ui-hidden"]) continue;

    // Use explicit default if provided
    if (prop.default !== undefined) {
      defaults[key] = prop.default;
      continue;
    }

    // Set type-appropriate defaults
    switch (prop.type) {
      case "string":
        defaults[key] = "";
        break;
      case "number":
      case "integer":
        defaults[key] = undefined;
        break;
      case "boolean":
        defaults[key] = false;
        break;
      case "array":
        defaults[key] = [];
        break;
      default:
        defaults[key] = undefined;
    }
  }

  return defaults;
}
