"use client";

import type { DropdownProps } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Custom Dropdown component for react-day-picker that replaces the default
 * hidden native <select> with a visible Radix UI Select. Used for both
 * month and year navigation in the Calendar component.
 */
export function CalendarDropdown(props: DropdownProps) {
  const { options, value, onChange, disabled, "aria-label": ariaLabel } = props;

  const handleValueChange = (newValue: string) => {
    const syntheticEvent = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange?.(syntheticEvent);
  };

  return (
    <Select value={String(value)} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className="hover:bg-accent h-7 gap-1 border-none bg-transparent px-2 text-sm font-medium shadow-none focus-visible:ring-0"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="center" className="max-h-60">
        {options
          ?.filter((o) => !o.disabled)
          .map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
