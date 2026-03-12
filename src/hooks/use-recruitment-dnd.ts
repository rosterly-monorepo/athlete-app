"use client";

import { useState, useCallback } from "react";
import type { DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type {
  RecruitmentBoard,
  RecruitmentRecordWithAthlete,
  RecruitmentStage,
} from "@/services/types";
import { useMoveRecord, useReorderRecords } from "./use-recruitment";

export function useRecruitmentDnd(programId: number, board: RecruitmentBoard | undefined) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  const moveRecord = useMoveRecord(programId);
  const reorderRecords = useReorderRecords(programId);

  // Find which column a record belongs to
  const findColumn = useCallback(
    (id: UniqueIdentifier): RecruitmentStage | null => {
      if (!board) return null;

      // Check if id is a column id (stage name)
      const column = board.columns.find((col) => col.stage === id);
      if (column) return column.stage;

      // Otherwise find the record's column
      for (const col of board.columns) {
        if (col.records.some((r) => r.id === id)) {
          return col.stage;
        }
      }
      return null;
    },
    [board]
  );

  const getActiveRecord = useCallback((): RecruitmentRecordWithAthlete | null => {
    if (!board || !activeId) return null;

    for (const col of board.columns) {
      const record = col.records.find((r) => r.id === activeId);
      if (record) return record;
    }
    return null;
  }, [board, activeId]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id ?? null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setOverId(null);

      if (!over || !board) return;

      const activeColumn = findColumn(active.id);
      const overColumn = findColumn(over.id);

      if (!activeColumn || !overColumn) return;

      if (activeColumn === overColumn) {
        // Reordering within the same column
        const column = board.columns.find((c) => c.stage === activeColumn);
        if (!column) return;

        const oldIndex = column.records.findIndex((r) => r.id === active.id);
        const newIndex = column.records.findIndex((r) => r.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newOrder = arrayMove(column.records, oldIndex, newIndex);
          reorderRecords.mutate({
            stage: activeColumn,
            record_ids: newOrder.map((r) => r.id),
          });
        }
      } else {
        // Moving between columns
        const overColumnData = board.columns.find((c) => c.stage === overColumn);
        if (!overColumnData) return;

        // Find target position
        let targetPosition = overColumnData.records.length;
        if (over.id !== overColumn) {
          const overIndex = overColumnData.records.findIndex((r) => r.id === over.id);
          if (overIndex >= 0) targetPosition = overIndex;
        }

        moveRecord.mutate({
          recordId: active.id as number,
          data: { new_stage: overColumn, new_order: targetPosition },
        });
      }
    },
    [board, findColumn, moveRecord, reorderRecords]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  return {
    activeId,
    overId,
    activeRecord: getActiveRecord(),
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    isMoving: moveRecord.isPending || reorderRecords.isPending,
  };
}
