# Architecture

## Pattern

Next.js 16 App Router (React Server Components by default). Currently a greenfield project — the dependency graph viewer application is yet to be built on top of the scaffold.

## Layers

```
Presentation   src/app/layout.tsx     Root layout, fonts, metadata
               src/app/page.tsx       Home page (placeholder)
Styling        src/app/globals.css    Global CSS with Tailwind v4 + CSS custom properties
Assets         public/                Static assets
```

## Entry Points

- **Web:** `src/app/layout.tsx` → `src/app/page.tsx` (App Router root)
- **Build:** `next build` (Next.js CLI)
- **Dev:** `next dev`

## Key Abstractions (Planned)

The project is scaffolded for a dependency graph viewer using `@xyflow/react`. Expected future abstractions:
- **Graph nodes** — represent packages/modules
- **Graph edges** — represent dependency relationships
- **SPOF detection** — identify single points of failure in the dependency graph

## Data Flow (Current)

```
Request → Next.js App Router → RootLayout → Page Component → HTML Response
```

No client-side state or data fetching yet. All components are currently Server Components.

## Error Handling

No custom error boundaries or `error.tsx` defined yet. Relies on Next.js defaults.

## Cross-Cutting Concerns

- **Fonts:** Geist Sans + Geist Mono loaded via `next/font/google` with CSS variables
- **Theme:** CSS custom properties (`--background`, `--foreground`) defined in globals.css
- **TypeScript:** Strict mode enabled throughout
