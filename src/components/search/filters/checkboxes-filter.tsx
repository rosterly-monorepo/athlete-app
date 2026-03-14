"use client";

import { useCallback, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AggBucket, SearchFilterSchema } from "@/services/types";

interface CheckboxesFilterProps {
  filter: SearchFilterSchema;
  value: string[] | undefined;
  onChange: (value: string[] | undefined) => void;
  aggregationBuckets?: AggBucket[];
}

export function CheckboxesFilter({
  filter,
  value,
  onChange,
  aggregationBuckets,
}: CheckboxesFilterProps) {
  const [search, setSearch] = useState("");

  const selected = useMemo(() => new Set(value ?? []), [value]);

  // Build options from static list or aggregation buckets
  const options = useMemo(() => {
    if (filter.options && filter.options.length > 0) {
      return filter.options.map((o) => ({
        value: o.value,
        label: o.label,
        count: aggregationBuckets?.find((b) => String(b.key) === o.value)?.count,
      }));
    }

    if (aggregationBuckets) {
      // Merge agg buckets with selected values (which may have 0 count)
      const fromAgg = aggregationBuckets.map((b) => ({
        value: String(b.key),
        label: String(b.key),
        count: b.count,
      }));
      // Add selected values not in agg results
      for (const v of selected) {
        if (!fromAgg.some((o) => o.value === v)) {
          fromAgg.push({ value: v, label: v, count: 0 });
        }
      }
      return fromAgg;
    }

    return [];
  }, [filter.options, aggregationBuckets, selected]);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, search]);

  const handleToggle = useCallback(
    (optionValue: string, checked: boolean) => {
      const next = new Set(selected);
      if (checked) {
        next.add(optionValue);
      } else {
        next.delete(optionValue);
      }
      onChange(next.size > 0 ? Array.from(next) : undefined);
    },
    [selected, onChange]
  );

  return (
    <div className="space-y-2">
      {options.length > 8 && (
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs"
        />
      )}
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {filteredOptions.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={`${filter.field}-${option.value}`}
              checked={selected.has(option.value)}
              onCheckedChange={(checked) => handleToggle(option.value, checked === true)}
            />
            <Label
              htmlFor={`${filter.field}-${option.value}`}
              className="flex-1 cursor-pointer text-sm font-normal"
            >
              {option.label}
            </Label>
            {option.count !== undefined && (
              <span className="text-muted-foreground text-xs">{option.count}</span>
            )}
          </div>
        ))}
        {filteredOptions.length === 0 && (
          <p className="text-muted-foreground py-2 text-xs">No options</p>
        )}
      </div>
    </div>
  );
}
