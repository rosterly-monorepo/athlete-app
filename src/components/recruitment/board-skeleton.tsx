"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface BoardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number;
  cardsPerColumn?: number | number[];
}

const BoardSkeleton = React.forwardRef<HTMLDivElement, BoardSkeletonProps>(
  ({ columns = 4, cardsPerColumn = [3, 2, 1, 0], className, ...props }, ref) => {
    const cardsArray = Array.isArray(cardsPerColumn)
      ? cardsPerColumn
      : Array(columns).fill(cardsPerColumn);

    return (
      <div ref={ref} className={cn("flex gap-4 overflow-x-auto pb-4", className)} {...props}>
        {Array.from({ length: columns }, (_, colIndex) => (
          <Card key={colIndex} className="w-80 flex-shrink-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {Array.from({ length: cardsArray[colIndex] ?? 0 }, (_, cardIndex) => (
                <CardSkeleton key={cardIndex} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
);
BoardSkeleton.displayName = "BoardSkeleton";

const CardSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Card ref={ref} className={cn("p-3", className)} {...props}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </Card>
  )
);
CardSkeleton.displayName = "CardSkeleton";

export { BoardSkeleton, CardSkeleton };
