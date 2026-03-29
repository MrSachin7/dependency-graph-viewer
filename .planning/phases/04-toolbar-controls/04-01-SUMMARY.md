---
phase: 04-toolbar-controls
plan: 01
subsystem: ui
tags: [react, next.js, react-flow, dagre, toolbar, sort, reload]

# Dependency graph
requires:
  - phase: 03-selection-and-info-panel
    provides: GraphCanvas component with selection state and InfoPanel sidebar
provides:
  - Toolbar component with Reload, Sort Activities, Sort Resources controls
  - useDagreLayout hook extended with layoutKey re-trigger capability
  - GraphCanvas extended with sort state, reload handler, and toolbar wiring
affects: [05-final-polish]

# Tech tracking
tech-stack:
  added: [next/navigation useRouter]
  patterns:
    - Sort applied in synchronous event handlers (not effects) to avoid react-hooks/set-state-in-effect lint rule
    - eslint-disable block for intentional multi-setState reset effect watching initialNodes reference
    - Module-scope pure sort function (applySortOrder) avoids stale closure issues
    - layoutKey counter pattern: bump counter to trigger useDagreLayout re-run without unmounting

key-files:
  created:
    - src/components/Toolbar.tsx
  modified:
    - src/hooks/useDagreLayout.ts
    - src/components/GraphCanvas.tsx

key-decisions:
  - "Sort logic moved to synchronous event handlers (not useEffect) to satisfy react-hooks/set-state-in-effect lint rule — avoids cascading renders warning"
  - "eslint-disable block used for the initialNodes reset effect — intentional multi-setState pattern required for router.refresh() reset mechanism"
  - "applySortOrder extracted as pure module-scope function to avoid stale closure on sortActivities/sortResources in toggle handlers"

patterns-established:
  - "layoutKey counter: increment to re-run dagre layout without component remount"
  - "State reset on prop reference change: useEffect([initialNodes]) detects router.refresh() delivery"

requirements-completed: [CTRL-01, CTRL-02, CTRL-03]

# Metrics
duration: 5min
completed: 2026-03-29
---

# Phase 04 Plan 01: Toolbar Controls Summary

**Toolbar with Reload, Sort Activities, Sort Resources added to GraphCanvas — sort applies via pure event handlers, reload resets all state via router.refresh() initialNodes reference change detection**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-29T13:42:18Z
- **Completed:** 2026-03-29T13:46:47Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `Toolbar.tsx` with three controls: Reload (momentary), Sort Activities (toggle), Sort Resources (toggle)
- Active sort toggle renders with `bg-blue-600` fill; inactive with outlined gray border — visual state per UI-SPEC
- Extended `useDagreLayout` with `layoutKey: number` third parameter; reset effect clears `layoutApplied.current` before the layout effect, enabling dagre re-runs on demand
- Extended `GraphCanvas` with `sortActivities`, `sortResources`, `layoutKey` state; sort logic applied in event handlers via pure `applySortOrder` function; reload calls `router.refresh()` which triggers `[initialNodes]` effect reset
- Canvas area uses `flexDirection: 'column'` with toolbar at 44px and canvas at `flex: 1` with `minHeight: 0` — no toolbar overlap

## Task Commits

1. **Task 1: Create Toolbar.tsx and update useDagreLayout to accept layoutKey** - `638764f` (feat)
2. **Task 2: Extend GraphCanvas with sort state, reload, dagre re-trigger, and toolbar wiring** - `7c6ac74` (feat)

## Files Created/Modified

- `src/components/Toolbar.tsx` — New Toolbar UI component with Reload, Sort Activities, Sort Resources buttons; active/inactive visual states via Tailwind classes
- `src/hooks/useDagreLayout.ts` — Added `layoutKey: number` third parameter; reset effect clears `layoutApplied.current` when layoutKey changes so dagre re-runs
- `src/components/GraphCanvas.tsx` — Added sort state, reload handler, `applySortOrder` pure function, `[initialNodes]` reset effect, toolbar JSX, flex column layout

## Decisions Made

- **Sort in event handlers, not effects:** The `react-hooks/set-state-in-effect` lint rule (from Next.js ESLint config / React Compiler) prevents calling plain React state setters inside `useEffect` bodies. Moved sort node update + `setLayoutKey` + `setSelectedNodeId` calls into the toggle event handlers synchronously. This avoids the lint error and is actually the correct pattern — sort is a user action, not a side effect.
- **eslint-disable block for reset effect:** The `[initialNodes]` reset effect genuinely needs to call multiple state setters atomically (setSortActivities, setSortResources, setLayoutKey, setSelectedNodeId). This is the correct pattern for detecting `router.refresh()` prop delivery. Added `/* eslint-disable/enable react-hooks/set-state-in-effect */` block with a comment explaining the intent.
- **applySortOrder as module-scope pure function:** Extracted sort logic out of the component to avoid stale closure issues in `useCallback` handlers that read `sortActivities`/`sortResources`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Refactored sort state updates from effects into event handlers to fix lint errors**
- **Found during:** Task 2 (GraphCanvas extension)
- **Issue:** Plan prescribed two `useEffect` bodies that called plain React state setters (`setSortActivities`, `setSortResources`, `setLayoutKey`, `setSelectedNodeId`) — this triggers `react-hooks/set-state-in-effect` from the Next.js ESLint config. Lint failed with 2 errors.
- **Fix:** Moved sort-triggered state updates (setNodes, setLayoutKey, setSelectedNodeId) into the toggle handlers themselves, using functional setState updates to read current sort values. Added `eslint-disable` block around the `[initialNodes]` reset effect where the pattern is genuinely needed.
- **Files modified:** `src/components/GraphCanvas.tsx`
- **Verification:** `pnpm lint` exits 0, `pnpm tsc --noEmit` exits 0
- **Committed in:** `7c6ac74` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Behavior is identical to the plan's intent — same sort logic, same reset mechanism, same visual state. Only the implementation pattern changed to satisfy the project's lint rules.

## Issues Encountered

None beyond the lint refactor documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three CTRL requirements (CTRL-01, CTRL-02, CTRL-03) implemented and verified
- Toolbar visible at 44px; canvas occupies remaining viewport height
- Reload resets all client state via router.refresh() → initialNodes reference change → reset effect
- Sort toggles are independent, active state visually distinct (blue-600 fill vs outlined gray)
- No TypeScript errors, no lint errors
- Ready for Phase 05 final polish if planned

## Self-Check: PASSED

- FOUND: src/components/Toolbar.tsx
- FOUND: src/hooks/useDagreLayout.ts
- FOUND: src/components/GraphCanvas.tsx
- FOUND: .planning/phases/04-toolbar-controls/04-01-SUMMARY.md
- FOUND: commit 638764f (Task 1)
- FOUND: commit 7c6ac74 (Task 2)

---
*Phase: 04-toolbar-controls*
*Completed: 2026-03-29*
