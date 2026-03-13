"use client";

import * as React from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useRecruitmentBoard } from "@/hooks/use-recruitment";
import { useRecruitmentDnd } from "@/hooks/use-recruitment-dnd";
import type {
  RecruitmentBoard as BoardData,
  RecruitmentBoardColumn,
  RecruitmentRecordWithAthlete,
  RecruitmentStage,
} from "@/services/types";
import { RecruitmentColumn } from "./recruitment-column";
import { RecruitmentCard } from "./recruitment-card";
import { BoardSkeleton } from "./board-skeleton";

// ─────────────────────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────────────────────

const boardVariants = cva("flex overflow-x-auto", {
  variants: {
    gap: {
      sm: "gap-2",
      default: "gap-4",
      lg: "gap-6",
    },
    padding: {
      none: "",
      sm: "pb-2",
      default: "pb-4",
      lg: "pb-6",
    },
  },
  defaultVariants: {
    gap: "default",
    padding: "default",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RecruitmentBoardProps
  extends
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "children" | "onDragStart" | "onDragOver" | "onDragEnd"
    >,
    VariantProps<typeof boardVariants> {
  programId: number;
  onRecordSelect?: (record: RecruitmentRecordWithAthlete) => void;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderColumn?: (
    column: RecruitmentBoardColumn,
    onOpenDetail: (record: RecruitmentRecordWithAthlete) => void
  ) => React.ReactNode;
  renderDragOverlay?: (record: RecruitmentRecordWithAthlete) => React.ReactNode;
  columnWidth?: "sm" | "default" | "lg";
  onAddToStage?: (stage: RecruitmentStage) => void;
}

export interface RecruitmentBoardContentProps
  extends
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "children" | "onDragStart" | "onDragOver" | "onDragEnd"
    >,
    VariantProps<typeof boardVariants> {
  board: BoardData;
  onRecordSelect?: (record: RecruitmentRecordWithAthlete) => void;
  activeRecord: RecruitmentRecordWithAthlete | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  renderColumn?: RecruitmentBoardProps["renderColumn"];
  renderDragOverlay?: RecruitmentBoardProps["renderDragOverlay"];
  columnWidth?: RecruitmentBoardProps["columnWidth"];
  onAddToStage?: (stage: RecruitmentStage) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Headless board content - use this if you want to manage data fetching yourself
 */
const RecruitmentBoardContent = React.forwardRef<HTMLDivElement, RecruitmentBoardContentProps>(
  (
    {
      board,
      gap,
      padding,
      onRecordSelect,
      activeRecord,
      onDragStart,
      onDragOver,
      onDragEnd,
      onDragCancel,
      renderColumn,
      renderDragOverlay,
      columnWidth = "default",
      onAddToStage,
      className,
      ...props
    },
    ref
  ) => {
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div ref={ref} className={cn(boardVariants({ gap, padding }), className)} {...props}>
          {board.columns.map((column) =>
            renderColumn ? (
              <React.Fragment key={column.stage}>
                {renderColumn(column, onRecordSelect ?? (() => {}))}
              </React.Fragment>
            ) : (
              <RecruitmentColumn
                key={column.stage}
                column={column}
                width={columnWidth}
                onOpenDetail={onRecordSelect}
                onAddClick={onAddToStage}
              />
            )
          )}
        </div>

        <DragOverlay>
          {activeRecord ? (
            renderDragOverlay ? (
              renderDragOverlay(activeRecord)
            ) : (
              <RecruitmentCard record={activeRecord} variant="overlay" />
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }
);
RecruitmentBoardContent.displayName = "RecruitmentBoardContent";

/**
 * Full board with data fetching - use this for the common case
 */
const RecruitmentBoard = React.forwardRef<HTMLDivElement, RecruitmentBoardProps>(
  (
    {
      programId,
      gap,
      padding,
      onRecordSelect,
      renderLoading,
      renderError,
      renderEmpty,
      renderColumn,
      renderDragOverlay,
      columnWidth,
      onAddToStage,
      className,
      ...props
    },
    ref
  ) => {
    const { data: board, isLoading, error } = useRecruitmentBoard(programId);

    const { activeRecord, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } =
      useRecruitmentDnd(programId, board);

    // Use provided handler
    const handleRecordSelect = React.useCallback(
      (record: RecruitmentRecordWithAthlete) => {
        onRecordSelect?.(record);
      },
      [onRecordSelect]
    );

    if (isLoading) {
      return renderLoading ? <>{renderLoading()}</> : <BoardSkeleton className={className} />;
    }

    if (error) {
      return renderError ? (
        <>{renderError(error)}</>
      ) : (
        <div className={cn("text-destructive py-8 text-center", className)}>
          Failed to load recruitment board. Please try again.
        </div>
      );
    }

    if (!board || board.columns.every((c) => c.records.length === 0)) {
      if (renderEmpty) {
        return <>{renderEmpty()}</>;
      }
      // Fall through to show empty columns
    }

    if (!board) return null;

    return (
      <RecruitmentBoardContent
        ref={ref}
        board={board}
        gap={gap}
        padding={padding}
        onRecordSelect={handleRecordSelect}
        activeRecord={activeRecord}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        renderColumn={renderColumn}
        renderDragOverlay={renderDragOverlay}
        columnWidth={columnWidth}
        onAddToStage={onAddToStage}
        className={className}
        {...props}
      />
    );
  }
);
RecruitmentBoard.displayName = "RecruitmentBoard";

export { RecruitmentBoard, RecruitmentBoardContent, boardVariants };
