# Features Research

**Project:** Dependency Graph Viewer (Fortiv take-home)
**Domain:** Interactive directed graph viewer for business continuity management
**Researched:** 2026-03-29
**Overall confidence:** HIGH — based on React Flow 12.10.2 type definitions, graph.json data analysis, and established UX patterns for network/dependency visualization tools.

---

## Table Stakes

Features users expect. Missing = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Zoom + pan canvas | Every graph tool ships this; users scroll instinctively | Low | React Flow provides via d3-zoom out of the box |
| Visually distinct node types | Activity vs resource are fundamentally different concepts | Low | Different shape, color, or border — pick one signal and commit to it |
| Directed edges with arrowheads | "A depends on B" is directional; undirected looks like a network diagram | Low | React Flow `markerEnd` on Edge type |
| Click node to highlight connections | Required by assignment; also universally expected in graph tools | Medium | `onNodeClick` + derive connected node/edge ids + apply className/style |
| Click background/selected node to clear | Required; breaking this feels like a bug | Low | `onPaneClick` + toggle logic in `onNodeClick` |
| SPOF indicator visible at a glance | Required by assignment; tooltip-only is explicitly ruled out | Medium | Permanent badge/ring/icon on node — not hover-dependent |
| Sidebar info panel on selection | Required; users need context without a separate screen | Medium | Fixed position sidebar; conditionally rendered on `selectedNodeId` state |
| Reload button | Required; simulate live data refresh | Low | Re-fetch `data/graph.json`, reset nodes/edges/selection state |
| Criticality ordering toggles | Required; two toggles (activities + resources) | Low | Sort transform on node array before passing to `setNodes` |
| Reasonable initial layout | Users should not have to drag 23 nodes into place | Medium | dagre layout library; one-time computation on load |

---

## Differentiators

Features that go beyond the minimum and signal craft to the evaluator.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| SPOF blast radius count on badge | Showing "3 activities depend on this" directly on the SPOF badge makes risk legible without a click | Low | Count from dependency data; render in badge |
| Edge directionality reinforced by color | Muted edges for de-emphasized state; bright/colored for active selection | Low | `style` prop on Edge type accepts CSSProperties |
| Resource type icons in node | technology/people/building/third_party/equipment are meaningfully different; icon speeds recognition | Low-Medium | Inline SVG or lucide-react icon set mapped to `resource_type` |
| Criticality color coding on activity nodes | critical/high/medium/low already in data; map to a color scale | Low | Tailwind color classes on `className` prop of Node |
| RTO displayed on activity node | RTO hours are the urgency signal for continuity planning; showing them on the node removes the click-to-discover step | Low | Text in custom node component |
| Panel shows "depended on by N activities" for resources | Turns raw dependency count into a risk statement | Low | Derived from dependency edges |
| Smooth edge opacity transition | Dimming non-selected edges with a CSS transition (not instant snap) looks intentional | Low | Tailwind `transition-opacity` on edge `className` |
| Empty state / loading state on reload | Shows the app is doing something; prevents "did it work?" confusion | Low | Conditional render during reload |

---

## Anti-Features

Things to deliberately not build. Each would consume time without proportionate evaluator signal.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Edit/add/remove nodes or edges | This is a viewer, not an editor; adds drag-connect complexity | `nodesDraggable={false}` and no onConnect handler |
| Multi-select | Assignment only mentions single node selection; multi-select complicates highlight logic | Single selection model only |
| Tooltip-only SPOF indicator | Explicitly called out as insufficient in the assignment | Permanent visible badge/ring |
| Mobile/responsive layout | Assignment explicitly excludes this | Desktop viewport only, no breakpoints |
| Right-click context menu | No functional use in a static viewer | Skip entirely |
| Search/filter bar | Graph has 23 nodes — small enough to scan visually | Skip; adds UI complexity for no gain at this scale |
| Animated edges | Can obscure directionality; animated flowing edges imply data movement | Static edges with arrowheads |
| Undo/redo | Read-only graph; nothing to undo | Not applicable |
| Minimap | 23 nodes at a reasonable initial layout fit in one viewport; minimap wastes space | Skip or make optional via `<Controls>` component |
| Persistence (localStorage) | Static viewer; state resets on reload by design | No persistence layer |

---

## SPOF Visualization Patterns

What makes SPOF status legible without requiring a hover or click.

### The core problem
A tooltip is hidden by default. The user must already suspect a node is a SPOF to hover it. The goal is the opposite: the graph should surface risk immediately, before the user forms a hypothesis.

### Pattern 1: Persistent badge (recommended)
A small pill or circle badge attached to the node, always visible. Shows the dependency count ("x3") or a warning icon. This pattern is used in GitHub for notification counts and in monitoring dashboards for alert states.

**Why it works:** Visible in all states (default, selected, de-emphasized). Communicates both presence of risk and its magnitude (the count) without interaction. Small enough to not crowd the node label.

