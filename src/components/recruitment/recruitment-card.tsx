"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva, type VariantProps } from "class-variance-authority";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { RecruitmentRecordWithAthlete } from "@/services/types";
import { PriorityBadge } from "./priority-badge";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatShortDate(dateString: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────────────────────

const recruitmentCardVariants = cva("cursor-pointer transition-all duration-200", {
  variants: {
    variant: {
      default: "hover:border-primary/30",
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
  showDate?: boolean;
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
    { record, variant, size, onClick, showDate = true, showPriority = true, className, ...props },
    ref
  ) => {
    const initials = `${record.athlete_first_name?.[0] ?? ""}${record.athlete_last_name?.[0] ?? ""}`;
    const shortDate = showDate ? formatShortDate(record.stage_changed_at) : null;
    const lastContact = formatShortDate(record.last_communication_at);

    return (
      <Card
        ref={ref}
        className={cn(recruitmentCardVariants({ variant, size }), className)}
        onClick={() => onClick?.(record)}
        {...props}
      >
        <div className="relative flex items-start gap-3">
          {/* Academic Index — top-right badge */}
          {record.athlete_academic_index != null && (
            <span className="text-muted-foreground absolute top-0 right-0 text-[10px] font-semibold">
              RAI {Math.round(record.athlete_academic_index)}
            </span>
          )}

          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={record.athlete_avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {/* Name & Priority */}
            <div className="flex items-center justify-between gap-2 pr-8">
              <h4 className="truncate text-sm font-medium">
                {record.athlete_first_name} {record.athlete_last_name}
              </h4>
              {showPriority && <PriorityBadge priority={record.priority} size="sm" />}
            </div>

            {/* Last Communication */}
            {lastContact && <p className="text-foreground text-xs">Last contact {lastContact}</p>}

            {/* Position · Grad Year · School */}
            <p className="text-muted-foreground truncate text-xs">
              {[record.position, record.athlete_graduation_year, record.athlete_school]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {/* Stage changed date */}
            {shortDate && (
              <div className="mt-0.5 flex items-center justify-end">
                <span className="text-muted-foreground text-xs">{shortDate}</span>
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
