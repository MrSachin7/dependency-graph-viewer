---
phase: 01-static-graph-render
plan: 02
subsystem: ui
tags: [react-flow, xyflow, dagre, typescript, next-js, graph-visualization, tailwind]

# Dependency graph
requires:
  - phase: 01-static-graph-render plan 01
    provides: "@dagrejs/dagre installed, project scaffold confirmed, data/graph.json verified"
provides:
  - "Full dependency graph rendered at localhost:3000 with 23 nodes and 30 edges"
  - "ActivityNodeData + ResourceNodeData TypeScript types for graph.json schema"
  - "transformGraphData pure utility (src/lib/graph.ts)"
  - "ActivityNode and ResourceNode custom React Flow node components"
  - "useDagreLayout hook with TB hierarchical layout gated on useNodesInitialized"
  - "GraphCanvas client component with nodeTypes at module scope and opacity-0 reveal"
  - "Server Component page.tsx reads graph.json via fs and passes data as serializable props"
affects: [02-resource-type-badges, 03-blast-radius, 04-spof-highlighting, 05-polish]

# Tech tracking
tech-stack:
  added: ["@dagrejs/dagre (already installed in plan 01)"]
  patterns:
    - "nodeTypes at module scope in GraphCanvas.tsx — prevents 23-node remount on every render"
    - "Inner GraphLayout component inside ReactFlow context calls useDagreLayout hook"
    - "opacity-0 canvas reveal gated on useNodesInitialized — prevents 0,0 snap flash"
    - "Server Component reads JSON via fs.readFileSync, passes serializable props to client boundary"
    - "dagre center-origin to React Flow top-left conversion: x - width/2, y - height/2"
    - '"use no memo" escape hatch prevents React Compiler stale state on useNodesState'

key-files:
  created:
    - src/types/graph.types.ts
    - src/lib/graph.ts
    - src/components/nodes/ActivityNode.tsx
    - src/components/nodes/ResourceNode.tsx
    - src/hooks/useDagreLayout.ts
    - src/components/GraphCanvas.tsx
  modified:
    - src/app/page.tsx
    - src/app/globals.css

key-decisions:
  - "ActivityNode has both source (bottom) and target (top) handles — act-8→act-6 edge requires target handle on activity nodes"
  - "GraphLayout inner component pattern: renders inside ReactFlow to access RF context hooks"
  - "useEffect for onLayoutApplied callback instead of side-effect-in-render to avoid React strict-mode warnings"
  - "graph.ts has no fs imports — pure utility safe to import from client contexts in future phases"

patterns-established:
  - "Pattern: nodeTypes const at module scope in GraphCanvas.tsx — copy for future node type additions"
  - "Pattern: useDagreLayout ref guard (layoutApplied.current) prevents double layout on re-renders"
  - "Pattern: page.tsx Server Component → client boundary props — all future data loading follows this pattern"

requirements-completed: [GRAPH-01, GRAPH-02, GRAPH-03, GRAPH-04]

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 01 Plan 02: Static Graph Render Summary

**React Flow canvas with 23 nodes and 30 edges, dagre TB layout, blue activity vs green resource distinction, opacity-reveal on initialization**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-29T12:35:14Z
- **Completed:** 2026-03-29T12:37:14Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- All 23 nodes (8 activity + 15 resource) render with correct visual distinction — blue-600 border for activities, green-600 for resources
- 30 directed edges with closed arrowheads (MarkerType.ArrowClosed, slate-500 color) via smoothstep type
- Dagre TB hierarchical layout positions nodes automatically; canvas hidden until layout applied via useNodesInitialized gate
- Build succeeds (`pnpm build`), TypeScript passes, ESLint passes

## Task Commits

Each task was committed atomically:

1. **Task 1: Types + data transform + node components** - `90bb493` (feat)
2. **Task 2: useDagreLayout hook + GraphCanvas + page wiring** - `58c2185` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/types/graph.types.ts` - ActivityNodeData, ResourceNodeData, GraphJson interfaces
- `src/lib/graph.ts` - transformGraphData pure utility with ArrowClosed edge markers
- `src/components/nodes/ActivityNode.tsx` - Memo node, blue border, source+target handles
- `src/components/nodes/ResourceNode.tsx` - Memo node, green border, target-only handle
- `src/hooks/useDagreLayout.ts` - Dagre layout hook gated on useNodesInitialized
- `src/components/GraphCanvas.tsx` - ReactFlow client component with opacity-0 reveal
- `src/app/page.tsx` - Server Component reads graph.json via fs, passes props to GraphCanvas
- `src/app/globals.css` - Added body margin:0; padding:0 for full-viewport canvas

## Decisions Made
- All activity nodes get both source and target handles (not just act-6) — consistent API and handles the act-8→act-6 edge
- Used useEffect for the onLayoutApplied callback inside GraphLayout instead of calling it directly in render — avoids side-effect-in-render lint warnings under React Strict Mode
- graph.ts has no fs/path imports — ensures it can be safely imported from client code in later phases

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — all packages were in place, TypeScript compiled clean on first attempt, build succeeded immediately.

## Known Stubs
None — all 23 nodes render with real data from graph.json. No placeholder text or empty data sources.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full static graph is on screen at localhost:3000 — ready for Phase 2 resource type badge work (GRAPH-05)
- `transformGraphData` returns `resource_type` field in node data — Phase 2 resource badge rendering can read it directly from `data.resource_type`
- Node component pattern established in ActivityNode/ResourceNode — Phase 2 badge additions follow same memo + Handle pattern

## Self-Check: PASSED

- All 7 created files confirmed on disk
- Both task commits (90bb493, 58c2185) confirmed in git log

---
*Phase: 01-static-graph-render*
*Completed: 2026-03-29*
