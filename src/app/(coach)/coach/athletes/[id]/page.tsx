"use client";

import { use, useCallback, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RosterlyLoader } from "@/components/ui/dot-loader";
import { AthleteCoachProfile } from "@/components/coach/athlete-profile";
import { useAthleteCoachView } from "@/hooks/use-athlete";
import { useMyPrograms } from "@/hooks/use-programs";
import { useAddRecord, usePipelineAthleteIds } from "@/hooks/use-recruitment";

export default function AthleteProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const athleteId = Number(id);
  const { data: athlete, isLoading, error } = useAthleteCoachView(athleteId);
  const { data: programs } = useMyPrograms();

  // Pipeline state
  const programIds = useMemo(() => (programs ?? []).map((p) => p.id), [programs]);
  const { data: pipelineAthleteIdList } = usePipelineAthleteIds(programIds);
  const inPipeline = useMemo(
    () => (pipelineAthleteIdList ?? []).includes(athleteId),
    [pipelineAthleteIdList, athleteId]
  );

  const defaultProgramId = programs?.[0]?.id;
  const addRecord = useAddRecord(defaultProgramId ?? 0);
  const [isAdding, setIsAdding] = useState(false);
  const [addedOptimistically, setAddedOptimistically] = useState(false);

  const handleAddToPipeline = useCallback(() => {
    if (!defaultProgramId) return;
    setIsAdding(true);
    addRecord.mutate(
      { athlete_id: athleteId },
      {
        onSuccess: () => setAddedOptimistically(true),
        onSettled: () => setIsAdding(false),
      }
    );
  }, [defaultProgramId, addRecord, athleteId]);

  if (isLoading) {
    return <RosterlyLoader />;
  }

  if (error || !athlete) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm">
          {error?.message?.includes("404") ? "Athlete not found" : "Failed to load athlete profile"}
        </p>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <AthleteCoachProfile
      athlete={athlete}
      inPipeline={inPipeline || addedOptimistically}
      isAdding={isAdding}
      onAddToPipeline={defaultProgramId ? handleAddToPipeline : undefined}
    />
  );
}
