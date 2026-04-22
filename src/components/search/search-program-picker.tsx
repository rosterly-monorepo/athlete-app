"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatSportCode } from "@/lib/format";
import type { OrganizationProgram } from "@/services/types";

interface SearchProgramPickerProps {
  programs: OrganizationProgram[];
  selectedProgramId: number | null;
}

export function SearchProgramPicker({ programs, selectedProgramId }: SearchProgramPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlParams = useSearchParams();

  if (programs.length === 0) return null;

  const handleChange = (value: string) => {
    const next = new URLSearchParams(urlParams.toString());
    next.set("program", value);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const value = selectedProgramId != null ? String(selectedProgramId) : undefined;

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs tracking-wide uppercase">Program</span>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="h-8 w-[180px] text-sm" size="sm">
          <SelectValue placeholder="Select a program" />
        </SelectTrigger>
        <SelectContent>
          {programs.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {formatSportCode(p.sport_code)}
              {p.division ? ` · ${p.division}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
