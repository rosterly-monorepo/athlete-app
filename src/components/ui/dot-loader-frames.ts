/** Dot states for multi-shade animation */
export type DotState = "active" | "dissolve-1" | "dissolve-2" | "dissolve-3" | "accent";

/** A single animation frame: dot index → state. Absent indices are inactive. */
export type DotFrame = Record<number, DotState>;

const GRID_SIZE = 49; // 7x7

/**
 * R shape on a 7x7 grid.
 *
 *  ●  ●  ●  ●  ●  .  ◌
 *  ●  .  .  .  .  ●  .
 *  ●  .  .  .  .  ●  .
 *  ●  ●  ●  ●  .  .  .
 *  ●  .  .  ●  .  .  .
 *  ●  .  .  .  ●  .  .
 *  ●  .  .  .  .  ●  ◌
 */
export const R_SOLID_DOTS: number[] = [
  0,
  1,
  2,
  3,
  4, // top bar
  7,
  12, // stem + bowl right
  14,
  19, // stem + bowl right
  21,
  22,
  23,
  24, // middle bar
  28,
  31, // stem + diagonal leg
  35,
  39, // stem + leg
  42,
  47, // stem + leg end
];

/** Dissolve dots that trail from the R shape */
export const R_DISSOLVE: Record<number, DotState> = {
  6: "dissolve-3", // trail from top bar (darkest, nearest bg)
  48: "dissolve-1", // trail from leg end (lightest, nearest shape)
};

/** Complete R frame with solid + dissolve dots */
export const R_FRAME: DotFrame = {
  ...Object.fromEntries(R_SOLID_DOTS.map((i) => [i, "active" as DotState])),
  ...R_DISSOLVE,
};

// ── Seeded PRNG (mulberry32) for deterministic "random" patterns ──

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick n random unique indices from 0..max-1 */
function randomIndices(rng: () => number, count: number, max: number): number[] {
  const indices: number[] = [];
  const available = Array.from({ length: max }, (_, i) => i);
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(rng() * available.length);
    indices.push(available[idx]);
    available.splice(idx, 1);
  }
  return indices;
}

/** Fill empty grid positions with random accent dots (the background scatter) */
function addAccentField(rng: () => number, frame: DotFrame, density = 0.3): DotFrame {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!(i in frame) && rng() < density) {
      frame[i] = "accent";
    }
  }
  return frame;
}

/** Create a scatter frame (random active dots) */
function scatterFrame(indices: number[]): DotFrame {
  return Object.fromEntries(indices.map((i) => [i, "active" as DotState]));
}

/**
 * Generate the branded Rosterly loading animation.
 * Cycles: scatter → coalesce → R hold → dissolve out → scatter
 */
