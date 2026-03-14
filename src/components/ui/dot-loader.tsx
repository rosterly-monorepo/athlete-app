"use client";

import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import type { DotFrame, DotState } from "./dot-loader-frames";
import { generateRosterlyFrames, R_FRAME } from "./dot-loader-frames";

const DOT_COLORS: Record<DotState | "inactive", string> = {
  active: "var(--dot-active)",
  accent: "var(--dot-accent)",
  "dissolve-1": "var(--dot-dissolve-1)",
  "dissolve-2": "var(--dot-dissolve-2)",
  "dissolve-3": "var(--dot-dissolve-3)",
  inactive: "var(--dot-inactive)",
};

export interface DotLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of frames to animate through */
  frames: DotFrame[];
  /** Total number of dots in the grid (default 49) */
  dotCount?: number;
  /** Grid columns (default 7) */
  columns?: number;
  /** Whether animation is playing (default true) */
  isPlaying?: boolean;
  /** Milliseconds per frame (default 120) */
  duration?: number;
  /** Number of loops, -1 for infinite (default -1) */
  repeatCount?: number;
  /** Called when repeatCount is reached */
  onComplete?: () => void;
  /** Additional class for individual dots */
  dotClassName?: string;
}

export function DotLoader({
  frames,
  dotCount = 49,
  columns = 7,
  isPlaying = true,
  duration = 120,
  repeatCount = -1,
  onComplete,
  dotClassName,
  className,
  ...props
}: DotLoaderProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const frameIndex = useRef(0);
  const repeats = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useRef(false);

  // Check reduced motion preference on mount
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const applyFrame = useCallback((dots: HTMLElement[], frame: DotFrame) => {
    for (let i = 0; i < dots.length; i++) {
      const state = frame[i] as DotState | undefined;
      dots[i].style.backgroundColor = DOT_COLORS[state ?? "inactive"];
    }
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const dots = Array.from(grid.children) as HTMLElement[];

    // Reduced motion: show static R
    if (prefersReducedMotion.current) {
      applyFrame(dots, R_FRAME);
      return;
    }

    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Reset if we're past the end
    if (frameIndex.current >= frames.length) {
      frameIndex.current = 0;
    }

    intervalRef.current = setInterval(() => {
      applyFrame(dots, frames[frameIndex.current]);

      if (frameIndex.current + 1 >= frames.length) {
        if (repeatCount !== -1 && repeats.current + 1 >= repeatCount) {
          clearInterval(intervalRef.current!);
          onComplete?.();
        }
        repeats.current++;
      }

      frameIndex.current = (frameIndex.current + 1) % frames.length;
    }, duration);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [frames, isPlaying, duration, repeatCount, onComplete, applyFrame]);

  // Reset counters when frames change
  useEffect(() => {
    frameIndex.current = 0;
    repeats.current = 0;
  }, [frames]);

  return (
    <div
      role="status"
      aria-label="Loading"
      {...props}
      ref={gridRef}
      className={cn("grid w-fit gap-0.5", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, ...props.style }}
    >
      {Array.from({ length: dotCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "size-1.5 rounded-sm transition-colors duration-100 ease-in-out",
            dotClassName
          )}
          style={{ backgroundColor: DOT_COLORS.inactive }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

// ── Convenience wrapper: branded Rosterly loader ──

const rosterlyFrames = generateRosterlyFrames();

export function RosterlyLoader({
  className,
  ...props
}: Omit<DotLoaderProps, "frames"> & { className?: string }) {
  return (
    <div className={cn("flex min-h-[200px] items-center justify-center", className)}>
      <DotLoader frames={rosterlyFrames} {...props} />
    </div>
  );
}
