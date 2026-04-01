"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  RecruitmentBoardColumn as ColumnData,
  RecruitmentRecordWithAthlete,
  RecruitmentStage,
} from "@/services/types";
import { SortableRecruitmentCard } from "./recruitment-card";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<RecruitmentStage, string> = {
  interested: "Interested",
  initial_outreach: "Outreach",
  initial_call: "Initial Call",
  monitoring: "Monitoring",
  pre_read: "Pre-Read",
  offer_extended: "Offer",
  committed: "Committed",
  likely_letter: "Likely Letter",
  admitted: "Admitted",
};

const ACCENT_HEADER_STAGES: Set<RecruitmentStage> = new Set(["pre_read"]);

// ─────────────────────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────────────────────

const columnVariants = cva("flex flex-col transition-all duration-200", {
  variants: {
    width: {
      sm: "w-64",
      default: "w-80",
      lg: "w-96",
    },
    state: {
      default: "",
      over: "ring-2 ring-primary",
    },
  },
  defaultVariants: {
    width: "sm",
    state: "default",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RecruitmentColumnProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof columnVariants> {
  column: ColumnData;
  onOpenDetail?: (record: RecruitmentRecordWithAthlete) => void;
  onAddClick?: (stage: RecruitmentStage) => void;
  showCount?: boolean;
  emptyMessage?: string;
  renderHeader?: (column: ColumnData) => React.ReactNode;
  renderFooter?: (column: ColumnData) => React.ReactNode;
  renderCard?: (
    record: RecruitmentRecordWithAthlete,
    onOpenDetail?: (record: RecruitmentRecordWithAthlete) => void
  ) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const RecruitmentColumn = React.forwardRef<HTMLDivElement, RecruitmentColumnProps>(
  (
    {
      column,
      width,
      onOpenDetail,
      onAddClick,
      showCount = true,
      emptyMessage = "No athletes",
      renderHeader,
      renderFooter,
      renderCard,
      className,
      ...props
    },
    ref
  ) => {
    const { setNodeRef, isOver } = useDroppable({ id: column.stage });

    const recordIds = React.useMemo(() => column.records.map((r) => r.id), [column.records]);

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        setNodeRef(node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref, setNodeRef]
    );

    const stageLabel = STAGE_LABELS[column.stage] ?? column.stage_label;
    const isAccentHeader = ACCENT_HEADER_STAGES.has(column.stage);

    return (
      <Card
        ref={combinedRef}
        className={cn(
          columnVariants({ width, state: isOver ? "over" : "default" }),
          "flex-shrink-0",
          className
        )}
        {...props}
      >
        {/* Header */}
        <CardHeader className="pb-3">
          {renderHeader ? (
            renderHeader(column)
          ) : (
            <div className="flex items-center justify-between">
              <CardTitle
                className={cn(
                  "text-xs font-semibold tracking-widest uppercase",
                  isAccentHeader && "font-bold"
                )}
              >
                {stageLabel}
              </CardTitle>
              {showCount && <Badge variant="secondary">{column.count}</Badge>}
            </div>
          )}
        </CardHeader>

        {/* Content */}
        <CardContent className="flex min-h-[200px] flex-1 flex-col gap-2 overflow-y-auto">
          <SortableContext items={recordIds} strategy={verticalListSortingStrategy}>
            {column.records.map((record) =>
              renderCard ? (
                <React.Fragment key={record.id}>{renderCard(record, onOpenDetail)}</React.Fragment>
              ) : (
                <SortableRecruitmentCard
                  key={record.id}
                  record={record}
                  onOpenDetail={onOpenDetail}
                />
              )
            )}
          </SortableContext>

          {column.records.length === 0 && (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              {emptyMessage}
            </div>
          )}
        </CardContent>

        {/* Footer */}
        {renderFooter ? (
          <div className="border-t p-3">{renderFooter(column)}</div>
        ) : onAddClick ? (
          <div className="p-3 pt-0">
            <button
              type="button"
              onClick={() => onAddClick(column.stage)}
              className="border-border/50 text-muted-foreground hover:border-primary hover:text-primary w-full rounded-lg border border-dashed py-2 text-xs transition-colors"
            >
              + Add
            </button>
          </div>
        ) : null}
      </Card>
    );
  }
);
RecruitmentColumn.displayName = "RecruitmentColumn";

export { RecruitmentColumn, columnVariants, STAGE_LABELS };
