# Dynamic Forms System

This document explains how the JSON Schema-driven form system works in the Next.js frontend.

## Overview

Forms are generated dynamically from JSON Schema definitions provided by the backend API. The schema includes custom `x-ui-*` extension properties that control how fields are rendered, validated, and organized.

**Key benefits:**

- Single source of truth for form structure (backend owns the schema)
- Automatic client-side validation matching server constraints
- Consistent UI through widget mapping to shadcn/ui components

## Architecture

```
src/
├── types/
│   └── form-schema.ts              # TypeScript interfaces
├── services/
│   └── forms.ts                    # API client for schema endpoints
├── hooks/
│   └── use-form-schema.ts          # React Query hooks
└── components/
    └── dynamic-forms/
        ├── index.ts                # Public exports
        ├── DynamicForm.tsx         # Main component
        ├── FormFieldRenderer.tsx   # Maps widgets to components
        ├── utils/
        │   ├── schema-to-zod.ts    # JSON Schema → Zod conversion
        │   └── field-ordering.ts   # Field ordering logic
        └── widgets/                # Individual field components
            ├── TextWidget.tsx
            ├── TextareaWidget.tsx
            ├── NumberWidget.tsx
            ├── DateWidget.tsx
            ├── SelectWidget.tsx
            └── CheckboxWidget.tsx
```

## How It Works

### 1. Schema Fetching

Schemas are fetched from the backend via React Query hooks:

```tsx
import { useFormSchema, useAllFormSchemas } from "@/hooks/use-form-schema";

// Fetch a single section schema
const { data: schema } = useFormSchema("education");

// Fetch all schemas at once (recommended for caching)
const { data: schemas } = useAllFormSchemas();
```

**API Endpoints:**
| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/forms/sections` | List available sections |
| `GET /api/v1/forms/sections/{section}` | Get single schema |
| `GET /api/v1/forms/sections/all` | Batch fetch all schemas |

### 2. Schema Structure

A JSON Schema with UI hints looks like this:

```json
{
  "type": "object",
  "title": "Education",
  "properties": {
    "high_school_name": {
      "type": "string",
      "title": "High School Name",
      "x-ui-widget": "text",
      "x-ui-placeholder": "Enter school name..."
    },
    "gpa": {
      "type": "number",
      "title": "GPA (Unweighted)",
      "x-ui-widget": "number",
      "x-ui-validation": { "min": 0, "max": 4.0 }
    },
    "graduation_year": {
      "type": "integer",
      "title": "Graduation Year",
      "x-ui-widget": "select",
      "x-ui-options": [
        { "value": "2025", "label": "2025" },
        { "value": "2026", "label": "2026" }
      ]
    }
  },
  "required": ["high_school_name"],
  "x-ui-order": ["high_school_name", "graduation_year", "gpa"],
  "x-ui-groups": [
    { "name": "school", "title": "School Info", "fields": ["high_school_name", "graduation_year"] },
    { "name": "academic", "title": "Academic", "fields": ["gpa"] }
  ]
}
```

### 3. UI Extension Properties

| Property           | Level  | Purpose                                     |
| ------------------ | ------ | ------------------------------------------- |
| `x-ui-widget`      | Field  | Which component to render                   |
| `x-ui-options`     | Field  | Options for select/dropdown                 |
| `x-ui-validation`  | Field  | Additional validation (min, max, maxLength) |
| `x-ui-placeholder` | Field  | Input placeholder text                      |
| `x-ui-disabled`    | Field  | Disable the field                           |
| `x-ui-hidden`      | Field  | Hide the field from rendering               |
| `x-ui-order`       | Schema | Array of field names in display order       |
| `x-ui-groups`      | Schema | Group fields into visual sections           |

### 4. Widget Mapping

The `FormFieldRenderer` maps `x-ui-widget` values to components:

| x-ui-widget       | Component            | Notes                                             |
| ----------------- | -------------------- | ------------------------------------------------- |
| `text`            | TextWidget           | Also handles `email`, `tel`, `url`                |
| `textarea`        | TextareaWidget       | Multi-line text with char count                   |
| `number`          | NumberWidget         | Numeric input with min/max                        |
| `date`            | DateWidget           | HTML5 date picker                                 |
| `select`          | SelectWidget         | Dropdown, supports categories                     |
| `checkbox`        | CheckboxWidget       | Boolean toggle                                    |
| `country-select`  | SelectWidget         | Same as select                                    |
| `state-select`    | SelectWidget         | Same as select                                    |
| `image-upload`    | ImageUploadWidget    | 3-step presigned upload; config via `x-ui-upload` |
| `document-upload` | DocumentUploadWidget | 3-step presigned upload; config via `x-ui-upload` |
| `video-upload`    | VideoUploadWidget    | 3-step presigned upload; config via `x-ui-upload` |

**Widget inference:** If `x-ui-widget` is not specified, the renderer infers:

- `boolean` type → checkbox
- `number`/`integer` type → number
- Has `enum` or `x-ui-options` → select
- Default → text

### 5. Validation

JSON Schema is converted to Zod for client-side validation:

```tsx
// In schema-to-zod.ts
const zodSchema = jsonSchemaToZod(jsonSchema);

