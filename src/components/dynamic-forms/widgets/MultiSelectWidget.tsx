"use client";

import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty, UIOption } from "@/types/form-schema";
import { FieldLabel } from "../FieldLabel";

interface MultiSelectWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function MultiSelectWidget({
  field,
  property,
  fieldKey,
  error,
  required,
}: MultiSelectWidgetProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const allOptions: UIOption[] =
    property["x-ui-options"] || property.enum?.map((v) => ({ value: v, label: v })) || [];

  const selected: string[] = Array.isArray(field.value) ? field.value : [];

  const hasCategories = allOptions.some((opt) => opt.category);

  // Group options by category
  const grouped = hasCategories
    ? allOptions.reduce(
        (acc, opt) => {
          const cat = opt.category || "Other";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(opt);
          return acc;
        },
        {} as Record<string, UIOption[]>
      )
    : { "": allOptions };

  const toggleOption = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    field.onChange(next);
  };

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange(selected.filter((v) => v !== value));
  };

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const selectedLabels = selected
    .map((v) => allOptions.find((opt) => opt.value === v))
    .filter(Boolean) as UIOption[];

  return (
    <div className="grid gap-2">
      <FieldLabel fieldKey={fieldKey} property={property} required={required} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            id={fieldKey}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={!!error}
            className={cn(
              "h-auto min-h-10 w-full justify-between font-normal",
              !selected.length && "text-muted-foreground"
            )}
          >
            <div className="flex flex-1 flex-wrap gap-1">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((opt) => (
                  <Badge key={opt.value} variant="secondary" className="gap-1 pr-1">
                    {opt.label}
                    <button
                      type="button"
                      className="hover:bg-muted-foreground/20 rounded-full"
                      onClick={(e) => removeOption(opt.value, e)}
                      aria-label={`Remove ${opt.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span>{property["x-ui-placeholder"] || "Select..."}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="max-h-60 overflow-y-auto p-1">
            {Object.entries(grouped).map(([category, categoryOptions]) => (
              <div key={category}>
                {category && (
                  <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
                    {category}
                  </div>
                )}
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={selected.includes(opt.value)}
                    className="hover:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none"
                    onClick={() => toggleOption(opt.value)}
                  >
                    <Checkbox
                      checked={selected.includes(opt.value)}
                      className="pointer-events-none"
                      tabIndex={-1}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
