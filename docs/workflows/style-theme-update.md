# Rosterly — Style & Theme Update Guide

How to apply a new visual theme to the Rosterly frontend. This covers taking a theme from 21st.dev, shadcn's theme generator, or any other shadcn-compatible source, and applying it across the app — including dark mode and Clerk auth components.

## How the Design System Works

The entire visual identity of the app flows from one file: `src/app/globals.css`. Every color used by every component — buttons, cards, sidebars, inputs, badges — comes from CSS variables defined in that file. Change the variables, and the whole app updates. You never need to touch individual components.

The chain is:

```
globals.css (CSS variables)
  → @theme inline (registers variables as Tailwind utilities)
  → shadcn components use bg-primary, text-muted-foreground, etc.
  → Clerk auth components pick up the theme via AuthProvider
  → Dark mode handled by .dark class (next-themes)
```

---

## Applying a Theme (5 Minutes)

### Step 1: Get a Theme

Pick a theme from any of these sources:

| Source | What you get | URL |
|---|---|---|
| 21st.dev | Full component themes + CSS variables | https://21st.dev |
| shadcn Themes | Official base color themes | https://ui.shadcn.com/themes |
| shadcndesign | Generator with live preview | https://shadcndesign.com/theme-generator |
| gradient.page | Generate from a single brand color | https://gradient.page/tools/shadcn-ui-theme-generator |
| shadcn.rlabs.art | OKLCH generator with sacred geometry | https://shadcn.rlabs.art |

Every source outputs the same thing: a block of CSS variables for `:root` (light) and `.dark` (dark mode).

### Step 2: Replace the Variables in `globals.css`

Open `src/app/globals.css`. You'll see two blocks — `:root` and `.dark`. Replace them with the theme you copied.

**Before (current HSL theme):**

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... */
}
```

**After (example: pasting a new theme):**

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.45 0.2 260);
  /* ... rest of the theme */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.65 0.2 260);
  /* ... */
}
```

That's it. Save the file. Every component in the app updates instantly.

### Step 3: Update the `@theme inline` Block (If Switching to OKLCH)

Our current `@theme inline` block wraps values in `hsl()`. If your new theme uses OKLCH (which most modern generators do), you need to update the wrapper to use raw `var()` references instead:

**Current (HSL wrapping):**

```css
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  /* ... */
}
```

**Updated (works with both OKLCH and HSL):**

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

The key change: remove the `hsl()` wrapper. When the CSS variables already contain the full color value (like `oklch(0.45 0.2 260)`), wrapping them in `hsl()` breaks things. Using raw `var()` references works regardless of the color format.

### Step 4: Update the `body` Base Styles

Same idea — remove `hsl()` if switching to OKLCH:

```css
/* Before */
body {
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

* {
  border-color: hsl(var(--border));
}

/* After (works with any color format) */
body {
  color: var(--foreground);
  background: var(--background);
}

* {
  border-color: var(--border);
}
```

---

## What About the Components?

You don't need to change them. All shadcn components use Tailwind utilities like `bg-primary`, `text-muted-foreground`, `border-border`. These resolve to your CSS variables through the `@theme inline` block. New theme → new colors → all components update.

If a theme source also gives you updated component code (like 21st.dev sometimes does), you can replace individual files in `src/components/ui/`. But this is optional — the CSS variables alone handle the color change.

---

## Clerk Auth Components (Sign-in, Sign-up, UserButton)

Clerk's UI components have their own internal styling. Our `AuthProvider` already syncs the Clerk theme with the app's dark/light mode:

```tsx
// src/components/providers/auth-provider.tsx
<ClerkProvider
  appearance={{
    baseTheme: resolvedTheme === "dark" ? dark : undefined,
  }}
/>
```

This handles light/dark switching automatically. But if you want Clerk's components to match your brand colors more closely, you can add Clerk appearance overrides:

```tsx
<ClerkProvider
  appearance={{
    baseTheme: resolvedTheme === "dark" ? dark : undefined,
    variables: {
      colorPrimary: "oklch(0.45 0.2 260)",  // Match your --primary
      borderRadius: "0.5rem",                 // Match your --radius
    },
    elements: {
      // Override specific elements if needed
      formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
      card: "shadow-none border border-border",
    },
  }}
/>
```