// Results in something like:
z.object({
  high_school_name: z.string(),
  gpa: z.number().min(0).max(4.0).optional(),
  graduation_year: z.string().optional(),
});
```

**Validation sources:**

- `required` array in schema → field is required
- `x-ui-validation.required` → field is required
- `x-ui-validation.min/max` → number bounds
- `x-ui-validation.minLength/maxLength` → string length
- `x-ui-widget: "email"` → email format validation
- `x-ui-widget: "url"` → URL format validation

## Usage

### Basic Usage

```tsx
import { DynamicForm } from "@/components/dynamic-forms";
import { useFormSchema, useSaveProfileSection } from "@/hooks/use-form-schema";

function EducationForm() {
  const { data: schema, isLoading } = useFormSchema("education");
  const mutation = useSaveProfileSection("education");

  if (isLoading) return <DynamicFormSkeleton />;

  return (
    <DynamicForm
      schema={schema}
      initialData={{ high_school_name: "Lincoln High" }}
      onSubmit={(data) => mutation.mutate(data)}
      isSubmitting={mutation.isPending}
      submitLabel="Save Education"
    />
  );
}
```

### DynamicForm Props

| Prop           | Type                      | Default  | Description                    |
| -------------- | ------------------------- | -------- | ------------------------------ |
| `schema`       | `FormSchema`              | required | The JSON Schema definition     |
| `initialData`  | `Record<string, unknown>` | `{}`     | Pre-populate form fields       |
| `onSubmit`     | `(data) => void`          | required | Called with valid form data    |
| `isSubmitting` | `boolean`                 | `false`  | Disable form during submission |
| `submitLabel`  | `string`                  | `"Save"` | Submit button text             |
| `showTitle`    | `boolean`                 | `false`  | Show schema title/description  |

### Grouped vs Flat Layout

If the schema has `x-ui-groups`, fields are rendered in Card sections:

```
┌─────────────────────────────┐
│ School Info                 │  ← Group title
├─────────────────────────────┤
│ High School Name: [______]  │
│ Graduation Year:  [▼ 2025]  │
└─────────────────────────────┘
┌─────────────────────────────┐
│ Academic                    │
├─────────────────────────────┤
│ GPA: [____]                 │
└─────────────────────────────┘
```

Without groups, fields render in a flat list ordered by `x-ui-order`.

## Common Tasks

### Adding a New Widget

1. Create the widget in `src/components/dynamic-forms/widgets/`:

```tsx
// MyCustomWidget.tsx
"use client";

import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";

interface MyCustomWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
}

