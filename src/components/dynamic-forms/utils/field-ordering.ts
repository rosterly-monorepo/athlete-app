/**
 * Utilities for ordering and grouping form fields based on x-ui-* hints.
 */

import type { FormSchema, FormSchemaProperty } from "@/types/form-schema";

/**
 * Get fields ordered by x-ui-order or x-ui-order array.
 * Falls back to original property order.
 */
export function getOrderedFields(schema: FormSchema): Array<[string, FormSchemaProperty]> {
  const entries = Object.entries(schema.properties).filter(([, prop]) => !prop["x-ui-hidden"]);

  // If schema has x-ui-order array at root level, use that
  if (schema["x-ui-order"] && schema["x-ui-order"].length > 0) {
    const orderMap = new Map(schema["x-ui-order"].map((key, index) => [key, index]));

    return entries.sort(([keyA], [keyB]) => {
      const orderA = orderMap.get(keyA) ?? 999;
      const orderB = orderMap.get(keyB) ?? 999;
      return orderA - orderB;
    });
  }

  // Otherwise, use x-ui-order on individual properties
  return entries.sort(([, propA], [, propB]) => {
    const orderA = propA["x-ui-order"] ?? 999;
    const orderB = propB["x-ui-order"] ?? 999;
    return orderA - orderB;
  });
}

/**
 * Get fields that aren't part of any group.
 * Useful for rendering ungrouped fields at the end.
 */
export function getUngroupedFields(schema: FormSchema): Array<[string, FormSchemaProperty]> {
  const groups = schema["x-ui-groups"] || [];
  const groupedFields = new Set(groups.flatMap((g) => g.fields));

  return getOrderedFields(schema).filter(([key]) => !groupedFields.has(key));
}

/**
 * Check if the schema has groups defined.
 */
export function hasGroups(schema: FormSchema): boolean {
  return (schema["x-ui-groups"]?.length ?? 0) > 0;
}
