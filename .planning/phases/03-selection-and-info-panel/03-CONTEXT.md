# Phase 3: Selection and Info Panel - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Add click-to-select interaction to the graph canvas: clicking a node dims all unconnected nodes/edges (opacity 0.2), highlights the selected node with a blue ring, and opens a fixed right sidebar showing all node details. Clicking background or re-clicking the selected node clears selection. Clicking a different node switches selection directly. No new data loading — all data already available from Phase 1/2 transform pipeline.

</domain>

<decisions>
## Implementation Decisions

### Selection State Management
- **D-01:** `selectedNodeId: string | null` state lives in `GraphCanvas.tsx`. On `onNodeClick`, set to the clicked node's id (or null if same node clicked again). On `onPaneClick`, set to null.
- **D-02:** Clicking a different node while one is selected switches directly — no background click required. `onNodeClick` always sets `selectedNodeId` to the new node id, replacing the previous.
- **D-03:** Clicking the already-selected node again sets `selectedNodeId` to null (toggle behavior). Check: `if (node.id === selectedNodeId) setSelectedNodeId(null); else setSelectedNodeId(node.id)`.

### Dim/Highlight Effect
- **D-04:** When a node is selected, compute two sets:
  - `connectedNodeIds`: all nodes directly connected to the selected node via any edge (source or target)
  - `connectedEdgeIds`: all edges where either source or target is the selected node
- **D-05:** Unconnected nodes and edges: `opacity: 0.2` (strong dim). Connected nodes + selected node: full opacity (`opacity: 1`).
- **D-06:** Apply opacity via React Flow node/edge `style` property — pass computed styles into `setNodes`/`setEdges` on selection change. Do NOT use CSS classes for this (React Flow renders nodes in its own DOM layer).
- **D-07:** Selected node gets `ring-2 ring-blue-500` — a blue ring overlaid on the existing border. Implemented via a `selected` prop passed to the node component OR via React Flow's built-in `selected` field on the node object + CSS in the node component.
- **D-08:** When no selection (selectedNodeId is null): all nodes and edges at full opacity, no rings.

### Sidebar Design
- **D-09:** Fixed right sidebar, **320px wide**, always present in the DOM. When no selection: shows hint text "Click any node to explore". When selection active: shows node details.
- **D-10:** Sidebar is a new component `src/components/InfoPanel.tsx`. It receives `selectedNode: Node<ActivityNodeData | ResourceNodeData> | null` as a prop from `GraphCanvas`.
- **D-11:** Canvas width adjusts when sidebar is visible — the ReactFlow container should be `width: calc(100% - 320px)` when a node is selected, `width: 100%` when not. Or sidebar overlays — Claude's discretion on whether sidebar overlaps or pushes canvas.
- **D-12:** **Activity node fields in sidebar:**
  - Node name (large, prominent)
  - Type badge: "Activity"
  - Priority: badge with color (critical=red, high=orange, medium=yellow, low=gray)
  - RTO: formatted as "1 hour" / "4 hours" / "48 hours"
  - Owner: plain text
- **D-13:** **Resource node fields in sidebar:**
  - Node name (large, prominent)
  - Type badge: "Resource — {resource_type}" (e.g. "Resource — Technology")
  - Contact: plain text
  - Vendor: plain text (only shown if present)
  - SPOF risk statement (if `isSPOF`): `⚠️ {dependencyCount} activities depend on this resource — single point of failure`
  - Dep count badge already on the node itself — sidebar reinforces with the prose statement

### Claude's Discretion
- Exact sidebar padding, font sizes, field label styling
- Whether sidebar overlays canvas or pushes it (either is fine — choose what renders cleanly)
- Transition animation on sidebar open/close (subtle fade or slide, or none)
- Priority badge color implementation (Tailwind conditional classes)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Implementation
- `src/components/GraphCanvas.tsx` — Client component to modify: add selection state, onNodeClick/onPaneClick handlers, pass selectedNode to InfoPanel
- `src/components/nodes/ActivityNode.tsx` — May need `selected` prop to render blue ring
- `src/components/nodes/ResourceNode.tsx` — May need `selected` prop to render blue ring
- `src/types/graph.types.ts` — `ActivityNodeData` and `ResourceNodeData` — sidebar reads these fields directly

### Data Schema
- `data/graph.json` — All fields available per node: activities have `rto_hours`, `priority`, `owner`; resources have `resource_type`, `contact`, `vendor?`

### Requirements
- `.planning/REQUIREMENTS.md` §INTR-01 through INTR-05, PANEL-01 through PANEL-04 — 9 requirements this phase must satisfy

### Project Constraints
- `CLAUDE.md` — Tech stack lock, TypeScript strict mode, no `any`, Tailwind v4
- `AGENTS.md` — Read Next.js 16 docs before modifying page/layout code

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `GraphCanvas.tsx` — Already has `useNodesState`/`useEdgesState`. Currently discards `setNodes`/`setEdges` — these must be reclaimed for opacity updates.
- `src/types/graph.types.ts` — `ActivityNodeData` and `ResourceNodeData` already fully typed including all sidebar fields. No type changes needed.
- React Flow's `onNodeClick(event, node)` and `onPaneClick()` are native props on `<ReactFlow>` — no library additions needed.

### Established Patterns
- **Client component** — `GraphCanvas.tsx` already `"use client"` with `"use no memo"`. InfoPanel will also need `"use client"` if it has any state.
- **Tailwind v4** — Modifier syntax: `bg-red-500!` not `!bg-red-500`; canonical classes.
- **TypeScript strict** — InfoPanel props must be fully typed. Use type narrowing (`node.type === 'activity'`) to access type-specific fields.
- **Module-scope nodeTypes** — Already established in GraphCanvas. Any change to node components (adding `selected` prop) must maintain this pattern.

### Integration Points
- `GraphCanvas.tsx` → manages `selectedNodeId` state → passes `selectedNode` to `InfoPanel`
- `GraphCanvas.tsx` → on selection change, calls `setNodes`/`setEdges` with updated opacity styles
- `InfoPanel.tsx` → receives `Node<ActivityNodeData | ResourceNodeData> | null` → renders conditionally
- `ActivityNode.tsx` + `ResourceNode.tsx` → may receive `selected` boolean prop for blue ring

</code_context>

<specifics>
## Specific Ideas

- Blue ring on selected node: `ring-2 ring-blue-500` — consistent with amber ring pattern established in Phase 2
- SPOF risk statement exact wording: `⚠️ {N} activities depend on this resource — single point of failure`
- RTO formatting: `1 hour` (singular), `N hours` (plural) — not raw number
- Sidebar hint text: `Click any node to explore`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-selection-and-info-panel*
*Context gathered: 2026-03-29*