**Implementation in React Flow 12:** Custom node component renders a `<div>` with relative positioning. Badge is `position: absolute; top: -8px; right: -8px` — standard CSS badge pattern. The node's `data` field carries an `isSPOF: boolean` and `dependencyCount: number`, computed before passing nodes to React Flow.

### Pattern 2: Ring/border highlight (complementary)
A distinct border color or ring around the node — amber or red — as a persistent indicator. Used by most network topology tools (Datadog, Grafana node graphs) for alert states.

**Why it works:** Works even when a badge would be too small to read (zoomed out). Combines well with Pattern 1 — use both.

**Implementation in React Flow 12:** `className` on the node object drives Tailwind ring classes: `ring-2 ring-amber-400`. Applied as a derived property before the nodes array is set.

### Pattern 3: Icon (complementary)
A warning triangle icon (SVG or lucide-react `AlertTriangle`) inside or beside the node label. Universally recognized as "attention required."

**Why it works:** Iconographic; reads at smaller sizes than text. Redundant with ring/badge — use as a third signal only if the node card has room.

### What does NOT work
- Tooltip-only: invisible until hovered — explicitly rejected by the assignment.
- Color alone without shape/text: users with color vision deficiency lose the signal. Add a badge or icon as a second channel.
- Pulsing animation: draws the eye but communicates urgency, not SPOF specifically. Misleading in a static viewer.
- Z-index elevation: raising SPOF nodes above others adds visual complexity without clarity.

### SPOF data derived from graph.json
Based on the actual dependency data, resources with more than one inbound dependency (SPOF candidates):

| Resource | Name | Inbound Deps | Activities |
|----------|------|-------------|------------|
| res-1 | Core Banking System | 3 | act-1, act-2, act-5 |
| res-3 | Data Warehouse | 2 | act-3, act-5 |
| res-4 | Salesforce CRM | 2 | act-2, act-4 |
| res-5 | VPN & Network Access | 2 | act-4, act-8 |
| res-7 | IT Infrastructure Team | 2 | act-7, act-8 |
| res-9 | HQ Office | 2 | act-6, act-8 |
| res-10 | Primary Data Centre | 3 | act-1, act-3, act-7 |
| res-11 | AWS Cloud Infrastructure | 2 | act-6, act-7 |
| res-12 | Microsoft 365 | 4 | act-2, act-4, act-5, act-8 |

res-12 (Microsoft 365) is the highest-risk SPOF: 4 activities depend on it, including act-4 and act-5. This should be the most visually prominent SPOF indicator.

---

## Node Interaction Patterns

Selection, highlight, and dimming in React Flow 12.

### The selection model for this viewer

This is a custom selection model, not React Flow's built-in multi-selection. Reason: the assignment requires "highlight immediate connections" — a graph-traversal highlight, not an element-selection highlight. React Flow's built-in `selected` flag would require fighting the library's default selection rendering.

**Recommended approach:** Maintain a `selectedNodeId: string | null` state external to React Flow. On click, derive two sets: connected node ids and connected edge ids. Apply a CSS class via the `className` prop or a style via the `style` prop on every node and edge, switching between "active", "dimmed", and "default" visual states.

### Deriving connected nodes/edges

```
Given selectedNodeId:
  connectedEdgeIds = edges where edge.source === selectedNodeId OR edge.target === selectedNodeId
  connectedNodeIds = for each connectedEdge, the node id that is NOT selectedNodeId

  Display state per node:
    - selectedNodeId → "selected" (full opacity, accent ring)
    - connectedNodeIds → "connected" (full opacity, no ring)
    - everything else → "dimmed" (opacity: 0.2-0.3)

  Display state per edge:
    - connectedEdgeIds → "active" (full opacity, colored)
    - everything else → "dimmed" (opacity: 0.1)
```

This is a pure derivation from state — no mutation of the React Flow internal store needed.

### Opacity values that work

- Dimmed nodes: `opacity: 0.25` — visible enough to show the graph structure, dark enough to feel de-emphasized. Values below 0.15 make the graph look broken. Values above 0.4 don't feel "dimmed."
- Dimmed edges: `opacity: 0.1` — edges carry less semantic weight than nodes; dimming them more aggressively is acceptable.
- Transition: `transition: opacity 150ms ease` — instant opacity changes feel jarring. 150ms is fast enough to feel responsive, slow enough to feel intentional.

### Click-to-clear pattern

Two mechanisms, both required:
1. `onPaneClick` on the `<ReactFlow>` component: clears `selectedNodeId` when background is clicked.
2. In `onNodeClick`: if the clicked node's id equals the current `selectedNodeId`, clear it (toggle off). Otherwise, set it as the new selection.

This is exactly the pattern in the assignment requirements. React Flow's `onPaneClick` prop is confirmed available in the component-props type definition.

### Hover vs click

