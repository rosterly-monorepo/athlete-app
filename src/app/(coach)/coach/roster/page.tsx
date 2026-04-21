"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useRoster } from "@/hooks/use-recruitment";
import { RecruitmentCard, RecruitmentCardDetail } from "@/components/recruitment";
import { formatSportCode } from "@/lib/format";
import { RosterlyLoader } from "@/components/ui/dot-loader";
import type { RecruitmentRecordWithAthlete, RosterEntry } from "@/services/types";

function groupByProgram(records: RosterEntry[]) {
  const groups = new Map<string, RosterEntry[]>();
  for (const record of records) {
    const key = record.program_sport_code;
    const existing = groups.get(key);
    if (existing) {
      existing.push(record);
    } else {
      groups.set(key, [record]);
    }
  }
  return groups;
}

export default function CoachRosterPage() {
  const { organization } = useOrganization();
  const { data: roster, isLoading, error } = useRoster();
  const [selectedRecord, setSelectedRecord] = useState<RecruitmentRecordWithAthlete | null>(null);

  if (!organization) {
    return (
      <p className="text-muted-foreground">You don&apos;t have permission to view the roster.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roster</h1>
        <p className="text-muted-foreground mt-1">Athletes currently on your team.</p>
      </div>

      {isLoading && <RosterlyLoader />}

      {error && (
        <div className="text-destructive py-8 text-center">
          Failed to load roster. Please try again.
        </div>
      )}

      {roster && roster.total_count === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
            <h3 className="mb-2 text-lg font-semibold">No rostered athletes yet</h3>
            <p className="text-muted-foreground mx-auto max-w-md text-sm">
              Athletes will appear here once they are moved to the &quot;Rostered&quot; stage on the
              recruiting board.
            </p>
          </CardContent>
        </Card>
      )}

      {roster && roster.total_count > 0 && (
        <div className="space-y-8">
          {Array.from(groupByProgram(roster.records)).map(([sportCode, records]) => (
            <section key={sportCode}>
              <h2 className="mb-4 text-lg font-semibold">
                {formatSportCode(sportCode)}
                <span className="text-muted-foreground ml-2 text-sm font-normal">
                  ({records.length})
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {records.map((record) => (
                  <RecruitmentCard key={record.id} record={record} onClick={setSelectedRecord} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {selectedRecord && (
        <RecruitmentCardDetail
          programId={selectedRecord.program_id}
          record={selectedRecord}
          open={selectedRecord !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
}
