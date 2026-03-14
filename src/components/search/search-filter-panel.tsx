"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchFilterGroup } from "./search-filter-group";
import type { AggBucket, FilterGroup, SearchFilterSchema } from "@/services/types";

interface SearchFilterPanelProps {
  filters: SearchFilterSchema[];
  groups: FilterGroup[];
  filterValues: Record<string, unknown>;
  aggregations: Record<string, AggBucket[]>;
  activeFilterCount: { total: number; byGroup: Record<string, number> };
  hasUnappliedChanges: boolean;
  onFilterChange: (field: string, value: unknown) => void;
  onClearGroup: (groupKey: string) => void;
  onClearAll: () => void;
  onApply: () => void;
}

export function SearchFilterPanel({
  filters,
  groups,
  filterValues,
  aggregations,
  activeFilterCount,
  hasUnappliedChanges,
  onFilterChange,
  onClearGroup,
  onClearAll,
  onApply,
}: SearchFilterPanelProps) {
  // Group filters by group key
  const groupedFilters = useMemo(() => {
    const map: Record<string, SearchFilterSchema[]> = {};
    for (const filter of filters) {
      if (!map[filter.group]) map[filter.group] = [];
      map[filter.group].push(filter);
    }
    return map;
  }, [filters]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 pb-2">
        <h2 className="text-sm font-semibold">Filters</h2>
        {activeFilterCount.total > 0 && (
          <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={onClearAll}>
            <X className="h-3 w-3" />
            Clear all ({activeFilterCount.total})
          </Button>
        )}
      </div>

      {hasUnappliedChanges && (
        <Button className="w-full" size="sm" onClick={onApply}>
          Apply Filters
        </Button>
      )}

      <div className="divide-y">
        {groups.map((group) => {
          // Hide sport-specific groups when their sport isn't selected
          if (group.sport_code) {
            const selectedSports = (filterValues["sports"] as string[] | undefined) ?? [];
            if (!selectedSports.includes(group.sport_code)) return null;
          }

          const groupFilters = groupedFilters[group.key];
          if (!groupFilters || groupFilters.length === 0) return null;

          return (
            <SearchFilterGroup
              key={group.key}
              label={group.label}
              groupKey={group.key}
              filters={groupFilters}
              filterValues={filterValues}
              aggregations={aggregations}
              activeCount={activeFilterCount.byGroup[group.key] ?? 0}
              onFilterChange={onFilterChange}
              onClearGroup={onClearGroup}
            />
          );
        })}
      </div>
    </div>
  );
}
