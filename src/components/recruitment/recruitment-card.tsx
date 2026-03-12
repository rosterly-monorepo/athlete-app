"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva, type VariantProps } from "class-variance-authority";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecruitmentRecordWithAthlete } from "@/services/types";
import { PriorityBadge } from "./priority-badge";
import { RatingStars } from "./rating-stars";

// ─────────────────────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────────────────────

const recruitmentCardVariants = cva("cursor-pointer transition-all duration-200", {
  variants: {
    variant: {
      default: "hover:shadow-md",
      dragging: "opacity-50",
      overlay: "rotate-3 shadow-lg",
    },
    size: {
      sm: "p-2",
      default: "p-3",
      lg: "p-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RecruitmentCardProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof recruitmentCardVariants> {
  record: RecruitmentRecordWithAthlete;
  onClick?: (record: RecruitmentRecordWithAthlete) => void;
  showNotes?: boolean;
  showPosition?: boolean;
  showRating?: boolean;
  showPriority?: boolean;
}

export interface SortableRecruitmentCardProps extends Omit<RecruitmentCardProps, "variant"> {
  onOpenDetail?: (record: RecruitmentRecordWithAthlete) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

const RecruitmentCard = React.forwardRef<HTMLDivElement, RecruitmentCardProps>(
  (
    {
      record,
      variant,
      size,
      onClick,
      showNotes = true,
      showPosition = true,
      showRating = true,
      showPriority = true,
      className,
      ...props
    },
    ref
  ) => {
    const initials = `${record.athlete_first_name[0]}${record.athlete_last_name[0]}`;

    return (
      <Card
        ref={ref}
        className={cn(recruitmentCardVariants({ variant, size }), className)}
        onClick={() => onClick?.(record)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={record.athlete_avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {/* Name & Priority */}
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-sm font-medium">
                {record.athlete_first_name} {record.athlete_last_name}
              </h4>
              {showPriority && <PriorityBadge priority={record.priority} size="sm" />}
            </div>

            {/* School & Year */}
            <p className="text-muted-foreground truncate text-xs">
              {record.athlete_school} &middot; {record.athlete_graduation_year}
            </p>

            {/* Position & Rating */}
            <div className="mt-1 flex items-center justify-between">
              {showPosition && record.position ? (
                <Badge variant="outline" className="text-xs">
                  {record.position}
                </Badge>
              ) : (
                <span />
              )}
              {showRating && <RatingStars rating={record.rating} size="sm" readOnly />}
            </div>

            {/* Notes Preview */}
            {showNotes && record.note_count > 0 && (
              <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                <MessageSquare className="h-3 w-3 flex-shrink-0" />
                <span>{record.note_count}</span>
                {record.latest_note && <span className="truncate">· {record.latest_note}</span>}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }
);
RecruitmentCard.displayName = "RecruitmentCard";

const SortableRecruitmentCard = React.forwardRef<HTMLDivElement, SortableRecruitmentCardProps>(
  ({ record, onOpenDetail, ...props }, ref) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: record.id,
    });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

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

    return (
      <div ref={combinedRef} style={style} {...attributes} {...listeners}>
        <RecruitmentCard
          record={record}
          variant={isDragging ? "dragging" : "default"}
          onClick={onOpenDetail}
          {...props}
        />
      </div>
    );
  }
);
SortableRecruitmentCard.displayName = "SortableRecruitmentCard";

export { RecruitmentCard, SortableRecruitmentCard, recruitmentCardVariants };
