---
phase: 03-selection-and-info-panel
plan: 01
subsystem: ui
tags: [react-flow, tailwind, typescript, selection, sidebar, spof]

# Dependency graph
requires:
  - phase: 02-spof-detection
    provides: ResourceNode with isSPOF/dependencyCount fields and SPOF amber ring
  - phase: 01-static-graph-render
    provides: GraphCanvas, ActivityNode, ResourceNode, useDagreLayout, graph.ts transform pipeline
provides:
  - Click-to-select interaction with blue ring on selected node
  - Opacity 0.2 dimming on all unconnected nodes and edges
  - Toggle deselect (same node click or pane click clears selection)
  - Direct switch between nodes without intermediate deselect
  - Fixed 320px right sidebar InfoPanel showing node details or hint text
  - Activity fields: name, type badge, priority badge (color-coded), RTO, owner
  - Resource fields: name, type badge, SPOF warning with exact wording, contact, optional vendor
affects: [04-reload-button, 05-sorting-toggles]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useCallback for event handlers (handleNodeClick, handlePaneClick) to avoid unnecessary re-renders
    - useEffect + setNodes/setEdges for React Flow opacity updates on selection change
    - selectedNodeId string|null state drives both opacity and InfoPanel content
    - Type narrowing via node.type === 'activity' guard before as-cast to typed Node generics
    - PRIORITY_STYLES Record for priority badge color mapping

key-files:
  created:
    - src/components/InfoPanel.tsx
  modified:
    - src/components/nodes/ActivityNode.tsx
    - src/components/nodes/ResourceNode.tsx
    - src/components/GraphCanvas.tsx

key-decisions:
  - "Sidebar is always present in DOM (320px fixed), not conditionally mounted — avoids layout shift on selection"
  - "Opacity applied via setNodes/setEdges style prop (not CSS classes) — React Flow renders nodes in its own DOM layer"
  - "Blue ring takes precedence over amber SPOF ring when a SPOF node is selected"
  - "edges variable from useNodesState/useEdgesState used directly in useEffect for connected-set computation — avoids stale closure"
  - "React import added to GraphCanvas for React.MouseEvent type in useCallback handler"

patterns-established:
  - "Selection state lives in GraphCanvas, passed down as selectedNode prop to InfoPanel"
  - "Node components receive selected boolean from NodeProps — no custom prop needed"
  - "InfoPanel is pure presentational — no state, no use client directive needed (client boundary from GraphCanvas propagates)"

requirements-completed: [INTR-01, INTR-02, INTR-03, INTR-04, INTR-05, PANEL-01, PANEL-02, PANEL-03, PANEL-04]

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 3 Plan 01: Selection and Info Panel Summary

**Click-to-select interaction with blue ring, opacity dimming of unconnected nodes/edges, and fixed 320px sidebar showing activity/resource details including SPOF warning**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-29T13:07:58Z
- **Completed:** 2026-03-29T13:10:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Clicking any node shows blue ring, dims all unconnected nodes/edges to opacity 0.2, switches directly when different node clicked, toggles off on same-node or pane click
- InfoPanel sidebar always rendered at 320px right — shows "Click any node to explore" hint when idle, full node fields when active
- Activity fields: name, Activity badge, color-coded priority badge (critical/high/medium/low), RTO formatted as "N hour(s)", owner
- Resource fields: name, Resource-type badge, SPOF warning ("⚠️ N activities depend on this resource — single point of failure"), contact, conditional vendor

## Task Commits

Each task was committed atomically:

1. **Task 1: Add selected ring to ActivityNode and ResourceNode** - `c632be0` (feat)
2. **Task 2: Add selection state and opacity logic to GraphCanvas** - `c4f544e` (feat)
3. **Task 3: Create InfoPanel component** - `dee76b0` (feat)

## Files Created/Modified
- `src/components/InfoPanel.tsx` - New: fixed sidebar with HintState, ActivityDetail, ResourceDetail subcomponents and Field helper
- `src/components/GraphCanvas.tsx` - Modified: reclaimed setNodes/setEdges, added selectedNodeId state, handleNodeClick/handlePaneClick, useEffect for opacity, InfoPanel render
- `src/components/nodes/ActivityNode.tsx` - Modified: destructure selected from NodeProps, conditional ring-2 ring-blue-500
- `src/components/nodes/ResourceNode.tsx` - Modified: destructure selected from NodeProps, blue ring on selection (overrides amber SPOF ring)

## Decisions Made
- Sidebar always in DOM (320px fixed) — avoids layout shift, consistent canvas+sidebar flex layout
- React import added to GraphCanvas.tsx to support `React.MouseEvent` type annotation on handleNodeClick
- Blue ring takes precedence over amber SPOF ring when node is selected (selection intent is clearer)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 9 Phase 3 requirements (INTR-01 through INTR-05, PANEL-01 through PANEL-04) implemented
- Graph canvas now has full selection/deselection/dimming functionality
- InfoPanel ready to be extended in future phases if additional node types are added
- Phase 4 (reload button) and Phase 5 (sorting toggles) can proceed without blockers

## Self-Check: PASSED

- FOUND: src/components/InfoPanel.tsx
- FOUND: src/components/GraphCanvas.tsx
- FOUND: src/components/nodes/ActivityNode.tsx
- FOUND: src/components/nodes/ResourceNode.tsx
- FOUND commit c632be0: feat(03-01): add selected ring to ActivityNode and ResourceNode
- FOUND commit c4f544e: feat(03-01): add selection state and opacity logic to GraphCanvas
- FOUND commit dee76b0: feat(03-01): create InfoPanel component with activity and resource details

---
*Phase: 03-selection-and-info-panel*
*Completed: 2026-03-29*
