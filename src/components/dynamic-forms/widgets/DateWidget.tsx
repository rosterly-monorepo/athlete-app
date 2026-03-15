"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid, subYears } from "date-fns";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { getDateConstraints } from "../utils/field-validations";

interface DateWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

export function DateWidget({ field, property, fieldKey, error, required }: DateWidgetProps) {
  const [open, setOpen] = useState(false);

  // Parse the YYYY-MM-DD string to a Date for the calendar
  const selectedDate = field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined;
  const validDate = selectedDate && isValid(selectedDate) ? selectedDate : undefined;

  // Get calendar bounds from field validation rules
  const constraints = getDateConstraints(fieldKey, property);

  // Default to ~16 years ago for date_of_birth so the calendar opens to a useful month
  const defaultMonth = validDate ?? (constraints ? subYears(new Date(), 16) : undefined);

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
            type="button"
            variant="outline"
            disabled={property["x-ui-disabled"]}
            aria-invalid={!!error}
            className={cn(
              "h-9 w-full justify-start text-left font-normal",
              !validDate && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {validDate ? format(validDate, "MMMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={validDate}
            onSelect={(date) => {
              if (date) {
                field.onChange(format(date, "yyyy-MM-dd"));
              } else {
                field.onChange("");
              }
              setOpen(false);
            }}
            defaultMonth={defaultMonth}
            captionLayout={constraints ? "dropdown" : undefined}
            startMonth={constraints?.fromDate}
            endMonth={constraints?.toDate}
            disabled={
              constraints
                ? { before: constraints.fromDate!, after: constraints.toDate! }
                : undefined
            }
          />
        </PopoverContent>
      </Popover>
      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