export function generateRosterlyFrames(seed = 42): DotFrame[] {
  const rng = mulberry32(seed);
  const frames: DotFrame[] = [];

  // ── Phase 1: Scatter (12 frames) ──
  // Random dots flickering across the grid, with occasional accent dots
  for (let i = 0; i < 12; i++) {
    const count = 5 + Math.floor(rng() * 6); // 5-10 dots
    const indices = randomIndices(rng, count, GRID_SIZE);
    frames.push(scatterFrame(indices));
  }

  // ── Phase 2: Coalesce (10 frames) ──
  // Progressively add R dots while reducing random dots
  const rSorted = [...R_SOLID_DOTS];

  for (let step = 0; step < 10; step++) {
    const frame: DotFrame = {};
    const progress = step / 9; // 0 → 1

    // Add R dots progressively (stem first, then outward)
    const rDotsToShow = Math.floor(R_SOLID_DOTS.length * progress);
    for (let j = 0; j < rDotsToShow; j++) {
      frame[rSorted[j]] = "active";
    }

    // Sprinkle some random dots that decrease over time
    const randomCount = Math.floor((1 - progress) * 6);
    if (randomCount > 0) {
      const nonRDots = Array.from({ length: GRID_SIZE }, (_, i) => i).filter(
        (i) => !R_SOLID_DOTS.includes(i) && !(i in R_DISSOLVE)
      );
      const randoms = randomIndices(rng, randomCount, nonRDots.length).map((idx) => nonRDots[idx]);
      for (const r of randoms) {
        frame[r] = "active";
      }
    }

    // Add dissolve dots in the later frames
    if (progress > 0.6) {
      for (const [idx, state] of Object.entries(R_DISSOLVE)) {
        frame[Number(idx)] = state;
      }
    }

    frames.push(frame);
  }

  // ── Phase 3: R hold (5 frames) ──
  for (let i = 0; i < 5; i++) {
    frames.push({ ...R_FRAME });
  }

  // ── Phase 4: Dissolve out (10 frames) ──
  // Remove R dots from extremities inward, converting to dissolve states
  const dissolveOrder = [
    // Extremities first
    [47, 48, 6],
    [42, 39, 12, 19, 4],
    [31, 35, 28, 3, 24],
    [2, 23],
    [1, 22],
    [14, 7],
    [0, 21],
  ];

  const remainingDots = new Set(R_SOLID_DOTS);
  const remainingDissolve = new Set(Object.keys(R_DISSOLVE).map(Number));

  for (let step = 0; step < 10; step++) {
    const frame: DotFrame = {};

    // Remove a group of dots each step
    if (step < dissolveOrder.length) {
      for (const dot of dissolveOrder[step]) {
        remainingDots.delete(dot);
        remainingDissolve.delete(dot);
      }
    }

    // Remaining R dots stay active
    for (const dot of remainingDots) {
      frame[dot] = "active";
    }

    // Remaining dissolve dots
    for (const dot of remainingDissolve) {
      frame[dot] = R_DISSOLVE[dot];
    }

    // Recently removed dots briefly show as dissolve
    if (step > 0 && step <= dissolveOrder.length) {
      const justRemoved = dissolveOrder[step - 1];
      if (justRemoved) {
        for (const dot of justRemoved) {
          if (!remainingDots.has(dot)) {
            frame[dot] = "dissolve-2";
          }
        }
      }
    }

    // Add some random dots in later frames to transition back
    if (step > 5) {
      const randomCount = Math.floor((step - 5) * 1.5);
      const randoms = randomIndices(rng, randomCount, GRID_SIZE);
      for (const r of randoms) {
        if (!(r in frame)) {
          frame[r] = "active";
        }
      }
    }

    frames.push(frame);
  }

  // ── Phase 5: Transition back to scatter (5 frames) ──
  for (let i = 0; i < 5; i++) {
    const count = 5 + Math.floor(rng() * 6);
    const indices = randomIndices(rng, count, GRID_SIZE);
    frames.push(scatterFrame(indices));
  }

  // ── Apply accent field with fading density ──
  // Accents are visible during scatter, fade as the R forms, go dark
  // during hold, then reignite as the R dissolves back out.
  const totalFrames = frames.length;
  const scatterEnd = 12;
  const coalesceEnd = scatterEnd + 10; // 22
  const holdEnd = coalesceEnd + 5; // 27
  const dissolveEnd = holdEnd + 10; // 37
  // Phase 5 scatter: 37..end

  const MAX_DENSITY = 0.3;

  for (let i = 0; i < totalFrames; i++) {
    let density: number;

    if (i < scatterEnd) {
      // Scatter: full accents
      density = MAX_DENSITY;
    } else if (i < coalesceEnd) {
      // Coalesce: fade out as R forms (1.0 → 0.0)
      const progress = (i - scatterEnd) / (coalesceEnd - scatterEnd);
      density = MAX_DENSITY * (1 - progress);
    } else if (i < holdEnd) {
      // R hold: no accents — clean R
      density = 0;
    } else if (i < dissolveEnd) {
      // Dissolve out: accents reignite (0.0 → 1.0)
      const progress = (i - holdEnd) / (dissolveEnd - holdEnd);
      density = MAX_DENSITY * progress;
    } else {
      // Back to scatter: full accents
      density = MAX_DENSITY;
    }

    if (density > 0) {
      addAccentField(rng, frames[i], density);
    }
  }

  return frames;
}
