# Project Research Summary

**Project:** Dependency Graph Viewer
**Domain:** Interactive directed graph viewer for business continuity management
**Researched:** 2026-03-29
**Confidence:** HIGH

## Executive Summary

This is a read-only, single-page interactive graph viewer built on an already-scaffolded Next.js 16.2.1 / React 19 / Tailwind v4 stack. The domain is business continuity planning: 8 activities depend on 15 resources, and the viewer's central job is to make risk legible — specifically Single Points of Failure (SPOFs) and blast-radius selection. The recommended approach is a tight, purpose-built UI: `@xyflow/react` v12 for the canvas, `@dagrejs/dagre` for layout, and nothing else. The graph is 23 nodes and 29 edges — no library heavier than dagre is warranted.

The architecture is clean and well-defined. All graph rendering lives in a `'use client'` subtree rooted at `GraphPage.tsx`. The Server Component page passes static `graph.json` data as a prop; the client side owns all state. Selection state (`selectedNodeId: string | null`) drives all visual output as a pure derivation — no mutations, no secondary state stores. The lib layer (`transform.ts`, `spof.ts`, `layout.ts`) is pure functions that are trivially testable in isolation.

The key risks are all well-documented and preventable. The most dangerous are: (1) forgetting `'use client'` on any file importing from `@xyflow/react` (hard SSR crash), (2) defining `nodeTypes` inline rather than at module scope (causes all 23 nodes to remount on every render), and (3) running the dagre layout before React Flow has measured nodes via `useNodesInitialized()` (produces all nodes stacked at 0,0). These are all confirmed, verified pitfalls with known fixes.

## Key Findings

### Recommended Stack

The installed stack (`@xyflow/react@12.10.2`, Next.js 16.2.1, React 19, Tailwind v4) is sufficient as-is. One library needs to be added: `@dagrejs/dagre` for layout. Everything else — graph traversal utilities (`getIncomers`, `getOutgoers`, `getConnectedEdges`), edge directionality (`MarkerType.ArrowClosed`), layout trigger (`useNodesInitialized`) — is already exported from the installed `@xyflow/react` package. No state management library (Zustand, Jotai, Redux) is needed; `useState` + React Flow's built-in hooks are sufficient for a single-page read-only viewer.

The React Compiler is active (`reactCompiler: true` in `next.config.ts`). This is compatible with `@xyflow/react`'s Zustand-based internals as long as no React state or props are mutated directly. The risk area is stale state in the graph component — mitigated by adding `"use no memo"` to `GraphPage.tsx` if stale renders are observed.

**Core technologies:**
- `@xyflow/react@12.10.2`: canvas, node/edge rendering, zoom/pan, event handlers — already installed; the library boundary (`'use client'`) must be respected
- `@dagrejs/dagre@^1.1.4`: deterministic ranked layout (Sugiyama algorithm) — install via `pnpm add @dagrejs/dagre`; `@dagrejs/graphlib` comes free as a transitive dep
- `Tailwind CSS v4`: CSS-first config, no `tailwind.config.js` needed; `@tailwindcss/postcss` already installed

**What not to install:** `elkjs` (async + 2.5 MB, overkill), `d3-hierarchy` (incompatible with diamond topology), `d3-force` (obscures the hierarchy), `reactflow` (old package name — duplicate bundle), `dagre` unscoped (unmaintained).

### Expected Features

**Must have (assignment requirements):**
- Dagre layout with visually distinct activity vs. resource nodes
- SPOF indicator: persistent badge + ring (NOT tooltip-only — explicitly disallowed)
- Click node to highlight immediate connections; dim everything else
- Click background or re-click selected node to clear selection
- Fixed sidebar info panel with SPOF context statement ("N activities depend on this")
- Reload button (re-fetch graph.json, reset all state)
- Criticality sort toggles for both activities and resources

**Should have (distinguishes senior work):**
- Resource type icons in nodes (technology/people/building/third_party/equipment)
- RTO hours displayed on activity nodes
- Smooth opacity transitions on dim/undim (150ms ease)
- Panel shows "depended on by N activities" with activity list
- SPOF badge showing dependency count inline (e.g., "x4")

**Defer — do not build:**
- Node editing / drag-to-connect (this is a viewer, not an editor; set `nodesDraggable={false}`)
- Multi-select (single selection model only)
- Search/filter (23 nodes is small enough to scan visually)
- Mobile/responsive layout (explicitly excluded by assignment)
- Minimap, animated edges, undo/redo, localStorage persistence

**SPOF data (from actual graph.json analysis):** 9 resources are SPOFs. res-12 (Microsoft 365) is the highest-risk at 4 dependent activities. res-1 (Core Banking System) and res-10 (Primary Data Centre) each have 3. These specific nodes should be visually prominent.

### Architecture Approach

The app follows a clean server/client split with a single `'use client'` boundary. `page.tsx` stays a Server Component and passes `graph.json` as a static prop. All state lives in `GraphPage.tsx`. Display-time visual state (dimming, opacity) is derived via `useMemo` from `selectedNodeId` — nodes and edges are never mutated. The lib layer is pure functions with no React dependencies, enabling isolated testing.

