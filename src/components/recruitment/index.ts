// ─────────────────────────────────────────────────────────────────────────────
// Recruitment Board Components
// ─────────────────────────────────────────────────────────────────────────────
//
// A complete Kanban-style recruitment board for tracking athletes through
// a recruitment pipeline. Built with @dnd-kit for drag-and-drop.
//
// Usage:
//   import { RecruitmentBoard, RecruitmentCard, PriorityBadge } from "@/components/recruitment";
//
// ─────────────────────────────────────────────────────────────────────────────

// Board
export {
  RecruitmentBoard,
  RecruitmentBoardContent,
  boardVariants,
  type RecruitmentBoardProps,
} from "./recruitment-board";

// Column
export {
  RecruitmentColumn,
  columnVariants,
  STAGE_LABELS,
  STAGE_COLORS,
  type RecruitmentColumnProps,
} from "./recruitment-column";

// Card
export {
  RecruitmentCard,
  SortableRecruitmentCard,
  recruitmentCardVariants,
  type RecruitmentCardProps,
  type SortableRecruitmentCardProps,
} from "./recruitment-card";

// Card Detail
export {
  RecruitmentCardDetail,
  STAGES,
  PRIORITIES,
  type RecruitmentCardDetailProps,
} from "./recruitment-card-detail";

// Add Athlete
export { AddAthleteDialog, type AddAthleteDialogProps } from "./add-athlete-dialog";
export { AthleteSearch, type AthleteSearchProps } from "./athlete-search";

// Priority Badge
export {
  PriorityBadge,
  priorityBadgeVariants,
  PRIORITY_LABELS,
  type PriorityBadgeProps,
} from "./priority-badge";

// Rating Stars
export { RatingStars, ratingStarsVariants, type RatingStarsProps } from "./rating-stars";

// Notes
export {
  NoteList,
  NoteItem,
  noteListVariants,
  noteItemVariants,
  NOTE_TYPE_ICONS,
  NOTE_TYPE_COLORS,
  type NoteListProps,
  type NoteItemProps,
} from "./note-list";

export { NoteForm, NOTE_TYPES, type NoteFormProps } from "./note-form";

// Skeletons
export { BoardSkeleton, CardSkeleton, type BoardSkeletonProps } from "./board-skeleton";

// Program Selector
export { ProgramSelector, formatSportCode, type ProgramSelectorProps } from "./program-selector";
