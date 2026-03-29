---
phase: 02-spof-detection
plan: 01
subsystem: ui
tags: [react-flow, tailwind, spof, graph, typescript]

# Dependency graph
requires:
  - phase: 01-static-graph-render
    provides: transformGraphData function, ResourceNodeData type, ResourceNode component
provides:
  - SPOF computation in transformGraphData (isSPOF flag + dependencyCount per resource node)
  - ResourceNode two-row layout with conditional amber ring and count badge
  - Resource type label badge (TECH/3P/PEOPLE/BLDG/EQUIP) on every resource node
affects: [03-blast-radius, 04-info-panel]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SPOF computed at transform time (server-side), not in component — component is purely presentational"
    - "Absolute-positioned badge on relative container for overlapping node border"
    - "TYPE_LABELS lookup map for resource_type abbreviations"

key-files:
  created: []
  modified:
    - src/types/graph.types.ts
    - src/lib/graph.ts
    - src/components/nodes/ResourceNode.tsx

key-decisions:
  - "SPOF threshold: dependencyCount > 1 (appears as target in more than one dependency edge)"
  - "IIFE pattern used in graph.ts resource branch to compute dependencyCount inline before satisfies block"
  - "18x18px badge uses Tailwind arbitrary value w-[18px]/h-[18px] — canonical w-4/w-5 don't hit 18px"

patterns-established:
  - "SPOF logic: compute in graph.ts, pass as data fields, render in component without re-computation"
  - "Absolute badge positioning: absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 on relative container"

requirements-completed: [GRAPH-05, SPOF-01, SPOF-02, SPOF-03]

# Metrics
duration: 5min
completed: 2026-03-29
---

# Phase 02 Plan 01: SPOF Detection Summary

**SPOF computation via dependency count in graph.ts, amber ring + count badge on 10 SPOF resource nodes, and resource type label pill (TECH/3P/PEOPLE/BLDG/EQUIP) on all 15 resource nodes**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-29T12:59:25Z
- **Completed:** 2026-03-29T13:04:45Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- SPOF computation added to transformGraphData — iterates dependencies once, builds depCounts map, injects isSPOF and dependencyCount into every resource node's data
- ResourceNode rewritten with two-row layout — name row (truncated, green) + type badge row (TECH/3P/PEOPLE/BLDG/EQUIP pill)
- Conditional amber ring (ring-2 ring-amber-400) and absolute count badge rendered only on SPOF nodes — 10 nodes show ring, 5 non-SPOFs show no ring

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend types and add SPOF computation to graph.ts** - `77c8eed` (feat)
2. **Task 2: Update ResourceNode to two-row layout with SPOF overlay and type badge** - `cb52d3d` (feat)

## Files Created/Modified
- `src/types/graph.types.ts` - Added isSPOF: boolean and dependencyCount: number to ResourceNodeData
- `src/lib/graph.ts` - Added depCounts Map pass before node mapping; injects computed SPOF fields into resource nodes
- `src/components/nodes/ResourceNode.tsx` - Two-row layout, conditional amber ring, absolute count badge, TYPE_LABELS map

## Decisions Made
- Used an IIFE in the graph.ts resource branch to compute `dependencyCount` inline before the `satisfies ResourceNodeData` expression — avoids a separate variable declaration in the ternary
- Badge size uses arbitrary Tailwind value `w-[18px] h-[18px]` as specified — canonical `w-4` (16px) and `w-5` (20px) don't hit exactly 18px

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SPOF data (isSPOF, dependencyCount) is available on every ResourceNodeData — Phase 3 blast-radius click behavior can read these fields directly
- ResourceNode now uses relative positioning with overlay pattern — Phase 3 can add further overlay elements (e.g., selected state highlight) without layout changes
- No blockers for Phase 3

---
*Phase: 02-spof-detection*
*Completed: 2026-03-29*
