"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, MoreHorizontal, UserMinus } from "lucide-react";
import { useRecord, useUpdateRecord, useRemoveRecord, useAddNote } from "@/hooks/use-recruitment";
import { useAthleteCoachView } from "@/hooks/use-athlete";
import { useARMSExport } from "@/hooks/use-arms-export";
import { AthleteCoachProfile, type AdditionalTab } from "@/components/coach/athlete-profile";
import { CommunicationsTab } from "./communications-tab";
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
  { value: "rostered", label: "Rostered" },
  { value: "alumni", label: "Alumni" },
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
  showRemoveButton?: boolean;
  renderActions?: (record: RecruitmentRecordDetail) => React.ReactNode;
  renderNotes?: (record: RecruitmentRecordDetail) => React.ReactNode;
  renderFooter?: (record: RecruitmentRecordDetail) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start gap-5">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function RecruitmentToolbar({
  record,
  onStageChange,
  onPriorityChange,
  onRatingChange,
  onRemove,
  onExport,
  isRemoving,
  isExporting,
  showRemove,
}: {
  record: RecruitmentRecordDetail;
  onStageChange: (stage: RecruitmentStage) => void;
  onPriorityChange: (priority: Priority) => void;
  onRatingChange: (rating: number) => void;
  onRemove: () => void;
  onExport: () => void;
  isRemoving: boolean;
  isExporting: boolean;
  showRemove: boolean;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 border-b pb-4">
      <div className="flex items-center gap-2">
        <label className="text-muted-foreground text-xs font-medium">Stage</label>
        <Select value={record.stage} onValueChange={onStageChange}>
          <SelectTrigger className="h-8 w-[150px] text-xs">
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

      <div className="flex items-center gap-2">
        <label className="text-muted-foreground text-xs font-medium">Priority</label>
        <Select value={record.priority ?? undefined} onValueChange={onPriorityChange}>
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue placeholder="Set" />
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

      <div className="flex items-center gap-2">
        <label className="text-muted-foreground text-xs font-medium">Rating</label>
        <RatingStars rating={record.rating} size="default" onChange={onRatingChange} />
      </div>

      {record.tags && record.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {record.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            disabled={isRemoving || isExporting}
            aria-label="Athlete actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            Export to ARMS
          </DropdownMenuItem>
          {showRemove && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onRemove} disabled={isRemoving} variant="destructive">
                <UserMinus className="mr-2 h-4 w-4" />
                Remove from pipeline
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function NotesSkeleton() {
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

function RemoveConfirmDialog({
  open,
  onOpenChange,
  record,
  onConfirm,
  isRemoving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: RecruitmentRecordWithAthlete;
  onConfirm: () => void;
  isRemoving: boolean;
}) {
  const deletedItems: string[] = [];
  if (record.note_count > 0) {
    deletedItems.push(`${record.note_count} note${record.note_count === 1 ? "" : "s"}`);
  }
  if (record.rating) deletedItems.push("rating");
  if (record.priority) deletedItems.push("priority");
  if (record.tags && record.tags.length > 0) {
    deletedItems.push(`${record.tags.length} tag${record.tags.length === 1 ? "" : "s"}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Remove {record.athlete_first_name} {record.athlete_last_name} from pipeline?
          </DialogTitle>
          <DialogDescription>
            This will permanently remove this athlete from your recruitment pipeline.
          </DialogDescription>
        </DialogHeader>

        {deletedItems.length > 0 && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-2">The following will be deleted:</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-1">
              {deletedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRemoving}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isRemoving}>
            {isRemoving ? "Removing…" : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecruitmentCardDetail({
  programId,
  record,
  open,
  onOpenChange,
  side = "right",
  showRemoveButton = true,
  renderActions,
  renderNotes,
  renderFooter,
}: RecruitmentCardDetailProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const { data: fullRecord, isLoading: recordLoading } = useRecord(record?.id ?? 0);
  const { data: athlete, isLoading: athleteLoading } = useAthleteCoachView(record?.athlete_id ?? 0);
  const updateRecord = useUpdateRecord(programId);
  const removeRecord = useRemoveRecord(programId);
  const addNote = useAddNote(programId);
  const { mutate: exportToARMS, isPending: isExporting } = useARMSExport();

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

  const handleRemoveClick = () => {
    setRemoveDialogOpen(true);
  };

  const handleExport = () => {
    exportToARMS({
      program_id: programId,
      athlete_ids: [record.athlete_id],
    });
  };

  const handleRemoveConfirm = () => {
    removeRecord.mutate(record.id);
    setRemoveDialogOpen(false);
    onOpenChange(false);
  };

  const displayRecord = (fullRecord ?? record) as RecruitmentRecordDetail;

  // Build the additional tabs for the recruitment context
  const additionalTabs: AdditionalTab[] = [
    {
      value: "notes",
      label: "Notes",
      content: renderNotes ? (
        renderNotes(displayRecord)
      ) : (
        <>
          <NoteForm onSubmit={handleAddNote} isSubmitting={addNote.isPending} />
          <div className="mt-4">
            {recordLoading ? <NotesSkeleton /> : <NoteList notes={displayRecord.notes ?? []} />}
          </div>
        </>
      ),
    },
    {
      value: "communications",
      label: "Communications",
      content: <CommunicationsTab athleteId={record.athlete_id} />,
    },
  ];

  // Recruitment toolbar rendered between header and tabs
  const toolbar = renderActions ? (
    renderActions(displayRecord)
  ) : (
    <RecruitmentToolbar
      record={displayRecord}
      onStageChange={handleStageChange}
      onPriorityChange={handlePriorityChange}
      onRatingChange={handleRatingChange}
      onRemove={handleRemoveClick}
      onExport={handleExport}
      isRemoving={removeRecord.isPending}
      isExporting={isExporting}
      showRemove={showRemoveButton}
    />
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={side} className="flex flex-col overflow-hidden sm:max-w-3xl">
          {/* Accessible sheet title (visually hidden, profile header shows the name) */}
          <SheetHeader className="sr-only">
            <SheetTitle>
              {record.athlete_first_name} {record.athlete_last_name}
            </SheetTitle>
          </SheetHeader>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto py-2">
            {athleteLoading ? (
              <LoadingSkeleton />
            ) : athlete ? (
              <AthleteCoachProfile
                athlete={athlete}
                inPipeline
                beforeTabs={toolbar}
                additionalTabs={additionalTabs}
                defaultTab="notes"
                className=""
              />
            ) : (
              // Fallback if athlete data fails to load — show basic info from record
              <div className="p-4">
                <h2 className="text-xl font-bold">
                  {record.athlete_first_name} {record.athlete_last_name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {record.athlete_school} · Class of {record.athlete_graduation_year}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {renderFooter ? renderFooter(displayRecord) : null}
        </SheetContent>
      </Sheet>

      <RemoveConfirmDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        record={record}
        onConfirm={handleRemoveConfirm}
        isRemoving={removeRecord.isPending}
      />
    </>
  );
}

export { RecruitmentCardDetail, STAGES, PRIORITIES };
