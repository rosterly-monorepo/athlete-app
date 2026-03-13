# Whoop-Inspired Dark-First Theme Overhaul

## Context

The frontend currently uses a Twitter-inspired light-first theme (blue primary, white backgrounds, Open Sans). We're overhauling it to a **Whoop.com-inspired dark-first premium athletic aesthetic** — near-black backgrounds, electric indigo accent, Inter font, minimal borders, frosted glass effects. Dark mode becomes the default experience.

## Inspiration: Whoop Design DNA

- Dark-first: near-black backgrounds, subtle card elevation via background contrast
- Electric indigo accent (#6366f1) for CTAs and interactive elements
- Clean sans-serif typography (Inter), bold headings, lighter body text
- Minimal borders/shadows — cards use background contrast, not heavy decoration
- Generous whitespace, premium feel, smooth transitions
- Frosted glass effects (backdrop-blur) on overlays and sticky nav

---

## Phase 1: Design Tokens (`src/app/globals.css`)

Replace `:root` and `.dark` color blocks. Dark values become `:root` default.

**Dark theme (`:root` and `.dark`):**
| Token | Value | Notes |
|-------|-------|-------|
| `--background` | `#0a0a0a` | Near-black |
| `--foreground` | `#fafafa` | Near-white |
| `--card` | `#141414` | Subtle lift |
| `--card-foreground` | `#f0f0f0` | |
| `--popover` | `#141414` | |
| `--popover-foreground` | `#f0f0f0` | |
| `--primary` | `#6366f1` | Indigo-500 |
| `--primary-foreground` | `#ffffff` | |
| `--secondary` | `#1e1e1e` | |
| `--secondary-foreground` | `#e0e0e0` | |
| `--muted` | `#1a1a1a` | |
| `--muted-foreground` | `#a0a0a0` | |
| `--accent` | `#1a1a2e` | Dark indigo tint |
| `--accent-foreground` | `#818cf8` | Indigo-400 |
| `--destructive` | `#ef4444` | |
| `--destructive-foreground` | `#ffffff` | |
| `--border` | `#262626` | |
| `--input` | `#1e1e1e` | |
| `--ring` | `#6366f1` | |
| `--sidebar` | `#111111` | |
| `--sidebar-*` | Match card/border pattern | |

**Light theme (`.light`):**
| Token | Value |
|-------|-------|
| `--background` | `#fafafa` |
| `--foreground` | `#0a0a0a` |
| `--card` | `#ffffff` |
| `--primary` | `#4f46e5` (indigo-600) |
| `--secondary` | `#f1f1f1` |
| `--muted` | `#f1f1f1` |
| `--muted-foreground` | `#6b6b6b` |
| `--accent` | `#eef2ff` (indigo-50) |
| `--accent-foreground` | `#4f46e5` |
| `--border` | `#e5e5e5` |
| `--input` | `#f5f5f5` |

**Other changes:**

- `--radius`: `1.3rem` → `0.75rem` (tighter, more premium)
- `--font-sans`: `Inter, system-ui, -apple-system, sans-serif`
- Chart colors: indigo, green, amber, cyan, red
- Shadow color: `rgba(99, 102, 241, 0.08)`

---

## Phase 2: Font Loading (`src/app/layout.tsx`)

- Import `Inter` from `next/font/google` with `variable: "--font-sans"`
- Add `inter.variable` to `<body>` className
- Update header: `bg-background/80 backdrop-blur-md border-border/50 sticky top-0 z-40`
- Update footer border: `border-border/50`

---

## Phase 3: Dark Default (`src/components/providers/index.tsx`)

- Change `defaultTheme="system"` → `defaultTheme="dark"` (line 17)

---

## Phase 4: shadcn Component Refinements

### `button.tsx`

- Base: `transition-colors` → `transition-all duration-200`
- Default variant: add `hover:shadow-md hover:shadow-primary/20`
- Outline: `border-input` → `border-border/50`
- Size lg: `h-10` → `h-11`

### `card.tsx`

- Base: remove `shadow-sm`, change to `border-border/50 bg-card text-card-foreground rounded-xl border`
- Add `transition-colors duration-200`

### `input.tsx`

- `border-input` → `border-border/50`
- `dark:bg-input/30` → `bg-input/50`
- Add `focus-visible:border-primary`

### `badge.tsx`

- `rounded-md` → `rounded-full` (pill shape)
- Default variant: `bg-primary/10 text-primary border-primary/20` (glassy)
- Secondary variant: add `border-border/50`

### `dialog.tsx`

- Overlay: add `backdrop-blur-sm`, `bg-black/60`
- Content: `bg-background` → `bg-card`

### `sheet.tsx`

- Overlay: add `backdrop-blur-sm`
- Content: `bg-background` → `bg-card`

### `select.tsx`

- Trigger: same border treatment as input
- Content: add `backdrop-blur-sm`

### `dropdown-menu.tsx`

- Content: add `backdrop-blur-sm`

### `skeleton.tsx`

- `bg-primary/10` → `bg-muted`

### `avatar.tsx`

- Fallback: `bg-muted` → `bg-primary/10 text-primary`

### `table.tsx`

- Row hover: `hover:bg-muted/50` → `hover:bg-accent/50`

---

## Phase 5: Composed Components

### `nav-sidebar.tsx` + `coach-nav-sidebar.tsx`

- Desktop aside: `bg-card` → `bg-card/50`, `border-border` → `border-border/50`
- Active nav items: replace `variant="secondary"` with `variant="ghost"` + `bg-primary/10 text-primary font-medium`
- Inactive items: keep `text-muted-foreground`

### `athlete-card.tsx`

- Add `hover:border-primary/30 transition-all duration-200`

### `cookie-consent.tsx`

- `bg-background` → `bg-card`, add `backdrop-blur-md`

### `global-nav.tsx`, `stats-grid.tsx`, `theme-toggle.tsx`

- No changes needed — CSS variables handle the restyling

---

## Phase 6: Page-Level Polish

- **Home page**: Consider larger hero text sizing for impact
- **Athletes directory / profile**: No structural changes — CSS variables do the work
- **Recruitment columns**: Update `STAGE_COLORS` to dark-first values (remove `dark:` prefix pattern)
- **Priority badges**: Simplify to dark-first color classes

---

## Verification

1. Open app fresh (no stored theme) — should render dark
2. Toggle to light mode — all elements readable with proper contrast
3. Visit every major page: `/`, `/athletes`, `/athletes/[id]`, `/dashboard`, `/profile`, `/coach/dashboard`, `/coach/recruiting/[id]`
4. Check Clerk components match theme (sign-in modals)
5. Run `npm run build` — no errors
6. Contrast check: `#a0a0a0` on `#0a0a0a` = 10.3:1 (AAA), `#6366f1` on `#0a0a0a` = 4.6:1 (AA)
