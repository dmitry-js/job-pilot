# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Homepage conventions

Source: `context/designs/landing-page.png`. Composition: navbar, pastel hero, dashboard preview, alternating feature grids, testimonial, pastel closing CTA, footer. The desktop frame is 1280px wide. Feature grids stack below 768px. Tokens and shared `landing-*` classes live in `app/globals.css`; Inter is loaded in `app/layout.tsx`.

The screenshot governs homepage specific exceptions to general UI rules. Marketing preview assets and copy are reproduced as supplied; they do not implement the out of scope features illustrated inside them.

Shared styles: `landing-nav-link`, `landing-button-primary`, `landing-button-secondary`, `landing-feature-heading`, `landing-divider`, `landing-glow`. Their exact definitions are in `app/globals.css`. Focus rings and reduced motion handling are global.

### Component registry


#### ClosingCta

File: `components/homepage/ClosingCta.tsx`

Exact static class strings:

- `landing-divider`
- `landing-glow flex min-h-103 flex-col items-center justify-center px-6 py-16 text-center`
- `max-w-190 text-3xl leading-[1.08] font-semibold tracking-[-0.05em] text-text-slate sm:text-[54px]`
- `mt-7 mb-7 text-base leading-7 text-text-darker sm:text-lg`

#### CtaLinks

File: `components/homepage/CtaLinks.tsx`

Exact static class strings:

- `flex flex-wrap items-center justify-center gap-4`
- `landing-button-primary px-6`
- `ml-1 text-xs text-surface/70`
- `landing-button-secondary px-6`

#### DashboardPreview

File: `components/homepage/DashboardPreview.tsx`

Exact static class strings:

- `border-t border-border bg-surface-tertiary/60 px-3 py-6 sm:px-10 sm:py-8`
- `h-auto w-full`

#### FeatureSection

File: `components/homepage/FeatureSection.tsx`

Exact static class strings:

- `grid border-b border-border md:grid-cols-2`
- `landing-feature-heading`
- `text-3xl leading-[1.12] font-semibold tracking-[-0.045em] text-text-slate sm:text-[46px]`
- `border-t border-border pl-5 sm:pl-12`
- `text-lg leading-6 font-semibold text-text-darker`
- `mt-3 text-base leading-7 text-text-secondary sm:text-lg`
- `h-auto w-full`

Conditional classes: `md:col-start-2 md:row-start-1`; `min-h-38 border-l px-5 py-7 sm:px-6` with `border-success`, `border-accent`, or `border-border/60`; `flex min-w-0 items-center justify-center border-border bg-background px-6 py-14` with `md:col-start-1 md:row-start-1 md:border-r md:px-13` or `md:border-l`.

Heading classes: `text-3xl leading-[1.12] font-semibold tracking-[-0.045em] text-text-slate sm:text-[46px]`, with `max-w-120` on the first feature section to preserve the reference line break.

#### Features

File: `components/homepage/Features.tsx`

Exact static class strings:

- `landing-divider`

#### Hero

File: `components/homepage/Hero.tsx`

Exact static class strings:

- `landing-glow flex min-h-104 flex-col items-center justify-center px-5 py-14 text-center sm:px-10`
- `max-w-4xl text-4xl leading-[1.08] font-bold tracking-[-0.055em] text-text-slate sm:text-[64px]`
- `mt-6 mb-6 max-w-160 text-base leading-7 text-text-secondary sm:text-lg`

#### Testimonial

File: `components/homepage/Testimonial.tsx`

Exact static class strings:

- `px-6 py-15 text-center sm:px-20 sm:py-16`
- `text-xs font-medium tracking-widest text-accent-dark`
- `mx-auto mt-6 max-w-230`
- `text-xl leading-[1.45] font-medium tracking-[-0.02em] text-text-darker sm:text-[32px]`
- `mt-6 flex items-center justify-center gap-3 text-left`
- `rounded-md`
- `text-sm font-semibold text-text-black`
- `mt-1 text-sm text-text-secondary`

#### Brand

File: `components/layout/Brand.tsx`

Exact static class strings:

- `inline-flex min-h-11 shrink-0 items-center rounded-sm`
- `h-auto w-31`

#### Footer

File: `components/layout/Footer.tsx`

Exact static class strings:

- `mx-auto flex min-h-34 max-w-7xl flex-col items-center justify-between gap-5 border-x border-border px-6 py-8 sm:flex-row sm:px-10 max-[1328px]:mx-6 max-sm:mx-4`
- `flex flex-wrap justify-center gap-x-8 text-sm text-text-darker`
- `landing-nav-link`

#### Navbar

File: `components/layout/Navbar.tsx`

Exact static class strings:

- `border-b border-border bg-surface`
- `mx-auto grid min-h-20 max-w-7xl grid-cols-2 items-center gap-x-4 px-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:px-0 sm:py-0 max-[1328px]:sm:mx-6`
- `col-span-2 row-start-2 flex justify-center gap-8 text-sm text-text-darker sm:col-span-1 sm:col-start-2 sm:row-start-1`
- `landing-nav-link`
- `landing-button-primary col-start-2 row-start-1 justify-self-end px-5 text-sm sm:col-start-3`
