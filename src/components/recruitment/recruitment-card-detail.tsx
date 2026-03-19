"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { useRecord, useUpdateRecord, useArchiveRecord, useAddNote } from "@/hooks/use-recruitment";
import type {
  RecruitmentRecordWithAthlete,
  RecruitmentRecordDetail,
  RecruitmentStage,
  Priority,
  NoteType,
} from "@/services/types";
import { RatingStars } from "./rating-stars";
import { NoteList } from "./note-list";
import { NoteForm } from "./note-form";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STAGES: { value: RecruitmentStage; label: string }[] = [
  { value: "interested", label: "Interested" },
  { value: "initial_outreach", label: "Initial Outreach" },
  { value: "initial_call", label: "Initial Call" },
  { value: "monitoring", label: "Monitoring" },
  { value: "pre_read", label: "Pre-Read" },
  { value: "offer_extended", label: "Offer Extended" },
  { value: "committed", label: "Committed" },
  { value: "likely_letter", label: "Likely Letter" },
  { value: "admitted", label: "Admitted" },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RecruitmentCardDetailProps {
  programId: number;
  record: RecruitmentRecordWithAthlete | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  showArchiveButton?: boolean;
  renderHeader?: (record: RecruitmentRecordDetail) => React.ReactNode;
  renderActions?: (record: RecruitmentRecordDetail) => React.ReactNode;
  renderNotes?: (record: RecruitmentRecordDetail) => React.ReactNode;
  renderFooter?: (record: RecruitmentRecordDetail) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function RecruitmentCardDetail({
  programId,
  record,
  open,
  onOpenChange,
  side = "right",
  showArchiveButton = true,
  renderHeader,
  renderActions,
  renderNotes,
  renderFooter,
}: RecruitmentCardDetailProps) {
  const { data: fullRecord, isLoading } = useRecord(record?.id ?? 0);
  const updateRecord = useUpdateRecord(programId);
  const archiveRecord = useArchiveRecord(programId);
  const addNote = useAddNote(programId);

  if (!record) return null;

  const handleStageChange = (stage: RecruitmentStage) => {
    updateRecord.mutate({ recordId: record.id, data: { stage } });
  };

  const handlePriorityChange = (priority: Priority) => {
    updateRecord.mutate({ recordId: record.id, data: { priority } });
  };

  const handleRatingChange = (rating: number) => {
    updateRecord.mutate({ recordId: record.id, data: { rating } });
  };

  const handleAddNote = (content: string, noteType: NoteType) => {
    addNote.mutate({
      recordId: record.id,
      data: { content, note_type: noteType },
    });
  };

  const handleArchive = () => {
    archiveRecord.mutate(record.id);
    onOpenChange(false);
  };

  const initials = `${record.athlete_first_name?.[0] ?? ""}${record.athlete_last_name?.[0] ?? ""}`;
  const displayRecord = (fullRecord ?? record) as RecruitmentRecordDetail;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="flex flex-col overflow-hidden sm:max-w-md">
        {/* Header */}
        <SheetHeader>
          {renderHeader ? (
            renderHeader(displayRecord)
          ) : (
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={record.athlete_avatar_url ?? undefined} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">
                  {record.athlete_first_name} {record.athlete_last_name}
                </SheetTitle>
                <SheetDescription>
                  {record.athlete_school} · Class of {record.athlete_graduation_year}
                </SheetDescription>
              </div>
            </div>
          )}
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 space-y-6 overflow-y-auto py-4">
          {/* Actions */}
          {renderActions ? (
            renderActions(displayRecord)
          ) : (
            <>
              {/* Stage & Priority selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                    Stage
                  </label>
                  <Select value={displayRecord.stage} onValueChange={handleStageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                    Priority
                  </label>
                  <Select
                    value={displayRecord.priority ?? undefined}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Set priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                  Rating
                </label>
                <RatingStars
                  rating={displayRecord.rating}
                  size="lg"
                  onChange={handleRatingChange}
                />
              </div>

              {/* Info badges */}
              <div className="flex flex-wrap gap-2">
                {displayRecord.position && (
                  <Badge variant="outline">{displayRecord.position}</Badge>
                )}
                {displayRecord.sport_code && (
                  <Badge variant="secondary">{displayRecord.sport_code}</Badge>
                )}
                {displayRecord.athlete_gpa && (
                  <Badge variant="outline">GPA: {displayRecord.athlete_gpa}</Badge>
                )}
              </div>

              {/* Tags */}
              {displayRecord.tags && displayRecord.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {displayRecord.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div className="border-t pt-4">
            {renderNotes ? (
              renderNotes(displayRecord)
            ) : (
              <>
                <h3 className="mb-3 font-medium">Notes</h3>
                <NoteForm onSubmit={handleAddNote} isSubmitting={addNote.isPending} />
                <div className="mt-4">
                  {isLoading ? <DetailSkeleton /> : <NoteList notes={displayRecord.notes ?? []} />}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        {renderFooter
          ? renderFooter(displayRecord)
          : showArchiveButton && (
              <div className="border-t pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleArchive}
                  disabled={archiveRecord.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </div>
            )}
      </SheetContent>
    </Sheet>
  );
}

export { RecruitmentCardDetail, STAGES, PRIORITIES };
