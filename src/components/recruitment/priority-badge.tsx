"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Priority } from "@/services/types";

const priorityBadgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      priority: {
        high: "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400",
        medium:
          "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        low: "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        default: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export interface PriorityBadgeProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof priorityBadgeVariants> {
  priority: Priority | null | undefined;
  showLabel?: boolean;
}

const PriorityBadge = React.forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ priority, size, showLabel = true, className, ...props }, ref) => {
    if (!priority) return null;

    return (
      <span
        ref={ref}
        className={cn(priorityBadgeVariants({ priority, size }), className)}
        {...props}
      >
        {showLabel ? PRIORITY_LABELS[priority] : null}
      </span>
    );
  }
);
PriorityBadge.displayName = "PriorityBadge";

export { PriorityBadge, priorityBadgeVariants, PRIORITY_LABELS };
