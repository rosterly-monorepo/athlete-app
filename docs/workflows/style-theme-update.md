# Rosterly — Style & Theme Update Guide

How to apply a new visual theme to the Rosterly frontend. This covers taking a theme from a brand kit, shadcn generator, or any other source, and applying it across the app — including dark mode, Clerk auth components, and custom brand tokens.

## Current Theme: Pitch + Ember

The app uses the **Rosterly Brand Kit** — a warm, dark-first palette centered on Ember (`#E8614A`) as the single accent color. The design avoids cool grays in favor of warm neutrals throughout.

### Dark Mode Palette (default)

| Name      | Hex / Value               | Token           | Usage                          |
| --------- | ------------------------- | --------------- | ------------------------------ |
| Pitch     | `#0E0E0E`                 | `--background`  | Page background                |
| Carbon    | `#161616`                 | `--card`        | Cards, popovers, sidebar       |
| Ash       | `#252525`                 | `--border`      | Borders, dividers              |
| Chalk     | `#F2F0EA`                 | `--foreground`  | Body text (warm off-white)     |
| Ember     | `#E8614A`                 | `--primary`     | Buttons, links, focus rings    |
| Ember 20% | `rgba(232, 97, 74, 0.20)` | `--ember-alpha` | Subtle highlights, hover tints |
| Verified  | `#4CAF7D`                 | `--verified`    | Verified badges, success       |

### Light Mode Palette

| Name      | Hex / Value               | Token           | Usage                        |
| --------- | ------------------------- | --------------- | ---------------------------- |
| Linen     | `#F5F3EE`                 | `--background`  | Page background (warm cream) |
| White     | `#FFFFFF`                 | `--card`        | Cards, popovers              |
| Stone     | `#D4D0C8`                 | `--border`      | Borders (warm gray)          |
| Pitch     | `#0E0E0E`                 | `--foreground`  | Body text                    |
| Ember     | `#E8614A`                 | `--primary`     | Same accent in both modes    |
| Ember 15% | `rgba(232, 97, 74, 0.15)` | `--ember-alpha` | Subtle highlights            |
| Verified  | `#2E7D52`                 | `--verified`    | Darker green for light bg    |

---

## How the Design System Works

The entire visual identity flows from one file: `src/app/globals.css`. Every color used by every component — buttons, cards, sidebars, inputs, badges — comes from CSS variables defined in that file. Change the variables, and the whole app updates.

The chain is:

```
globals.css (CSS variables)
  → @theme inline (registers variables as Tailwind utilities)
  → shadcn components use bg-primary, text-muted-foreground, etc.
  → Clerk auth components pick up the theme via AuthProvider
  → Dark mode handled by .dark class (next-themes)
```

### Three blocks in `globals.css`

| Block    | Purpose                                             |
| -------- | --------------------------------------------------- |
| `:root`  | Dark theme (default — dark-first design)            |
| `.dark`  | Dark theme (explicit class toggle from next-themes) |
| `.light` | Light theme                                         |

Both `:root` and `.dark` should have identical values. The `:root` block ensures dark mode works before JavaScript hydrates the page.

---

## Applying a New Theme

### Step 1: Get a Theme

Pick a theme from any of these sources, or design one from a brand kit:

| Source        | What you get                          |
| ------------- | ------------------------------------- |
| Brand kit PDF | Color swatches → manual mapping       |
| 21st.dev      | Full component themes + CSS variables |
| shadcn Themes | Official base color themes            |
| shadcndesign  | Generator with live preview           |
| gradient.page | Generate from a single brand color    |

### Step 2: Replace the Variables in `globals.css`

Open `src/app/globals.css`. Replace the values in `:root`, `.dark`, and `.light` blocks.

**Current format — hex and rgba values (no wrapping):**

```css
:root {
  --background: #0e0e0e;
  --foreground: #f2f0ea;
  --primary: #e8614a;
  --accent: rgba(232, 97, 74, 0.08);
  /* ... */
}
```

The `@theme inline` block uses raw `var()` references, so any color format works (hex, rgba, oklch):

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... */
}
```

### Step 3: Update Custom Brand Tokens

Beyond the standard shadcn tokens, we register three custom brand tokens:

```css
/* In :root / .dark / .light */
--ember: #e8614a;
--ember-alpha: rgba(232, 97, 74, 0.2);
--verified: #4caf7d;

/* In @theme inline */
--color-ember: var(--ember);
--color-ember-alpha: var(--ember-alpha);
--color-verified: var(--verified);
```

These enable Tailwind classes like `text-ember`, `bg-ember-alpha`, `text-verified`, `border-ember/50`, etc. Use them for brand-specific styling that goes beyond the standard shadcn palette (e.g., recruitment card stats, priority badges, verified indicators).

When adding new brand tokens, always add them to all three places:

1. `:root` block (dark default)
2. `.dark` block (explicit dark)
3. `.light` block (with an appropriate light-mode variant)
4. `@theme inline` block (register with Tailwind)

### Step 4: Update Clerk Appearance

The `AuthProvider` at `src/components/providers/auth-provider.tsx` syncs Clerk components with the brand:

```tsx
<ClerkProvider
  appearance={{
    baseTheme: resolvedTheme === "dark" ? dark : undefined,
    variables: {
      colorPrimary: "#E8614A", // Match your --primary
    },
  }}
