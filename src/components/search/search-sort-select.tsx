"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption } from "@/services/types";

interface SearchSortSelectProps {
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
}

export function SearchSortSelect({ value, options, onChange }: SearchSortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-44 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
