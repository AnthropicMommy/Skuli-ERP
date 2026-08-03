# Skuli Design System — "Quiet Precision"

A dark-mode-first, Resend/Vercel-inspired design system for school management platforms.

**Primary accent:** Light cyan-blue (`#7DD3FC`)
**For your project:** Replace with basil green (`#4CAF50` or similar)

---

## 1. Design Philosophy

The design follows **"Quiet Precision"** — minimal chrome, maximum content density, no visual noise. Every element earns its space.

**Core principles:**
- Dark-mode-first (black backgrounds, subtle surfaces)
- Muted, desaturated status colors (no neon)
- Generous whitespace, tight typography
- Subtle borders (white at 8% opacity), no heavy dividers
- Accent color used sparingly (buttons, links, active states only)

**Where this came from:** The aesthetic is directly inspired by [Resend](https://resend.com), [Vercel](https://vercel.com), and [Linear](https://linear.app) — developer tools that pioneered the "dark + minimal" look. We adapted it for a Kenyan school management context.

---

## 2. Color System (CSS Variables)

All colors are defined as CSS custom properties in `globals.css`. To port this to another project, copy the `:root` block and swap the accent color.

### Dark Mode (Primary)

```css
:root, .dark {
  /* Base surfaces */
  --background: #0A0A0A;       /* Almost black — main page bg */
  --surface: #111111;           /* Cards, panels */
  --surface-hover: #1A1A1A;    /* Hover states */
  --card: #111111;

  /* Borders — subtle white overlays */
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.18);

  /* Text hierarchy */
  --text-primary: #FAFAFA;           /* Headings, primary text */
  --text-secondary: rgba(255, 255, 255, 0.65);  /* Body text */
  --text-tertiary: rgba(255, 255, 255, 0.40);   /* Captions, labels */

  /* Accent — YOUR COLOR GOES HERE */
  --primary: #7DD3FC;           /* Skuli: light cyan. Your project: basil green */
  --primary-foreground: #0A0A0A; /* Text on accent bg */

  /* Status — desaturated, quiet */
  --success: #3B9B6E;           /* Muted green */
  --destructive: #B85450;       /* Muted red */
  --danger: #B85450;

  /* Radius */
  --radius: 0.625rem;           /* 10px — slightly rounded */
}
```

### Light Mode (Optional)

```css
:root:not(.dark) {
  --background: #FAFAFA;
  --surface: #FFFFFF;
  --surface-hover: #F5F5F5;
  --border: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.18);
  --text-primary: #0A0A0A;
  --text-secondary: rgba(0, 0, 0, 0.65);
  --text-tertiary: rgba(0, 0, 0, 0.40);
  --primary: #0EA5E9;           /* Your project: basil green */
  --primary-foreground: #FFFFFF;
}
```

### Basil Green Conversion

Replace `--primary` values:

| Mode | Skuli (Cyan) | Your Project (Basil Green) |
|------|-------------|---------------------------|
| Dark | `#7DD3FC` | `#4CAF50` or `#66BB6A` |
| Light | `#0EA5E9` | `#388E3C` or `#2E7D32` |
| Ring | `#7DD3FC` | `#4CAF50` |
| Chart 1 | `#7DD3FC` | `#4CAF50` |

Also update the `accent-glow` box-shadow:
```css
.accent-glow {
  box-shadow: 0 0 40px -10px rgba(76, 175, 80, 0.25); /* basil green glow */
}
```

---

## 3. Typography

**Font:** Geist Sans (primary), Geist Mono (code)

```css
--font-sans: "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
```

**Loaded via:**
```tsx
import { Geist, Geist_Mono } from "next/font/google";
```

**Headings:** Use `font-semibold` or `font-medium`, tracking `[-0.02em]`. Never bold (weight 700) on large text — it looks heavy on dark backgrounds.

**Body:** `text-sm` (14px) or `text-base` (16px). Line height `leading-relaxed` (1.625).

**Small labels:** `text-xs` (12px), `text-[var(--text-tertiary)]`, sometimes `uppercase tracking-wider`.

---

## 4. Component Patterns

### Cards
```tsx
<div className="bg-[var(--surface)] rounded-xl border border-border p-5">
  {/* Content */}
</div>
```
- Background: `var(--surface)` (#111)
- Border: `var(--border)` (white at 8%)
- Border radius: `rounded-xl` (12px)
- Padding: `p-5` (20px) or `p-6` (24px)

### Buttons
```tsx
{/* Primary (accent) */}
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">

{/* Secondary (ghost) */}
<button className="border border-border text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition-all">
```

### Input Fields
```tsx
<input className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-[var(--background)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:outline-none" />
```

### Status Badges
```tsx
<span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20">
  Active
</span>
```

### Feature Grid (Landing Page)
```tsx
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
  {features.map(f => (
    <div className="bg-[var(--surface)] p-5 sm:p-6 lg:p-8 hover:bg-[var(--surface-hover)] transition-colors">
      {/* icon, title, description */}
    </div>
  ))}
</div>
```
Note: Uses `gap-px` with `bg-border` for hairline dividers between cells.

---

## 5. Layout Patterns

### Container
```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
@media (min-width: 640px) { padding: 0 1.5rem; }
@media (min-width: 1024px) { padding: 0 2.5rem; }
```

### Page Sections
```tsx
<section className="py-16 sm:py-24 lg:py-32 relative">
  <div className="container">
    {/* Content */}
  </div>
</section>
```

### Student Dashboard Layout
- Sidebar: collapsible on mobile, fixed on desktop
- Main content: full-width with `max-w-3xl` for forms, full for dashboards
- Cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

---

## 6. Animations

### Scroll Reveal
```tsx
// Component
<div className="reveal is-visible">Content</div>

// CSS
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1),
              transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Staggered Delays
```tsx
<ScrollReveal delay={60}>Item 1</ScrollReveal>
<ScrollReveal delay={120}>Item 2</ScrollReveal>
<ScrollReveal delay={180}>Item 3</ScrollReveal>
```

### Parallax (Landing Page Hero)
```tsx
const parallaxOffset = useScrollParallax(0.15);
<div style={{ transform: `translateY(${parallaxOffset}px)` }} />
```

### Hover Interactions
- Cards: `hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]`
- Buttons: `hover:scale-[0.98] active:scale-[0.97]`
- Links: `hover:text-[var(--text-primary)]` (from secondary to primary)

---

## 7. Special Effects

### Accent Glow (CTA buttons)
```css
.accent-glow {
  box-shadow: 0 0 40px -10px rgba(125, 211, 252, 0.25);
}
```
Use on primary CTAs only. Very subtle.

### Grid Background (Hero)
```css
.grid-bg {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}
```

### Radial Gradient Overlay
```tsx
<div className="absolute inset-0" style={{
  background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(125, 211, 252, 0.06), transparent)"
}} />
```

---

## 8. Dark/Light Toggle

Toggle stored in `localStorage` as `skuli-theme`. Applied via inline script in `<head>` to prevent flash:

```tsx
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    var t = localStorage.getItem('skuli-theme');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  })();
`}} />
```

The `<html>` tag starts with class `dark` and toggles via `ThemeProvider`.

---

## 9. Icons

All icons are inline SVGs from [Heroicons](https://heroicons.com) (outline style, 1.5px stroke). Never use icon libraries — keep bundle small.

```tsx
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" d="..." />
</svg>
```

---

## 10. PWA Support

```json
// manifest.json
{
  "name": "Skuli",
  "short_name": "Skuli",
  "theme_color": "#0A0A0A",
  "background_color": "#0A0A0A",
  "display": "standalone",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 11. Quick Start for Your Project

1. Copy `globals.css` color variables
2. Replace `--primary: #7DD3FC` with `--primary: #4CAF50` (basil green)
3. Replace `--ring: #7DD3FC` with `--ring: #4CAF50`
4. Update `accent-glow` rgba to green
5. Update `accent-glow` in landing page hero/CTA sections
6. Copy component patterns (cards, buttons, inputs)
7. Copy scroll reveal animation CSS
8. Install Geist font
9. Set up dark mode toggle with localStorage

The rest is structural — same layout, same patterns, different content.