The `variables` approach is preferred for basic brand matching. The `elements` approach gives you full Tailwind class control over individual Clerk components.

---

## The Full Variable Reference

Every variable, what it controls, and where it shows up:

| Variable | Controls | Example usage |
|---|---|---|
| `--background` | Page background | `bg-background` |
| `--foreground` | Default text color | `text-foreground` |
| `--primary` | Buttons, links, active states | `bg-primary` |
| `--primary-foreground` | Text on primary backgrounds | `text-primary-foreground` |
| `--secondary` | Secondary buttons, subtle highlights | `bg-secondary` |
| `--secondary-foreground` | Text on secondary backgrounds | `text-secondary-foreground` |
| `--muted` | Disabled states, subtle backgrounds | `bg-muted` |
| `--muted-foreground` | Placeholder text, captions | `text-muted-foreground` |
| `--accent` | Hover states, sidebar highlights | `bg-accent` |
| `--accent-foreground` | Text on accent backgrounds | `text-accent-foreground` |
| `--destructive` | Delete buttons, error states | `bg-destructive` |
| `--destructive-foreground` | Text on destructive backgrounds | `text-destructive-foreground` |
| `--card` | Card backgrounds | `bg-card` |
| `--card-foreground` | Text in cards | `text-card-foreground` |
| `--popover` | Dropdown/popover backgrounds | `bg-popover` |
| `--popover-foreground` | Text in popovers | `text-popover-foreground` |
| `--border` | All borders | `border-border` |
| `--input` | Input field borders | `border-input` |
| `--ring` | Focus rings | `ring-ring` |
| `--radius` | Border radius base | Computed into `rounded-sm/md/lg/xl` |

---

## Adding Brand Colors Beyond the Base Theme

If you need additional colors (e.g., a `--success` or `--warning`), add them to all three places:

```css
/* 1. Define the variable */
:root {
  --success: oklch(0.72 0.19 149);
  --success-foreground: oklch(0.98 0.01 149);
}

.dark {
  --success: oklch(0.45 0.15 149);
  --success-foreground: oklch(0.98 0.01 149);
}

/* 2. Register with Tailwind */
@theme inline {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
}
```

Now you can use `bg-success`, `text-success-foreground` in any component.

---

## Typography

The current font stack is `system-ui, -apple-system, sans-serif` (set in the `body` rule in `globals.css`). To use a custom font:

1. Add the font to `src/app/layout.tsx` using `next/font`:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      {/* ... */}
    </html>
  );
}
```

2. Reference it in `globals.css`:

```css
body {
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

3. If you want a separate heading font, add a second `next/font` import with a different variable name (e.g., `--font-heading`) and apply it to heading elements.

---

## Border Radius

The `--radius` variable controls the base radius. All components derive from it:

```css
:root {
  --radius: 0.5rem;    /* Default: medium roundness */
}
```

The `@theme inline` block computes four sizes from this base:

| Utility | Computed value | When `--radius: 0.5rem` |
|---|---|---|
| `rounded-sm` | `--radius - 4px` | ~0.25rem |
| `rounded-md` | `--radius - 2px` | ~0.375rem |
| `rounded-lg` | `--radius` | 0.5rem |
| `rounded-xl` | `--radius + 4px` | ~0.75rem |

Common values: `0` for sharp edges, `0.375rem` for subtle rounding, `0.5rem` for standard, `0.75rem` for soft, `1rem` for pill-like.

---

## Verifying the Theme

After applying a theme, check these pages:

1. **Landing page** (`/`) — overall first impression, button colors, text contrast
2. **Sign-in page** (`/sign-in`) — Clerk components should match the theme
3. **Athlete dashboard** (`/dashboard`) — cards, stats grid, sidebar active state
4. **Coach dashboard** (`/coach/dashboard`) — org switcher, badges, card backgrounds
5. **Toggle dark mode** — everything should feel intentional in both modes

Use your browser's DevTools to check contrast ratios. The WCAG AA minimum is 4.5:1 for normal text and 3:1 for large text. OKLCH themes from the generators above are usually pre-checked, but verify if you're creating custom values.
