# Dot Loader

Branded loading animation built on a 7x7 dot grid. The animation cycles through random scatter patterns with a flickering ember (orange accent) background, then coalesces into the Rosterly "R" logomark — embers fading to silence as the R forms cleanly — before dissolving back out and reigniting.

Based on the [21st.dev DotLoader](https://21st.dev) component, extended with multi-state dots for dissolve trails and ember accent effects.

## Quick Start

```tsx
import { RosterlyLoader } from "@/components/ui/dot-loader";

// Drop-in full-page loader (e.g. in a loading.tsx file)
export default function Loading() {
  return <RosterlyLoader />;
}
```

## Components

### `<RosterlyLoader />`

Pre-configured branded loader centered in a flex container. Accepts all `DotLoaderProps` except `frames` (uses `generateRosterlyFrames()` internally).

```tsx
<RosterlyLoader className="min-h-screen" />
```

### `<DotLoader />`

Generic dot-grid animator. Provide your own frames for custom animations.

```tsx
import { DotLoader } from "@/components/ui/dot-loader";
import type { DotFrame } from "@/components/ui/dot-loader-frames";

const myFrames: DotFrame[] = [
  { 0: "active", 1: "active", 2: "active" },
  { 7: "active", 8: "active", 9: "active" },
];

<DotLoader frames={myFrames} duration={150} />;
```

#### Props

| Prop           | Type         | Default  | Description                |
| -------------- | ------------ | -------- | -------------------------- |
| `frames`       | `DotFrame[]` | required | Array of animation frames  |
| `dotCount`     | `number`     | `49`     | Total dots in the grid     |
| `columns`      | `number`     | `7`      | Grid column count          |
| `isPlaying`    | `boolean`    | `true`   | Pause/resume animation     |
| `duration`     | `number`     | `120`    | Milliseconds per frame     |
| `repeatCount`  | `number`     | `-1`     | Loop count (-1 = infinite) |
| `onComplete`   | `() => void` | —        | Called when loops complete |
| `dotClassName` | `string`     | —        | Extra classes for each dot |
| `className`    | `string`     | —        | Extra classes for the grid |

## Frame Format

Each frame is a `Record<number, DotState>` mapping dot indices to states. Dots not in the record are inactive.

```
Grid indices (7x7):

 0  1  2  3  4  5  6
 7  8  9 10 11 12 13
14 15 16 17 18 19 20
21 22 23 24 25 26 27
28 29 30 31 32 33 34
35 36 37 38 39 40 41
42 43 44 45 46 47 48
```

### Dot States

| State          | CSS Variable       | Dark Mode            | Light Mode           | Purpose                     |
| -------------- | ------------------ | -------------------- | -------------------- | --------------------------- |
| `"active"`     | `--dot-active`     | `#f2f0ea` (Chalk)    | `#0e0e0e` (Pitch)    | R shape, foreground dots    |
| `"accent"`     | `--dot-accent`     | Ember at 55%         | Ember at 65%         | Ember field background glow |
| `"dissolve-1"` | `--dot-dissolve-1` | `#FAF8F5` (lightest) | `#2E2C2A` (darkest)  | Trail nearest to shape      |
| `"dissolve-2"` | `--dot-dissolve-2` | `#8C8A86` (medium)   | `#8C8A86` (medium)   | Trail mid-fade              |
| `"dissolve-3"` | `--dot-dissolve-3` | `#2E2C2A` (darkest)  | `#FAF8F5` (lightest) | Trail nearest to background |
| inactive       | `--dot-inactive`   | 12% foreground       | 12% foreground       | Empty grid dot              |

The `--dot-accent` variable derives from `--ember` via `color-mix()`, so it automatically updates if the brand accent color changes. Dissolve values are reversed between themes so the trail always fades toward the background.

## The R Shape

The branded "R" is defined in `dot-loader-frames.ts`:

```
 ●  ●  ●  ●  ●  .  ◌      top bar + dissolve-3 trail
 ●  .  .  .  .  ●  .      stem + bowl right
 ●  .  .  .  .  ●  .      stem + bowl right
 ●  ●  ●  ●  .  .  .      middle bar
 ●  .  .  ●  .  .  .      stem + diagonal leg
 ●  .  .  .  ●  .  .      stem + leg
 ●  .  .  .  .  ●  ◌      stem + leg end + dissolve-1 trail
```

Solid dots: `[0,1,2,3,4, 7,12, 14,19, 21,22,23,24, 28,31, 35,39, 42,47]`
Dissolve dots: `{6: "dissolve-3", 48: "dissolve-1"}`

To modify the R shape, edit `R_SOLID_DOTS` and `R_DISSOLVE` in `dot-loader-frames.ts`.

## Animation Phases

`generateRosterlyFrames()` produces ~42 frames in 5 phases. An ember field (random `"accent"` dots) is layered behind every frame, with density that fades in sync with the R formation:

| Phase              | Frames | Foreground                      | Ember Density    |
| ------------------ | ------ | ------------------------------- | ---------------- |
| 1. Scatter         | 12     | Random active dots flicker      | Full (30%)       |
| 2. Coalesce        | 10     | Dots migrate toward R positions | Fades to 0%      |
| 3. R Hold          | 5      | Clean R with dissolve trails    | 0% (silent)      |
| 4. Dissolve Out    | 10     | R fades from extremities inward | Reignites to 30% |
| 5. Back to Scatter | 5      | Transition to random            | Full (30%)       |

The function accepts a `seed` parameter for deterministic randomness. Change the seed for a different scatter pattern.

## Customization

### Change timing

```tsx
<DotLoader frames={frames} duration={80} />  // Faster
<DotLoader frames={frames} duration={200} /> // Slower
```

### Change dot size

```tsx
<DotLoader frames={frames} dotClassName="size-3 rounded-sm" />    // Larger
<DotLoader frames={frames} dotClassName="size-1 rounded-none" />   // Smaller, square
```

### Change grid gap

```tsx
<DotLoader frames={frames} className="gap-1" />
```

### Change ember density

Edit `MAX_DENSITY` in `generateRosterlyFrames()` (default `0.3`). Higher = more embers. The density curve (fade-in/out around the R hold) scales proportionally.

### Custom animation

```tsx
import type { DotFrame } from "@/components/ui/dot-loader-frames";

const pulseFrames: DotFrame[] = [
  { 0: "active", 1: "active", 2: "active", 3: "active", 4: "active", 5: "active", 6: "active" },
  { 7: "active", 8: "active", 9: "active", 10: "active", 11: "active", 12: "active", 13: "active" },
  // ...
];

<DotLoader frames={pulseFrames} duration={100} />;
```

### Adding a new shape

1. Map your shape onto the grid index diagram above
2. Export it from `dot-loader-frames.ts`:
   ```ts
   export const MY_SHAPE: DotFrame = {
     0: "active",
     1: "active", // ... your indices
   };
   ```
3. Build frames that transition to/from it, or use it as a static display

## Accessibility

- Container has `role="status"` and `aria-label="Loading"`
- Screen-reader-only "Loading" text included
- Respects `prefers-reduced-motion`: shows a static R instead of animating

## Files

| File                                     | Purpose                                                               |
| ---------------------------------------- | --------------------------------------------------------------------- |
| `src/components/ui/dot-loader.tsx`       | `DotLoader` and `RosterlyLoader` components                           |
| `src/components/ui/dot-loader-frames.ts` | R shape data, frame types, animation generator                        |
| `src/app/globals.css`                    | `--dot-*` CSS variables (`:root`, `.dark`, `.light`, `@theme inline`) |