**Major components:**
1. `GraphPage.tsx` — `'use client'` root; owns `nodes`, `edges`, `selectedNodeId`, sort state; derives `displayNodes`/`displayEdges` via `useMemo`
2. `GraphCanvas.tsx` — wraps `<ReactFlow>` with `nodeTypes`, `fitView`, `onNodeClick`, `onPaneClick`; no internal state
3. `ActivityNode.tsx` / `ResourceNode.tsx` — custom node renderers; `ActivityNode` shows priority badge and RTO; `ResourceNode` shows SPOF badge and resource type icon
4. `InfoSidebar.tsx` — purely presentational; receives `selectedNode: AppNode | null`; shows risk-ordered content with full SPOF context statement
5. `Toolbar.tsx` — reload button + two sort toggles; calls callbacks from `GraphPage`
6. `src/lib/transform.ts` — pure function: `GraphJson → { nodes: AppNode[], edges: AppEdge[] }` including SPOF computation
7. `src/lib/layout.ts` — pure function: runs dagre layout, returns positioned nodes

**Critical architecture constraint:** `nodeTypes` must be defined at module scope (stable reference). Defining it inside a component body causes all 23 nodes to remount on every render. `ReactFlowProvider` is not needed as long as `InfoSidebar` receives selection state via props rather than React Flow hooks.

### Critical Pitfalls

1. **Missing `'use client'` on any file importing `@xyflow/react`** — hard SSR crash at build time. Every file importing from the library (including custom node components) must start with `'use client'`. The page itself can remain a Server Component.

2. **Defining `nodeTypes` inside the component body** — triggers `error002` warning in React Flow; all 23 nodes remount on every render, causing visible flicker and potential infinite loops. Fix: define at module scope or in a separate `nodeTypes.ts` file.

3. **Running dagre before `useNodesInitialized()` returns true** — nodes have no measured dimensions; dagre assigns `NaN` positions and all nodes stack at `(0,0)`. Fix: gate the layout `useEffect` on `nodesInitialized === true`.

4. **Calling `fitView` as a prop rather than programmatically after layout** — viewport fits before layout runs (nodes still at 0,0) then snaps. Fix: call `reactFlowInstance.fitView()` inside a `requestAnimationFrame` after `setNodes(layoutedNodes)`.

5. **Missing CSS import** — silent failure, canvas is blank/invisible. Fix: `import '@xyflow/react/dist/style.css'` in the graph Client Component (not `globals.css`) to avoid Tailwind v4 cascade conflicts.

6. **React Compiler + Zustand-based hooks (MEDIUM confidence)** — the React Compiler may optimize away re-renders that Zustand subscriptions depend on. Symptom: graph stops updating after interactions. Fix: add `"use no memo"` to `GraphPage.tsx` if this occurs.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Static Graph Render
**Rationale:** Everything downstream depends on having a working React Flow canvas with correct data. Pitfalls 1, 2, 3, and 5 all manifest here — resolve them in the first phase so nothing cascades.
**Delivers:** Styled graph canvas with activity and resource nodes, dagre layout, directed edges with arrowheads, zoom/pan. Not yet interactive.
**Addresses:** "Reasonable initial layout", "Visually distinct node types", "Directed edges with arrowheads"
**Avoids:** SSR crash (Pitfall 1), blank canvas (Pitfall 5), nodes at 0,0 (Pitfall 3), fitView snap (Pitfall 4), nodeTypes remount (Pitfall 2)
**Implementation order within phase:** types → transform.ts → spof.ts → layout.ts → custom node components → GraphCanvas.tsx → GraphPage.tsx → wire into page.tsx

### Phase 2: SPOF Detection and Visual Indicators
**Rationale:** SPOF computation is already done in the transform layer (Phase 1). This phase wires the computed `isSpof` and `dependencyCount` flags into visible, always-on node decoration. Must come before interactivity because the SPOF badge styling may affect node dimensions — which affects layout positions.
**Delivers:** Persistent SPOF badge with dependency count and amber ring on all 9 SPOF resource nodes. res-12 visually most prominent (count: 4).
**Addresses:** "SPOF indicator visible at a glance", "SPOF blast radius count on badge"
**Avoids:** Tooltip-only pattern (explicitly disallowed), color-alone pattern (accessibility)

### Phase 3: Selection, Highlight, and Info Sidebar
**Rationale:** Core interactive requirement. Depends on Phase 1 and 2 being stable because the dimming logic references the full node/edge arrays and SPOF data appears in the sidebar content.
**Delivers:** Click-to-highlight with opacity dimming, click-to-clear, fixed sidebar info panel with SPOF risk statement, smooth transitions.
**Addresses:** "Click node to highlight connections", "Click background/selected to clear", "Sidebar info panel", smooth transition differentiator
**Avoids:** Re-rendering all nodes on selection change (Perf Pitfall 1), flow hooks outside ReactFlow context (Pitfall 4)