export function MyCustomWidget({ field, property, fieldKey, error }: MyCustomWidgetProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={fieldKey}>{property.title || fieldKey}</label>
      {/* Your custom input */}
      <input {...field} />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
```

2. Export from `widgets/index.ts`:

```tsx
export { MyCustomWidget } from "./MyCustomWidget";
```

3. Add to widget map in `FormFieldRenderer.tsx`:

```tsx
const WIDGET_MAP = {
  // ... existing widgets
  "my-custom": MyCustomWidget,
} as const;
```

### Adding New Validation Rules

Edit `src/components/dynamic-forms/utils/schema-to-zod.ts`:

```tsx
function stringPropertyToZod(prop, validation) {
  let schema = z.string();

  // Add your custom validation
  if (validation.myCustomRule) {
    schema = schema.refine(
      (val) => /* your logic */,
      "Custom error message"
    );
  }

  return schema;
}
```

### Using Fallback Schemas

When the API is unavailable, you can provide fallback schemas:

```tsx
const FALLBACK_SCHEMAS = {
  education: {
    type: "object",
    title: "Education",
    properties: {
      /* ... */
    },
  },
};

const { data: apiSchemas, isError } = useAllFormSchemas();
const schemas = isError ? FALLBACK_SCHEMAS : apiSchemas;
```

See `src/app/(dashboard)/profile/page.tsx` for a complete example.

### Debugging Form Issues

1. **Check schema structure:** Log the schema to verify `x-ui-*` properties
2. **Check Zod conversion:** Import and call `jsonSchemaToZod(schema)` to see the generated validator
3. **Check field errors:** The `error` prop is passed to each widget
4. **Check React Query:** Use React Query DevTools to inspect cached schemas

## Profile completion UI

Every `GET /api/v1/athletes/me/profile` response carries two completion signals derived from the same `FormField(required=True)` annotations the dynamic form renders:

- `section_completion` — a `{section_slug: {total, filled}}` dict.
- `profile_completion_pct` — a 0–100 integer recomputed fresh on every read (backend `@model_validator`).

Both values are authoritative and must agree by construction. When referring to "overall completion" on the frontend, compute it from `section_completion` via `getOverallCompletion` (same helper both `/profile` and `/dashboard` use) so the two surfaces can never drift.

### Helpers (`src/lib/profile-completion.ts`)

| Helper                                           | Purpose                                                      |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `getSectionCompletion(sectionId, profile)`       | Read `{total, filled, done}` for one section                 |
| `getOverallCompletion(sectionIds, profile)`      | Sum `filled/total` across sections, round to integer percent |
| `getFirstIncompleteSection(sectionIds, profile)` | Used by the "Continue" CTA on `/profile`                     |

`sectionIds` should be the schema section keys filtered by `!schema["x-ui-embedded-in"]` — exactly what both pages do today.

### Visibility banner + dashboard card

- `/profile` (`athlete-app/src/app/(dashboard)/profile/page.tsx`) shows an amber banner "Not visible to coaches yet" when `overallPct < 100`, or a green "Visible to coaches" badge at 100%.
- `/dashboard` (`athlete-app/src/app/(dashboard)/dashboard/page.tsx`) — client component using `useMyProfile()` + `useAllFormSchemas()` — renders a Profile Completion card with the same progress bar, warning banner, and thresholds. Both surfaces share `useMyProfile`'s TanStack Query cache, so a mutation on one updates the other.

### ProfilePhotoField (avatar uploader)

`athlete-app/src/components/forms/ProfilePhotoField.tsx` is the avatar uploader. It sits outside the `DynamicForm` because `avatar_url` lives on the `Athlete` root — not on one of the registered profile sections. It reuses `useFileUpload({ field: "avatar" })` for the 3-step presigned flow, and handles the case where the backend serves `avatar_url` as a short-lived signed URL (explicit image-load error message with the URL so access-control issues are visible).

## File Reference

| File                                    | Purpose                           |
| --------------------------------------- | --------------------------------- |
| `types/form-schema.ts`                  | TypeScript interfaces for schemas |
| `services/forms.ts`                     | API client functions              |
| `hooks/use-form-schema.ts`              | React Query hooks                 |
| `dynamic-forms/DynamicForm.tsx`         | Main form component               |
| `dynamic-forms/FormFieldRenderer.tsx`   | Widget selection logic            |
| `dynamic-forms/utils/schema-to-zod.ts`  | Validation conversion             |
| `dynamic-forms/utils/field-ordering.ts` | Ordering utilities                |
| `dynamic-forms/widgets/*.tsx`           | Individual field components       |

## Dependencies

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration for react-hook-form
- `zod` - Schema validation (already in project)
- `@tanstack/react-query` - Data fetching (already in project)
- shadcn/ui components - UI primitives (already in project)
