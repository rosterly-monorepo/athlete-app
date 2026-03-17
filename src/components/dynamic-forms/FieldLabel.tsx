"use client";

import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { FormSchemaProperty } from "@/types/form-schema";

export function FieldTooltip({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="text-muted-foreground h-3.5 w-3.5 shrink-0 cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface FieldLabelProps {
  fieldKey: string;
  property: FormSchemaProperty;
  required?: boolean;
}

export function FieldLabel({ fieldKey, property, required }: FieldLabelProps) {
  return (
    <Label htmlFor={fieldKey} className="flex items-center gap-1">
      {property.title || fieldKey}
      {required && <span className="text-destructive">*</span>}
      {property["x-ui-tooltip"] && <FieldTooltip tooltip={property["x-ui-tooltip"]} />}
    </Label>
  );
}
