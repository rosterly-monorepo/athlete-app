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
  prospect: "Prospects",
  actively_recruiting: "Actively Recruiting",
  offer: "Offer Extended",
  recruited: "Recruited",
};

const STAGE_COLORS: Record<RecruitmentStage, string> = {
  prospect: "bg-slate-50 dark:bg-slate-900/50",
  actively_recruiting: "bg-blue-50 dark:bg-blue-950/50",
  offer: "bg-amber-50 dark:bg-amber-950/50",
  recruited: "bg-green-50 dark:bg-green-950/50",
};

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
    width: "default",
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

    const stageColor = STAGE_COLORS[column.stage] ?? "";
    const stageLabel = STAGE_LABELS[column.stage] ?? column.stage_label;

    return (
      <Card
        ref={combinedRef}
        className={cn(
          columnVariants({ width, state: isOver ? "over" : "default" }),
          stageColor,
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
              <CardTitle className="text-sm font-medium">{stageLabel}</CardTitle>
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
        {renderFooter && <div className="border-t p-3">{renderFooter(column)}</div>}
      </Card>
    );
  }
);
RecruitmentColumn.displayName = "RecruitmentColumn";

export { RecruitmentColumn, columnVariants, STAGE_LABELS, STAGE_COLORS };
