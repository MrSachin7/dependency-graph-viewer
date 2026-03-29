---
phase: 05-polish-and-differentiators
plan: "02"
subsystem: ui
tags: [react-flow, tailwind, nodes, xyflow, dagre]

# Dependency graph
requires:
  - phase: 04-toolbar-controls
    provides: working graph with toolbar and selection system
  - phase: 05-01
    provides: dependingActivityNames data layer for resource nodes
provides:
  - Emoji-prefixed resource type badges (💻 TECH, 🔗 3P, 👥 PEOPLE, 🏢 BLDG, ⚙️ EQUIP)
  - Two-row activity nodes with RTO second row (e.g., "4h RTO")
  - Smooth opacity transition on both node types (transition-opacity duration-150)
  - Updated NODE_HEIGHT = 64 so dagre rank spacing matches taller nodes
affects: [visual polish, node rendering, layout spacing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Emoji prefix in badge strings — embed directly in TYPE_BADGES map values rather than JSX"
    - "Opacity transitions via Tailwind transition-opacity duration-150 on root node div"

key-files:
  created: []
  modified:
    - src/hooks/useDagreLayout.ts
    - src/components/nodes/ResourceNode.tsx
    - src/components/nodes/ActivityNode.tsx

key-decisions:
  - "Emoji embedded directly in TYPE_BADGES string values — cleaner than separate JSX emoji span"
  - "ActivityNode changed from h-12 to h-16 to accommodate name + RTO row without overflow"
  - "NODE_HEIGHT bumped from 48 to 64 to match new node height so dagre rank gaps remain consistent"

patterns-established:
  - "TYPE_BADGES pattern: map resource_type to full badge string including emoji"
  - "Two-row node: flex-col items-center justify-center with py-2 for vertical padding"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 05 Plan 02: Visual Node Enhancements Summary

**Emoji-prefixed resource type badges, RTO second row on activity nodes, and smooth opacity transitions — the senior differentiators D-01 through D-06**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-29T14:15:43Z
- **Completed:** 2026-03-29T14:17:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- ResourceNode badge now shows emoji + label (💻 TECH, 🔗 3P, 👥 PEOPLE, 🏢 BLDG, ⚙️ EQUIP) — D-01/D-02
- ActivityNode expanded to h-16 with a second row showing "{rto_hours}h RTO" — D-03/D-04
- NODE_HEIGHT updated to 64 so dagre layout rank spacing matches the new node height — D-05
- Both node root divs carry `transition-opacity duration-150` for smooth selection fade — D-06

## Task Commits

Each task was committed atomically:

1. **Task 1: Update NODE_HEIGHT to 64 in useDagreLayout.ts** - `4a4b8fa` (chore)
2. **Task 2: Add emoji prefix to ResourceNode badge, two-row ActivityNode, opacity transitions** - `19043ad` (feat)

## Files Created/Modified

- `src/hooks/useDagreLayout.ts` - NODE_HEIGHT constant changed from 48 to 64
- `src/components/nodes/ResourceNode.tsx` - TYPE_LABELS replaced with TYPE_BADGES (emoji prefix), transition-opacity added to root div
- `src/components/nodes/ActivityNode.tsx` - h-12 to h-16, flex-col layout, RTO second row span, transition-opacity added

## Decisions Made

- Emoji embedded directly in TYPE_BADGES string values rather than separate JSX span — keeps the badge rendering to one expression with no extra element
- ActivityNode height changed from h-12 (48px) to h-16 (64px) to accommodate the two rows without overflow or cramping
- NODE_HEIGHT constant updated synchronously with node height change so dagre spacing stays correct

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All visual differentiators D-01 through D-06 are implemented
- Nodes are visually richer and layout spacing is correct
- Ready for plan 05-03 (final polish / SOLUTION.md writeup if planned)

---
*Phase: 05-polish-and-differentiators*
*Completed: 2026-03-29*
