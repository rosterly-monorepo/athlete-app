"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Phone, Mail, MapPin, ClipboardList, MessageSquare, type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { RecruitmentNote, NoteType } from "@/services/types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const NOTE_TYPE_ICONS: Record<NoteType, LucideIcon> = {
  general: MessageSquare,
  call: Phone,
  email: Mail,
  visit: MapPin,
  evaluation: ClipboardList,
};

const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  general: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  call: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  email: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
  visit: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  evaluation: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────────────────────

const noteListVariants = cva("", {
  variants: {
    spacing: {
      sm: "space-y-2",
      default: "space-y-3",
      lg: "space-y-4",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

const noteItemVariants = cva("flex", {
  variants: {
    size: {
      sm: "gap-2",
      default: "gap-3",
      lg: "gap-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NoteListProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof noteListVariants> {
  notes: RecruitmentNote[];
  emptyMessage?: string;
  renderNote?: (note: RecruitmentNote) => React.ReactNode;
  showIcons?: boolean;
  showAuthor?: boolean;
  showTime?: boolean;
}

export interface NoteItemProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof noteItemVariants> {
  note: RecruitmentNote;
  showIcon?: boolean;
  showAuthor?: boolean;
  showTime?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

const NoteItem = React.forwardRef<HTMLDivElement, NoteItemProps>(
  (
    { note, size, showIcon = true, showAuthor = true, showTime = true, className, ...props },
    ref
  ) => {
    const Icon = NOTE_TYPE_ICONS[note.note_type];
    const iconColor = NOTE_TYPE_COLORS[note.note_type];
    const timeAgo = formatDistanceToNow(new Date(note.created_at), {
      addSuffix: true,
    });

    return (
      <div ref={ref} className={cn(noteItemVariants({ size }), className)} {...props}>
        {showIcon && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              iconColor
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {(showAuthor || showTime) && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              {showAuthor && <span className="font-medium">{note.coach_name ?? "Coach"}</span>}
              {showAuthor && showTime && <span>·</span>}
              {showTime && <span>{timeAgo}</span>}
            </div>
          )}
          <p className="mt-1 text-sm whitespace-pre-wrap">{note.content}</p>
        </div>
      </div>
    );
  }
);
NoteItem.displayName = "NoteItem";

const NoteList = React.forwardRef<HTMLDivElement, NoteListProps>(
  (
    {
      notes,
      spacing,
      emptyMessage = "No notes yet. Add one above.",
      renderNote,
      showIcons = true,
      showAuthor = true,
      showTime = true,
      className,
      ...props
    },
    ref
  ) => {
    if (notes.length === 0) {
      return <p className="text-muted-foreground py-4 text-center text-sm">{emptyMessage}</p>;
    }

    return (
      <div ref={ref} className={cn(noteListVariants({ spacing }), className)} {...props}>
        {notes.map((note) =>
          renderNote ? (
            <React.Fragment key={note.id}>{renderNote(note)}</React.Fragment>
          ) : (
            <NoteItem
              key={note.id}
              note={note}
              showIcon={showIcons}
              showAuthor={showAuthor}
              showTime={showTime}
            />
          )
        )}
      </div>
    );
  }
);
NoteList.displayName = "NoteList";

export {
  NoteList,
  NoteItem,
  noteListVariants,
  noteItemVariants,
  NOTE_TYPE_ICONS,
  NOTE_TYPE_COLORS,
};
