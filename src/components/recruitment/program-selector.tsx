"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OrganizationProgram } from "@/services/types";

// ─────────────────────────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────────────────────────

function formatSportCode(code: string): string {
  return code
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProgramSelectorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  programs: OrganizationProgram[];
  currentProgramId: number;
  basePath?: string;
  onChange?: (programId: number) => void;
  renderLabel?: (program: OrganizationProgram) => string;
  width?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const ProgramSelector = React.forwardRef<HTMLDivElement, ProgramSelectorProps>(
  (
    {
      programs,
      currentProgramId,
      basePath = "/coach/recruiting",
      onChange,
      renderLabel,
      width = "w-[200px]",
      className,
      ...props
    },
    ref
  ) => {
    const router = useRouter();

    const handleChange = React.useCallback(
      (value: string) => {
        const programId = parseInt(value, 10);
        if (onChange) {
          onChange(programId);
        } else {
          router.push(`${basePath}/${value}`);
        }
      },
      [onChange, router, basePath]
    );

    const defaultRenderLabel = React.useCallback((program: OrganizationProgram) => {
      const sportName = formatSportCode(program.sport_code);
      return program.division ? `${sportName} - ${program.division}` : sportName;
    }, []);

    const labelFn = renderLabel ?? defaultRenderLabel;

    return (
      <div ref={ref} className={cn(className)} {...props}>
        <Select value={String(currentProgramId)} onValueChange={handleChange}>
          <SelectTrigger className={width}>
            <SelectValue placeholder="Select program" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program.id} value={String(program.id)}>
                {labelFn(program)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);
ProgramSelector.displayName = "ProgramSelector";

export { ProgramSelector, formatSportCode };
