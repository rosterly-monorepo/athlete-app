"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ratingStarsVariants = cva("flex", {
  variants: {
    size: {
      sm: "gap-0.5",
      default: "gap-0.5",
      lg: "gap-1",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const starSizeMap = {
  sm: "h-3 w-3",
  default: "h-4 w-4",
  lg: "h-5 w-5",
};

export interface RatingStarsProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof ratingStarsVariants> {
  rating: number | null | undefined;
  maxRating?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  emptyClassName?: string;
  filledClassName?: string;
}

const RatingStars = React.forwardRef<HTMLDivElement, RatingStarsProps>(
  (
    {
      rating,
      maxRating = 5,
      size = "default",
      onChange,
      readOnly = false,
      emptyClassName,
      filledClassName,
      className,
      ...props
    },
    ref
  ) => {
    const currentRating = rating ?? 0;
    const isInteractive = !!onChange && !readOnly;
    const starSize = starSizeMap[size ?? "default"];

    return (
      <div
        ref={ref}
        role={isInteractive ? "radiogroup" : "img"}
        aria-label={`Rating: ${currentRating} out of ${maxRating} stars`}
        className={cn(ratingStarsVariants({ size }), className)}
        {...props}
      >
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= currentRating;

          const starElement = (
            <Star
              className={cn(
                starSize,
                "transition-colors",
                isFilled
                  ? cn("fill-yellow-400 text-yellow-400", filledClassName)
                  : cn("text-muted-foreground fill-transparent", emptyClassName)
              )}
            />
          );

          if (isInteractive) {
            return (
              <button
                key={starValue}
                type="button"
                role="radio"
                aria-checked={starValue === currentRating}
                aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                onClick={() => onChange(starValue)}
                className="focus-visible:ring-ring cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              >
                {starElement}
              </button>
            );
          }

          return (
            <span key={starValue} aria-hidden>
              {starElement}
            </span>
          );
        })}
      </div>
    );
  }
);
RatingStars.displayName = "RatingStars";

export { RatingStars, ratingStarsVariants };
