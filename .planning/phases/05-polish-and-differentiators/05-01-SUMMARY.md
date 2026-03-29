---
phase: 05-polish-and-differentiators
plan: 01
subsystem: ui
tags: [typescript, react-flow, graph, spof, data-layer]

# Dependency graph
requires:
  - phase: 02-spof-detection
    provides: SPOF detection via dependencyCount > 1 in transformGraphData
provides:
  - ResourceNodeData interface with dependingActivityNames field
  - transformGraphData populates dependingActivityNames from dependency edges
affects: [03-selection-and-info-panel, 05-02, 05-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [pre-compute activity name lookup map before node mapping loop]

key-files:
  created: []
  modified:
    - src/types/graph.types.ts
    - src/lib/graph.ts

key-decisions:
  - "dependingActivityNames computed once at transform time, not in component — consistent with SPOF computation pattern"
  - "activityNames Map built by filtering raw.nodes for type=activity before the dependency loop — O(n) pre-pass"

patterns-established:
  - "Pre-compute lookup Maps before node mapping loop in transformGraphData"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-03-29
---

# Phase 05 Plan 01: dependingActivityNames Data Layer Summary

**ResourceNodeData extended with dependingActivityNames string array, populated by mapping activity names through dependency edges in transformGraphData**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-29T14:15:00Z
- **Completed:** 2026-03-29T14:20:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Added `dependingActivityNames: string[]` to `ResourceNodeData` interface
- Built `activityNames` Map (id → name) and `dependingActivityNamesMap` (resource id → activity names[]) before the node mapping loop
- Each resource node now carries the names of every activity that depends on it; non-SPOF nodes receive an empty array
- TypeScript compiles cleanly with `satisfies ResourceNodeData` check still passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Add dependingActivityNames to ResourceNodeData and compute it in transformGraphData** - `1f9304d` (feat)

## Files Created/Modified

- `src/types/graph.types.ts` - Added `dependingActivityNames: string[]` field to `ResourceNodeData`
- `src/lib/graph.ts` - Added activityNames and dependingActivityNamesMap pre-computation, wired into resource node data

## Decisions Made

- Computation placed at transform time alongside `depCounts` / `isSPOF` — keeps components purely presentational, consistent with Phase 02 pattern
- `activityNames.get(dep.from) ?? dep.from` fallback ensures robustness if an activity id has no corresponding node name

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `dependingActivityNames` is now available on every resource node's data
- InfoPanel (Plan 03) can read `node.data.dependingActivityNames` directly without additional computation
- No blockers for Phase 05 Plans 02 and 03

---
*Phase: 05-polish-and-differentiators*
*Completed: 2026-03-29*