- Hover (onMouseEnter/onMouseLeave) should NOT trigger the full highlight/dim cycle. It adds a second competing visual state that conflicts with the persisted selection.
- Hover can show a cursor change (`cursor: pointer`) to signal interactivity.
- The info panel should only update on click, not hover. Hover-triggered panels are fragile on graphs because edge proximity causes accidental triggers.

### Dragging

Nodes should not be draggable in a viewer. Set `nodesDraggable={false}` on the `<ReactFlow>` component. Dragging conflicts with the read-only mental model and does not persist across reloads.

### React Flow 12 API surface confirmed for this pattern

From `component-props.d.ts`:
- `onNodeClick?: NodeMouseHandler<NodeType>` — single node click
- `onPaneClick?: (event: ReactMouseEvent) => void` — background click
- `onNodeMouseEnter`, `onNodeMouseLeave` — available if hover state needed

From `types/nodes.d.ts`:
- `Node.className?: string` — accepts Tailwind classes
- `Node.style?: CSSProperties` — accepts inline styles

From `types/edges.d.ts`:
- `Edge.className?: string`
- `Edge.style?: CSSProperties`

From `hooks/useReactFlow.d.ts`:
- `setNodes`, `updateNode`, `updateNodeData` — all confirmed for updating node state post-click

The cleanest pattern: do NOT call `updateNode` on every click (triggers individual node re-renders). Instead, derive `className`/`style` in the render path by mapping over all nodes and edges before passing them to the `<ReactFlow>` component. This is a single state value (`selectedNodeId`) driving a computed transformation — predictable, testable, no stale closure issues.

---

## Info Panel Patterns

What works alongside a graph viewer.

### Fixed sidebar vs. floating overlay

Use a fixed sidebar. Floating overlays (positioned over the graph) occlude nodes near the panel. With 23 nodes and a full-viewport graph, a node near the right edge will always be under the overlay when selected.

Fixed sidebar dimensions: `width: 280-320px`, `height: 100vh`, anchored to the right edge. The graph area takes `width: calc(100vw - 320px)`. The React Flow container fills its parent, so this is a pure CSS layout concern.

### Panel content hierarchy for this domain

For a business continuity tool, the user's cognitive task when clicking a node is: "what is the risk?" — not "what are the technical details?" Order panel content by risk relevance, not by data schema order.

**Activity node panel:**

```
[Node name — large, prominent]
[Priority badge: CRITICAL / HIGH / MEDIUM / LOW]
RTO: X hours
Owner: [team name]
---
Connected resources: [N]
[List of connected resource names with SPOF badges inline]
```

**Resource node panel:**

```
[Node name — large, prominent]
[SPOF indicator if applicable — prominent, not buried]
Type: technology / people / building / third_party / equipment
[Vendor name if third_party]
Contact: [person or team]
---
Depended on by: [N activities]
[List of connected activity names with priority badges inline]
```

### SPOF indicator in the panel

The SPOF indicator in the panel should be MORE explicit than on the graph node, not the same. On the node, a badge or ring is enough. In the panel, use a full contextual statement:

> "Single Point of Failure — 4 activities depend on this resource. If it fails, the following are impacted: Payment Processing, Customer Support, Regulatory Reporting, IT Service Desk."

This turns a visual flag into an actionable risk statement. It is what makes the panel valuable beyond what the graph itself already shows.

### Empty state

When no node is selected, the panel should not be empty or hidden (which would cause a layout jump on selection). Render a placeholder:

> "Select any node to see details"

A visible empty state also signals to the evaluator that the panel exists and is intentional, not an accidental render.

### Panel animation

Animate the panel content swap (fade or slide) when the selected node changes. This prevents the perception that the panel text is "updating in place" — it signals that a new context was loaded. A 100ms fade-out/fade-in is sufficient.

Do not animate the panel's width or position. Layout shifts are disorienting and can cause reflows that jitter the graph.

---

## Feature Priority for MVP

Given the assignment is a 1-2 hour task for a senior engineer, the ordering:

**Must ship (assignment requirements):**
1. Dagre layout + rendered graph with distinct activity/resource nodes
2. SPOF detection with persistent badge + ring
3. Click highlight/dim cycle with clear-on-background-or-reclick
4. Fixed sidebar info panel with SPOF context statement
5. Reload button
6. Criticality ordering toggles (both axes)

**Should ship (distinguishes senior work):**
7. Resource type icons in nodes
8. RTO displayed on activity nodes
9. Smooth opacity transitions on dim/undim
10. Panel shows "depended on by N" with activity list

**Skip:**
- Everything in the Anti-Features table above

---

## Sources

- React Flow 12.10.2 type definitions: `/node_modules/@xyflow/react/dist/esm/types/` — HIGH confidence
- graph.json dependency analysis: `/data/graph.json` — HIGH confidence (primary source)
- UX patterns: derived from common patterns in Datadog service maps, GitHub dependency graphs, Grafana node panels — MEDIUM confidence
- SPOF opacity values: established convention in graph visualization tools (Gephi, D3 force graph examples) — MEDIUM confidence