/>
```

Update `colorPrimary` whenever `--primary` changes. Additional Clerk overrides are available:

```tsx
variables: {
  colorPrimary: "#E8614A",
  borderRadius: "0.75rem",         // Match --radius
  colorBackground: "#161616",       // Match --card (for dark)
}
```

The `elements` key gives full Tailwind class control over individual Clerk components if needed.

---

## What About the Components?

You generally don't need to change them. All shadcn components use Tailwind utilities like `bg-primary`, `text-muted-foreground`, `border-border`. These resolve to your CSS variables through the `@theme inline` block. New theme → new colors → all components update.

**Exception**: Components that use hardcoded color classes (e.g., `text-red-400`, `bg-blue-950/30`) won't update automatically. These need manual changes. Examples in our codebase:

- `recruitment/priority-badge.tsx` — uses `text-ember`, `text-verified` (brand tokens)
- `recruitment/recruitment-card.tsx` — uses `bg-ember` for avatar fallbacks, `text-ember` for stats
- `recruitment/rating-stars.tsx` — uses `fill-yellow-400` (intentionally universal, not brand-colored)

When writing new components, prefer `bg-primary` / `text-primary` over hardcoding `bg-ember` unless the color should stay fixed regardless of theme changes.

---

## The Full Variable Reference

Every variable, what it controls, and where it shows up:

| Variable                   | Controls                             | Example usage                       |
| -------------------------- | ------------------------------------ | ----------------------------------- |
| `--background`             | Page background                      | `bg-background`                     |
| `--foreground`             | Default text color                   | `text-foreground`                   |
| `--primary`                | Buttons, links, active states        | `bg-primary`                        |
| `--primary-foreground`     | Text on primary backgrounds          | `text-primary-foreground`           |
| `--secondary`              | Secondary buttons, subtle highlights | `bg-secondary`                      |
| `--secondary-foreground`   | Text on secondary backgrounds        | `text-secondary-foreground`         |
| `--muted`                  | Disabled states, subtle backgrounds  | `bg-muted`                          |
| `--muted-foreground`       | Placeholder text, captions           | `text-muted-foreground`             |
| `--accent`                 | Hover states, sidebar highlights     | `bg-accent`                         |
| `--accent-foreground`      | Text on accent backgrounds           | `text-accent-foreground`            |
| `--destructive`            | Delete buttons, error states         | `bg-destructive`                    |
| `--destructive-foreground` | Text on destructive backgrounds      | `text-destructive-foreground`       |
| `--card`                   | Card backgrounds                     | `bg-card`                           |
| `--card-foreground`        | Text in cards                        | `text-card-foreground`              |
| `--popover`                | Dropdown/popover backgrounds         | `bg-popover`                        |
| `--popover-foreground`     | Text in popovers                     | `text-popover-foreground`           |
| `--border`                 | All borders                          | `border-border`                     |
| `--input`                  | Input field borders                  | `border-input`                      |
| `--ring`                   | Focus rings                          | `ring-ring`                         |
| `--radius`                 | Border radius base                   | Computed into `rounded-sm/md/lg/xl` |
| `--ember`                  | Brand accent (direct use)            | `text-ember`, `bg-ember/10`         |
| `--ember-alpha`            | Brand accent at low opacity          | `bg-ember-alpha`                    |
| `--verified`               | Verified/success green               | `text-verified`, `bg-verified/10`   |

---

## Typography

The font stack is **Inter** loaded via `next/font` in `src/app/layout.tsx`, registered as `--font-sans`:

```tsx
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
```

Referenced in `globals.css`:

```css
body {
  font-family:
    var(--font-sans),
    system-ui,
    -apple-system,
    sans-serif;
}
```

To switch fonts, change the `next/font` import in `layout.tsx`. The CSS variable cascades everywhere automatically.

---

## Border Radius

The `--radius` variable controls the base radius. Currently set to `0.75rem` (12px — soft rounding). All components derive from it:

| Utility      | Computed value   | Current result |
| ------------ | ---------------- | -------------- |
| `rounded-sm` | `--radius - 4px` | ~0.5rem        |
| `rounded-md` | `--radius - 2px` | ~0.625rem      |
| `rounded-lg` | `--radius`       | 0.75rem        |
| `rounded-xl` | `--radius + 4px` | ~1rem          |

---

## Verifying a Theme Change

After applying a theme, check these pages:

1. **Landing page** (`/`) — overall first impression, button colors, text contrast
2. **Sign-in page** (`/sign-in`) — Clerk components should match the theme
3. **Athlete dashboard** (`/dashboard`) — cards, stats grid, sidebar active state
4. **Coach dashboard** (`/coach/dashboard`) — org switcher, badges, card backgrounds
5. **Recruiting board** (`/coach/recruiting/[id]`) — kanban columns, card styling, drag overlay, "+ Add" buttons
6. **Toggle dark/light mode** — everything should feel intentional in both modes

Use your browser's DevTools to check contrast ratios. The WCAG AA minimum is 4.5:1 for normal text and 3:1 for large text.
