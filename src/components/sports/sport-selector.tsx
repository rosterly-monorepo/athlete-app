"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAvailableSports, useAddSport } from "@/hooks/use-sports";
import type { AthleteSportDetail } from "@/services/types";
import { useState } from "react";

interface SportSelectorProps {
  existingSports: AthleteSportDetail[];
}

export function SportSelector({ existingSports }: SportSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: available, isLoading } = useAvailableSports();
  const addSport = useAddSport();

  const existingCodes = new Set(existingSports.map((s) => s.sport_code));
  const addableSports = (available ?? []).filter((s) => !existingCodes.has(s.code));

  const handleAdd = (code: string) => {
    addSport.mutate({ sport_code: code }, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Sport
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Sport</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p className="text-muted-foreground py-4 text-sm">Loading...</p>
        ) : addableSports.length === 0 ? (
          <p className="text-muted-foreground py-4 text-sm">
            You&apos;ve already added all available sports.
          </p>
        ) : (
          <div className="grid gap-2 py-2">
            {addableSports.map((sport) => (
              <Button
                key={sport.code}
                variant="outline"
                className="justify-start"
                onClick={() => handleAdd(sport.code)}
                disabled={addSport.isPending}
              >
                {sport.name}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
