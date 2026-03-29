# Phase 4: Toolbar Controls - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Add three controls to the graph viewer: a reload button that re-fetches graph.json and re-renders the graph, an activities sort toggle that reorders activity nodes by criticality (critical → high → medium → low), and a resources sort toggle that reorders resource nodes by criticality (SPOF first, then by dependency count descending). Selection state and sort state both reset on reload.

</domain>

<decisions>
## Implementation Decisions

### Reload Mechanism
- **D-01:** The reload button calls `router.refresh()` from `next/navigation`. This re-runs the server component (`page.tsx`), re-reads `data/graph.json` via `readFileSync`, and re-passes fresh props to `GraphCanvas`. No API route needed.
- **D-02:** `router.refresh()` causes `GraphCanvas` to receive new `initialNodes`/`initialEdges` props, which resets all state — selection (`selectedNodeId`), sort toggles, and layout — back to initial load state.

### Sort Toggle Behavior
- **D-03:** When a sort toggle is turned ON, the node list is sorted by criticality, then dagre is re-run with the sorted node list. This produces clean hierarchical positions consistent with how the initial layout works.
- **D-04:** Activity sort order: `critical → high → medium → low` (maps to `priority` field on `ActivityNodeData`).
- **D-05:** Resource sort order: SPOF first (where `isSPOF === true`), then by `dependencyCount` descending within each group.
- **D-06:** When a sort toggle is turned OFF, the original load order (from `graph.json` / `initialNodes` prop) is restored. Dagre re-runs with the original unsorted node list. Toggle acts as on/off for the sort view.
- **D-07:** The two sort toggles are independent — both can be active simultaneously. When both are on, activities are sorted by criticality AND resources are sorted by criticality (each group sorted independently).

### Toolbar Placement
- **D-08:** Toolbar is a fixed header bar **above** the ReactFlow canvas — always visible, never overlapping nodes. The canvas area becomes `calc(100vh - toolbar-height)` to accommodate it.
- **D-09:** Toolbar contains three controls in a row: `[ Reload ]  [ Sort Activities ▼ ]  [ Sort Resources ▼ ]`. Sort toggles show an active/inactive visual state (filled vs outlined, or highlighted background).
- **D-10:** Toolbar is a new component `src/components/Toolbar.tsx`. It receives sort state and callbacks from `GraphCanvas` as props (or from a parent that wraps both — Claude's discretion on exact wiring).

### Claude's Discretion
- Exact toolbar height (40–48px range is fine)
- Toolbar background color (neutral dark or light, consistent with the existing graph background)
- Sort toggle visual active state (filled button, checked indicator, or color highlight — any clear on/off pattern)
- Whether `useDagreLayout` hook is extended or a new invocation path is created for re-triggering layout on sort change
- Animation/transition when nodes reposition after sort toggle (subtle or none)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Implementation to Modify
- `src/components/GraphCanvas.tsx` — Client component to extend: add sort state, toolbar wiring, re-triggerable dagre layout, `router.refresh()` on reload
- `src/hooks/useDagreLayout.ts` — Current layout hook; may need to accept sorted node input or be re-triggerable
- `src/app/page.tsx` — Server component; reload via `router.refresh()` re-runs this

### Types
- `src/types/graph.types.ts` — `ActivityNodeData.priority` (sort key for activities), `ResourceNodeData.isSPOF` + `ResourceNodeData.dependencyCount` (sort keys for resources)

### Requirements
- `.planning/REQUIREMENTS.md` §CTRL-01, CTRL-02, CTRL-03 — 3 requirements this phase must satisfy

### Project Constraints
- `CLAUDE.md` — Tech stack lock, TypeScript strict mode, no `any`, Tailwind v4
- `AGENTS.md` — Read Next.js 16 docs before modifying page/layout/navigation code (`useRouter` API may differ from training data)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useNodesState` / `useEdgesState` in GraphCanvas — already manages node list; sort state modifies the list passed to dagre before re-layout
- `useDagreLayout` hook — runs dagre on the current node/edge state; needs a re-trigger mechanism (e.g., accept a `sortVersion` counter that bumps on toggle change)
- `ActivityNodeData.priority` — already typed as `'critical' | 'high' | 'medium' | 'low'`; define a priority order map: `{ critical: 0, high: 1, medium: 2, low: 3 }`
- `ResourceNodeData.isSPOF` + `dependencyCount` — already computed in Phase 2; sort uses these directly

### Established Patterns
- **`"use client"` + `"use no memo"`** — required on GraphCanvas and any new client components (Toolbar.tsx)
- **Module-scope `nodeTypes`** — must remain at module scope; toolbar does not affect node rendering
- **`useCallback`** — established pattern for event handlers in GraphCanvas; use for reload and toggle handlers
- **Tailwind v4** — modifier syntax `bg-red-500!` not `!bg-red-500`; use utility classes directly

### Integration Points
- `GraphCanvas.tsx` → manages sort state (two booleans: `sortActivities`, `sortResources`) → passes to `Toolbar` as props + callbacks
- `GraphCanvas.tsx` → on sort toggle, re-sort node list → re-trigger dagre → update node positions
- `GraphCanvas.tsx` → on reload button click → call `router.refresh()` (from `useRouter` in `next/navigation`)
- `Toolbar.tsx` → receives `{ onReload, sortActivities, onToggleSortActivities, sortResources, onToggleSortResources }`
- `page.tsx` → no changes needed; `router.refresh()` re-runs it automatically

</code_context>

<specifics>
## Specific Ideas

- Toolbar layout: `[ Reload ] [ Sort Activities ▼ ] [ Sort Resources ▼ ]` — three controls in a row, left-aligned or centered
- Sort toggle visual: active state clearly distinguished (e.g., filled/highlighted vs outlined)
- Reload resets everything: selection, sort toggles, layout — fresh state identical to initial page load

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-toolbar-controls*
*Context gathered: 2026-03-29*
