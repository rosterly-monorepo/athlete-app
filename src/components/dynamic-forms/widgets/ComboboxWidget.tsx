"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty, UIOption } from "@/types/form-schema";

interface ComboboxWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

const COMMON_CATEGORY = "Common";

export function ComboboxWidget({
  field,
  property,
  fieldKey,
  error,
  required,
}: ComboboxWidgetProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const allOptions: UIOption[] =
    property["x-ui-options"] || property.enum?.map((v) => ({ value: v, label: v })) || [];

  const commonOptions = allOptions.filter((opt) => opt.category === COMMON_CATEGORY);
  const otherOptions = allOptions.filter((opt) => opt.category !== COMMON_CATEGORY);

  // When searching, filter ALL options; otherwise show only common
  const isSearching = search.length > 0;
  const searchLower = search.toLowerCase();

  const filteredOptions = isSearching
    ? allOptions.filter((opt) => opt.label.toLowerCase().includes(searchLower))
    : commonOptions;

  // Group filtered options by category for display
  const grouped = filteredOptions.reduce(
    (acc, opt) => {
      const cat = opt.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(opt);
      return acc;
    },
    {} as Record<string, UIOption[]>
  );

  // Flat list for keyboard navigation
  const flatFiltered = filteredOptions;

  const selectedLabel = allOptions.find((opt) => opt.value === field.value)?.label;

  const selectOption = useCallback(
    (value: string) => {
      field.onChange(value);
      setOpen(false);
      setSearch("");
      setHighlightIndex(-1);
    },
    [field]
  );

  // Focus input when popover opens
  useEffect(() => {
    if (open) {
      // Small delay to let popover render
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
      setHighlightIndex(-1);
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-option-index]");
      items[highlightIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < flatFiltered.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : flatFiltered.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && flatFiltered[highlightIndex]) {
        selectOption(flatFiltered[highlightIndex].value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Determine if we should show category headers
  const categoryKeys = Object.keys(grouped);
  const showCategories = isSearching && categoryKeys.length > 1;

  // Track flat index across categories for keyboard nav
  let flatIndex = 0;

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldKey}>
        {property.title || fieldKey}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={fieldKey}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={!!error}
            className={cn(
              "w-full justify-between font-normal",
              !selectedLabel && "text-muted-foreground"
            )}
          >
            {selectedLabel || property["x-ui-placeholder"] || "Select..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="flex flex-col" onKeyDown={handleKeyDown}>
            <div className="border-b px-3 py-2">
              <Input
                ref={inputRef}
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightIndex(-1);
                }}
                className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div ref={listRef} className="max-h-60 overflow-y-auto p-1" role="listbox">
              {flatFiltered.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  {isSearching ? "No results found." : "Type to search..."}
                </div>
              ) : showCategories ? (
                categoryKeys.map((category) => {
                  const categoryOpts = grouped[category];
                  return (
                    <div key={category}>
                      <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
                        {category}
                      </div>
                      {categoryOpts.map((opt) => {
                        const idx = flatIndex++;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={field.value === opt.value}
                            data-option-index={idx}
                            className={cn(
                              "flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                              highlightIndex === idx && "bg-accent",
                              field.value === opt.value && "font-medium"
                            )}
                            onClick={() => selectOption(opt.value)}
                            onMouseEnter={() => setHighlightIndex(idx)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                field.value === opt.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                flatFiltered.map((opt, idx) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={field.value === opt.value}
                    data-option-index={idx}
                    className={cn(
                      "flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      highlightIndex === idx && "bg-accent",
                      field.value === opt.value && "font-medium"
                    )}
                    onClick={() => selectOption(opt.value)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        field.value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </button>
                ))
              )}
              {!isSearching && otherOptions.length > 0 && (
                <div className="text-muted-foreground border-t px-2 py-2 text-center text-xs">
                  Type to search {otherOptions.length} more options
                </div>
              )}
            </div>
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