### Phase 4: Toolbar, Reload, and Sort Toggles
**Rationale:** Reload requires resetting all controlled state back to initial conditions. Sort requires re-running dagre layout with reordered node groups. Both are independent of the selection mechanics and can be built after the core UX is stable.
**Delivers:** Working reload button (re-fetch + full state reset), criticality sort toggles for activities and resources.
**Addresses:** "Reload button", "Criticality ordering toggles"
**Avoids:** nodeTypes warning on component remount during reload (keep `nodeTypes` at module scope)

### Phase 5: Polish and Differentiators
**Rationale:** Ship the assignment requirements first (Phases 1-4). Polish only after core features are verified working.
**Delivers:** Resource type icons, RTO on activity nodes, "depended on by N" in sidebar, edge color differentiation, loading/empty states on reload.
**Addresses:** All "should have" differentiators from FEATURES.md
**Avoids:** Scope creep into anti-features (editing, multi-select, mobile layout)

### Phase Ordering Rationale

- Types and pure lib functions come first because all components depend on correct types. A type error discovered late is expensive.
- SPOF decoration (Phase 2) precedes interactivity (Phase 3) because SPOF badge dimensions affect dagre layout positions — changing them after interaction is wired would shift all node positions.
- Reload (Phase 4) is last among required features because it's easier to verify reset behavior once the full interactive state exists to reset.
- Differentiators (Phase 5) are isolated so the MVP can ship without them — the assignment is completable after Phase 4.

### Research Flags

Phases with well-documented patterns (skip additional research):
- **Phase 1 (Foundation):** All API surface verified from installed package source. `useNodesInitialized` pattern is in the type declarations with JSDoc example.
- **Phase 2 (SPOF):** Pure arithmetic on the dependency array. Badge pattern is standard CSS (`position: absolute; top: -8px; right: -8px`).
- **Phase 3 (Selection):** `displayNodes`/`displayEdges` derivation pattern is fully specified in ARCHITECTURE.md; confirmed API surface in FEATURES.md.
- **Phase 4 (Toolbar):** Standard React controlled component patterns.
- **Phase 5 (Polish):** Standard Tailwind and icon patterns.

Phases needing caution (not additional research, but implementation care):
- **Phase 1:** React Compiler + `useNodesState` interaction. Monitor for stale graph state; add `"use no memo"` to `GraphPage.tsx` if observed.
- **Phase 3:** Ensure `connectedIds` derivation uses `useMemo` correctly — stale closure risk if edges reference is not in the dependency array.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All API claims verified against installed `@xyflow/react@12.10.2` type declarations and Next.js 16 bundled docs |
| Features | HIGH | Based on direct analysis of `graph.json` (primary source) + React Flow 12 type definitions; SPOF data is ground truth |
| Architecture | HIGH | Component structure and data flow verified against installed package APIs; all type signatures confirmed |
| Pitfalls | HIGH (mostly) | Critical pitfalls verified from installed ESM bundle source lines. One MEDIUM: React Compiler + Zustand interaction (active issue as of early 2026) |

**Overall confidence:** HIGH

### Gaps to Address

- **React Compiler + Zustand stale state (MEDIUM confidence):** Cannot verify without a running environment. Mitigation is known (`"use no memo"`), but whether it will actually be needed is unknown until implementation. Flag `GraphPage.tsx` for early testing.
- **Tailwind v4 + React Flow CSS ordering:** The recommendation to import React Flow CSS in the Client Component (not `globals.css`) is based on documented Next.js CSS chunking behavior, but has not been empirically verified for this exact Tailwind v4 + Next.js 16 combination. If nodes appear unstyled despite the import, check import order first.
- **`@dagrejs/dagre` TypeScript types:** Research recommended `pnpm add -D @types/dagre` but also noted `@dagrejs/types` as an alternative. Verify which package provides correct types for `@dagrejs/dagre@^1.1.4` at install time.

## Sources

### Primary (HIGH confidence)
- `node_modules/@xyflow/react/dist/esm/index.d.ts` — full API surface of `@xyflow/react@12.10.2`
- `node_modules/@xyflow/react/dist/esm/hooks/useNodesInitialized.d.ts` — layout trigger pattern with JSDoc example
- `node_modules/@xyflow/react/dist/esm/index.js` — confirmed `"use client"` at line 1, `useNodeOrEdgeTypesWarning` at lines 3088–3102, `zustandErrorMessage` at line 14
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` — `'use client'` boundary rules for Next.js 16
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/reactCompiler.md` — React Compiler integration, `"use no memo"` opt-out
- `data/graph.json` — ground truth for SPOF analysis (9 SPOFs identified, res-12 highest risk at 4 dependencies)
- `next.config.ts` — confirmed `reactCompiler: true`

### Secondary (MEDIUM confidence)
- UX patterns for SPOF visualization: derived from Datadog service maps, GitHub dependency graphs, Grafana node panels
- Opacity values for dimming (0.25 nodes, 0.1 edges, 150ms transition): established convention in Gephi and D3 force graph examples

---
*Research completed: 2026-03-29*
*Ready for roadmap: yes*
