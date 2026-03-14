"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RangeFilter } from "./filters/range-filter";
import { CheckboxesFilter } from "./filters/checkboxes-filter";
import { ToggleFilter } from "./filters/toggle-filter";
import type { AggBucket, SearchFilterSchema } from "@/services/types";

const FILTER_COMPONENTS = {
  range: RangeFilter,
  checkboxes: CheckboxesFilter,
  toggle: ToggleFilter,
} as const;

interface SearchFilterGroupProps {
  label: string;
  groupKey: string;
  filters: SearchFilterSchema[];
  filterValues: Record<string, unknown>;
  aggregations: Record<string, AggBucket[]>;
  activeCount: number;
  onFilterChange: (field: string, value: unknown) => void;
  onClearGroup: (groupKey: string) => void;
}

export function SearchFilterGroup({
  label,
  groupKey,
  filters,
  filterValues,
  aggregations,
  activeCount,
  onFilterChange,
  onClearGroup,
}: SearchFilterGroupProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <button
              className="text-muted-foreground hover:text-foreground mr-1 text-[10px]"
              onClick={(e) => {
                e.stopPropagation();
                onClearGroup(groupKey);
              }}
            >
              Clear
            </button>
          )}
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 pb-3">
        {filters.map((filter) => {
          const value = filterValues[filter.field];
          const buckets = aggregations[filter.field];
          const Component = FILTER_COMPONENTS[filter.filter_type];

          if (!Component) return null;

          // Toggle filters render their own label
          if (filter.filter_type === "toggle") {
            return (
              <ToggleFilter
                key={filter.field}
                filter={filter}
                value={value as boolean | undefined}
                onChange={(v) => onFilterChange(filter.field, v)}
              />
            );
          }

          return (
            <div key={filter.field} className="space-y-1.5">
              <label className="text-muted-foreground text-xs">{filter.label}</label>
              <Component
                filter={filter}
                value={value as never}
                onChange={(v: unknown) => onFilterChange(filter.field, v)}
                {...(filter.filter_type === "checkboxes" ? { aggregationBuckets: buckets } : {})}
              />
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
