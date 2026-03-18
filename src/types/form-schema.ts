/**
 * TypeScript interfaces for JSON Schema with x-ui-* extensions.
 * Used for dynamic form generation from backend-provided schemas.
 */

/** Widget types supported by the form renderer */
export type UIWidgetType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "email"
  | "tel"
  | "url"
  | "select"
  | "checkbox"
  | "country-select"
  | "state-select"
  | "language-select"
  | "image-upload"
  | "video-upload"
  | "document-upload"
  | "switch"
  | "time-input"
  | "duration"
  | "multi-select"
  | "ap-scores";

/** Option for select/dropdown fields */
export interface UIOption {
  value: string;
  label: string;
  category?: string; // For grouping options (e.g., track events by category)
}

/** Validation hints beyond standard JSON Schema */
export interface UIValidation {
  min?: number;
  max?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
}

/** Upload configuration for file upload widgets */
export interface UIUpload {
  accept: string; // e.g., "image/jpeg,image/png,image/webp"
  maxSizeMB: number;
}

/** Individual field property in a JSON Schema */
export interface FormSchemaProperty {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object";
  title?: string;
  description?: string;
  default?: unknown;
  enum?: string[];

  // x-ui-* extensions
  "x-ui-widget"?: UIWidgetType;
  "x-ui-options"?: UIOption[];
  "x-ui-order"?: number;
  "x-ui-validation"?: UIValidation;
  "x-ui-placeholder"?: string;
  "x-ui-disabled"?: boolean;
  "x-ui-hidden"?: boolean;
  "x-ui-upload"?: UIUpload;
  "x-ui-tooltip"?: string;
  "x-ui-depends-on"?: {
    field: string;
    options_key: string;
    default_category?: string;
  };

  // For array types
  items?: FormSchemaProperty;
}

/** Group of fields for visual layout */
export interface FormSchemaGroup {
  name: string;
  title?: string;
  description?: string;
  fields: string[];
  inline?: boolean;
}

/** Complete form schema with properties and UI hints */
export interface FormSchema {
  $schema?: string;
  type: "object";
  title?: string;
  description?: string;
  properties: Record<string, FormSchemaProperty>;
  required?: string[];

  // x-ui-* extensions at schema level
  "x-ui-groups"?: FormSchemaGroup[];
  "x-ui-order"?: string[];

  // Profile key — derived from the SQLModel __tablename__ on the backend.
  // Used to extract section data from the full profile response.
  "x-profile-key"?: string;

  // When set, this section should be rendered inside the named parent section
  // instead of as its own top-level tab.
  "x-ui-embedded-in"?: string;
}

/** Section metadata from /api/v1/forms/sections */
export interface FormSection {
  code: string;
  name: string;
  description?: string;
}

/** Response from /api/v1/forms/sections/{section} */
export interface FormSectionResponse {
  section: string;
  schema: FormSchema;
}

/** Response from /api/v1/forms/sections */
export interface FormSectionsResponse {
  sections: FormSection[];
}

/** Response from /api/v1/forms/sections/all */
export interface AllFormSchemasResponse {
  schemas: Record<string, FormSchema>;
}
