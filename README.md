# Buynidify — Web

Marketing landing page for Buynidify, the fractional real estate marketplace
for investors, tenants, and companies.

This is the **v1 design/demo repo** — front end only, no backend yet. Colors,
copy, and images are all placeholders meant to be swapped as the brand
direction is finalized.

## Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)

## Getting started

```bash
npm install
npm run dev       # local dev server, http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

## Project structure

```
src/
  components/        shared UI: Navbar, Footer, Button, icons
  sections/          one file per marketing-page section (Hero, HowItWorks, ...)
  pages/
    LandingPage.tsx   the public marketing page (route: /)
  lib/content.ts      marketing-page copy + data
  app/                the actual product app (route: /app/*)
    AppLayout.tsx      sidebar nav + role toggle, wraps every app page
    context/RoleContext.tsx   Investor/Tenant role, persisted to localStorage
    data/mockData.ts   all app mock data (properties, tenant demand, deals...)
    components/        PropertyCard, MapPlaceholder
    pages/              Marketplace, Search, HowItWorks, Relocate, B2B,
                        TenantDemand, Deals, Premium, Billing, Support
  index.css            Tailwind entry + design tokens (@theme block)
App.tsx               React Router routes: "/" -> LandingPage, "/app/*" -> AppLayout
```

## The product app (`/app`)

Everything below is mock-data-only, no backend, matching the "front end +
Figma, one week, mock data" scope from the demo contract:

- **Role toggle** (Investor / Tenant) in the sidebar, persisted across
  reloads. "+ Become an Investor / Become a Tenant" simulates one identity
  holding both roles.
- **Marketplace** — investor view: paste-a-link AI analyzer (fake, just
  delays and shows a mock score) + grid of listed properties. Tenant view:
  rent-framed grid with a working "Express interest" button.
- **Search** — sale-only listings with real client-side filters (beds,
  price, type, furnished, washing machine in-unit, parking, pets) and a
  List/Map toggle. The map is an illustrative placeholder (pins positioned
  by city, not a real tile provider) showing listed properties vs. tenant
  demand side by side.
- **Tenant Demand** (investor-only) — the "missing half" of the platform
  per the MVP scope doc: properties tenants want that nobody's bought yet,
  with a working "I'm interested in buying this" action.
- **Deal Tracker** (shared) — visible match → deposit → purchase →
  signed lease progress per deal.
- **How It Works** — animated two-person flow.
- **Relocate** — simplified guided text/voice Q&A (name, city, budget,
  move-in date), with an explicit consent screen, replacing the fuller AI
  call simulation.
- **For Companies (B2B)** — info + a working "Request a demo" form.
- **Premium & VIP** (investor-only) — three pricing tiers.
- **Billing** (investor-only) — mock active subscription + card on file.
- **My Home & Support** (tenant-only) — lease details, rent history, and
  categorized support requests routed to AI or a coordinator.

Not built yet, flagged in the MVP scope doc as "not needed for this phase"
or "needs more discussion first": real messaging between matched
tenant/investor, KYC/AML and Right to Rent flows, recruiting-platform
referral links, and expansion beyond England.

## Editing content

Almost everything on the page (property listings, journey cards, stats,
testimonials, partner names, city cards) lives in `src/lib/content.ts`.
Edit that file to change copy or swap placeholder data without touching any
component code.

## Design tokens

Brand colors are defined once in `src/index.css` under the `@theme` block:

| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#00529F` | Primary brand color, links, secondary buttons |
| `brand-blue-dark` | `#003B73` | Hover states, dark sections |
| `brand-gold` | `#FEBE10` | Primary CTA buttons, accents, highlights |
| `brand-gold-dark` | `#D99E00` | Gold hover state |
| `brand-ink` | `#111827` | Body text, dark section backgrounds |
| `brand-muted` | `#4B5563` | Secondary/supporting text |
| `brand-surface` | `#F9FAFB` | Alternating section backgrounds |
| `brand-border` | `#E5E7EB` | Card borders, dividers |

This is the **v1 blue & gold palette**. When the final brand direction is
locked in, only these values need to change — every component references
them via Tailwind utility classes (`bg-brand-blue`, `text-brand-gold`, etc.),
so a repaint is a one-file edit.

Fonts: `Playfair Display` for headings, `Inter` for body text, both loaded
from Google Fonts in `index.html`.

## Images

All photography is currently sourced live from Unsplash and avatars from
pravatar.cc, purely as placeholders. Replace the URLs in
`src/lib/content.ts` (and the background image in `Hero.tsx` /
`RelocationAI.tsx`) with real assets when available.

## Roadmap

- [ ] Swap placeholder photography for real property/brand imagery
- [ ] Lock final color palette (currently blue & gold, v1)
- [ ] Wire up real search, listings, and auth (backend TBD)
- [ ] Add remaining pages: property detail, investor dashboard, tenant
      dashboard, relocation AI flow
- [ ] Add automated tests
