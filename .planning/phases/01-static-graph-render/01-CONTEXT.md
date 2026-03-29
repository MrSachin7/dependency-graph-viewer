# Phase 1: Static Graph Render - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Render all 23 nodes (8 activity + 15 resource) and 29 edges from graph.json in a zoomable, pannable canvas. Activity and resource nodes are visually distinct via color. Edges have arrowheads showing dependency direction. Nodes are positioned via a dagre hierarchical layout. No SPOF detection, no interaction, no info panel — those are later phases.

</domain>

<decisions>
## Implementation Decisions

### Page Chrome
- **D-01:** Pure full-viewport canvas — no header, no title bar, no chrome outside the canvas.
- **D-02:** Graph fills 100vh. React Flow's built-in `<Controls />` component sits bottom-left inside the canvas.

### Node Label Content
- **D-03:** Activity nodes show **name only** (e.g., "Onboarding"). No criticality badge — that's Phase 4 scope.
- **D-04:** Resource nodes show **name only** (e.g., "Core Banking"). No resource type badge — that's Phase 2 (GRAPH-05) scope.

### Data Loading
- **D-05:** graph.json is read **server-side** in a Server Component (page.tsx) and passed as props to the client GraphCanvas component. No useEffect fetch, no loading flash, data is available on first paint.

### Layout Transition
- **D-06:** Canvas renders with `opacity: 0` until `useNodesInitialized()` returns true (all node dimensions measured and dagre layout applied). Then reveal — no 0,0 snap visible to the user.

### Component Architecture
- **D-07:** Graph code split across dedicated files:
  - `src/components/GraphCanvas.tsx` — React Flow wrapper (`"use client"`)
  - `src/components/nodes/ActivityNode.tsx` — custom activity node
  - `src/components/nodes/ResourceNode.tsx` — custom resource node
  - `nodeTypes` const defined at **module scope** in GraphCanvas.tsx (not inside the component body — avoids 23-node remount on every render)
- **D-08:** Data transformation (graph.json → React Flow nodes/edges) lives in `src/lib/graph.ts`. GraphCanvas receives already-transformed data as props. page.tsx reads the file, transforms, passes down.

### Claude's Discretion
- Exact Tailwind class composition for node cards (within UI-SPEC constraints: blue border for activities, green for resources, white fill, rounded corners)
- dagre configuration tuning within the spec anchors (rankSep 80, nodeSep 40, TB direction)
- TypeScript type definitions for graph data shapes
- Error boundary implementation for graph render failures

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Contract
- `.planning/phases/01-static-graph-render/01-UI-SPEC.md` — Visual and interaction contract: node dimensions (160×48px activity, 160×44px resource), color tokens, spacing scale, typography, edge styling, canvas background

### Data Schema
- `data/graph.json` — Source data: 8 activities, 15 resources, 29 dependency edges. One activity-to-activity edge (act-8 → act-6). Read this before defining TypeScript types.

### Requirements
- `.planning/REQUIREMENTS.md` §GRAPH-01 through GRAPH-04 — The 4 requirements this phase must satisfy

### Project Constraints
- `CLAUDE.md` — Tech stack lock (Next.js 16.2.1, React 19, @xyflow/react 12.10.2, Tailwind v4), TypeScript strict mode, no `any`
- `AGENTS.md` — Read relevant Next.js guide in node_modules/next/dist/docs/ before writing any Next.js code

### React Flow Patterns
- `node_modules/next/dist/docs/` — Check for Next.js 16 breaking changes before writing page/layout code

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/globals.css` — Canvas background color `#f6f4ee` already defined as `--background` CSS custom property. Use this token rather than hardcoding.
- `src/app/layout.tsx` — Root layout with Geist Sans/Mono font variables and `html/body` wrapper. GraphCanvas will render inside `<body>` via page.tsx.

### Established Patterns
- **Server Components by default** — page.tsx stays a Server Component; only GraphCanvas.tsx gets `"use client"`
- **Path alias `@/*`** — All imports use `@/components/...`, `@/lib/...` (not relative paths)
- **TypeScript strict mode** — All props must be fully typed; no `any`; use `Readonly<>` for component props
- **Tailwind v4** — Import via `@import "tailwindcss"` in globals.css (already done). Use utility classes directly in JSX.

### Integration Points
- `src/app/page.tsx` → reads `data/graph.json` server-side → passes transformed data to `GraphCanvas`
- `src/lib/graph.ts` → exports `transformGraphData(raw): { nodes: Node[], edges: Edge[] }` utility
- `src/components/GraphCanvas.tsx` → consumes transformed data, renders React Flow canvas
- `src/components/nodes/ActivityNode.tsx` + `ResourceNode.tsx` → registered in `nodeTypes` const at GraphCanvas module scope

</code_context>

<specifics>
## Specific Ideas

- "Hidden canvas until ready" — opacity:0 approach gates on `useNodesInitialized()` to avoid the jarring node-snap-to-dagre-positions flash
- The `nodeTypes` placement caution from STATE.md is a hard constraint: define at module scope outside the component, or all 23 nodes remount on every render
- React Compiler + useNodesState: if stale graph state is observed during development, add `"use no memo"` directive to GraphCanvas.tsx

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-static-graph-render*
*Context gathered: 2026-03-29*
