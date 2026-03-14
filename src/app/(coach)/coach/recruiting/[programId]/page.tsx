"use client";

import { use, useState } from "react";
import { useMyPrograms } from "@/hooks/use-programs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  RecruitmentBoard,
  AddAthleteDialog,
  ProgramSelector,
  RecruitmentCardDetail,
} from "@/components/recruitment";
import type { RecruitmentStage, RecruitmentRecordWithAthlete } from "@/services/types";

interface Props {
  params: Promise<{ programId: string }>;
}

export default function RecruitingBoardPage({ params }: Props) {
  const { programId } = use(params);
  const numericProgramId = parseInt(programId, 10);
  const { data: programs, isLoading: programsLoading } = useMyPrograms();
  const [addToStage, setAddToStage] = useState<RecruitmentStage | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RecruitmentRecordWithAthlete | null>(null);

  const hasMultiplePrograms = (programs?.length ?? 0) > 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {hasMultiplePrograms && (
            <Link href="/coach/recruiting">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recruiting Board</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your athlete recruitment pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {programsLoading ? (
            <Skeleton className="h-9 w-[200px]" />
          ) : (
            hasMultiplePrograms &&
            programs && <ProgramSelector programs={programs} currentProgramId={numericProgramId} />
          )}
          <AddAthleteDialog programId={numericProgramId}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Athlete
            </Button>
          </AddAthleteDialog>
        </div>
      </div>

      {/* Board */}
      <RecruitmentBoard
        programId={numericProgramId}
        onAddToStage={setAddToStage}
        onRecordSelect={setSelectedRecord}
      />

      {/* Record detail sheet */}
      <RecruitmentCardDetail
        programId={numericProgramId}
        record={selectedRecord}
        open={selectedRecord !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRecord(null);
        }}
      />

      {/* Controlled dialog for per-column "+ Add" buttons */}
      <AddAthleteDialog
        programId={numericProgramId}
        defaultStage={addToStage ?? "interested"}
        open={addToStage !== null}
        onOpenChange={(open) => {
          if (!open) setAddToStage(null);
        }}
      />
    </div>
  );
}
