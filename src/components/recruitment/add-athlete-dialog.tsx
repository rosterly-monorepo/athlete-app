"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddRecord } from "@/hooks/use-recruitment";
import type { AthleteSearchHit, RecruitmentStage, Priority } from "@/services/types";
import { AthleteSearch } from "./athlete-search";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AddAthleteDialogProps {
  programId: number;
  children?: React.ReactNode;
  defaultStage?: RecruitmentStage;
  defaultPriority?: Priority;
  onAthleteAdded?: (athleteId: number) => void;
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function AddAthleteDialog({
  programId,
  children,
  defaultStage = "interested",
  defaultPriority,
  onAthleteAdded,
  title = "Add Athlete to Board",
  description = "Search for an athlete to add to your recruitment board.",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddAthleteDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = React.useMemo(
    () => (isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen),
    [isControlled, controlledOnOpenChange]
  );
  const addRecord = useAddRecord(programId);

  const handleSelect = React.useCallback(
    (athlete: AthleteSearchHit) => {
      addRecord.mutate(
        {
          athlete_id: athlete.id,
          sport_code: athlete.primary_sport ?? undefined,
          position: athlete.position ?? undefined,
          stage: defaultStage,
          priority: defaultPriority,
        },
        {
          onSuccess: () => {
            setOpen(false);
            onAthleteAdded?.(athlete.id);
          },
        }
      );
    },
    [addRecord, defaultStage, defaultPriority, onAthleteAdded, setOpen]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <AthleteSearch onSelect={handleSelect} />
      </DialogContent>
    </Dialog>
  );
}

export { AddAthleteDialog };
