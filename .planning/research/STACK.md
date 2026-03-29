# Stack Research

**Project:** Dependency Graph Viewer
**Researched:** 2026-03-29
**Scope:** @xyflow/react v12.10.2 + Next.js 16.2.1 + React 19 + Tailwind v4 (locked)

---

## Recommended Libraries

| Library | Version to install | Purpose | Rationale |
|---------|-------------------|---------|-----------|
| `@dagrejs/dagre` | `^1.1.4` | Directed graph layout (Sugiyama/layered) | De-facto standard for React Flow layouts; produces left-to-right or top-to-bottom ranked layers that map exactly to the activity→resource hierarchy in this dataset. Pure JS, no WASM, synchronous execution. |
| `@dagrejs/graphlib` | bundled with @dagrejs/dagre | Graph data structure (nodes, edges, cycle detection) | Installed transitively with @dagrejs/dagre. Exposes `alg.findCycles()` and `alg.isAcyclic()` for cycle detection, topological sort, and connected components. No separate install needed. |

No other layout or graph-analysis library is needed for this project. The dataset is 23 nodes and 29 edges — far below any threshold where performance or algorithmic complexity matters.

---

## Layout Engine Options

| Library | Algorithm | Install size | Sync/Async | React Flow integration | Fit for this project |
|---------|-----------|-------------|-----------|----------------------|---------------------|
| **@dagrejs/dagre** | Sugiyama layered (ranked layout) | ~150 kB | Synchronous | Official React Flow examples use it; pass layouted `{x,y}` back to `setNodes` | **Yes — recommended** |
| **elkjs** | ELK (multiple algorithms: layered, force, orth) | ~2.5 MB + Web Worker recommended | Asynchronous (Worker) | Works with React Flow but requires async handling and a Worker setup in Next.js | Overkill — adds async complexity and bundle weight for a 23-node graph |
| **d3-hierarchy** | Dendrogram / tree (parent→children) | ~20 kB | Synchronous | Possible but requires a true tree; this graph has shared resources (diamond shapes), so d3-hierarchy breaks on nodes with multiple parents | No — graph is not a tree |
| **d3-force** | Force-directed (physics simulation) | ~25 kB | Asynchronous (tick loop) | Possible but produces organic/non-hierarchical layouts; hides the layered activity→resource structure | No — obscures domain semantics |

**Verdict:** Use `@dagrejs/dagre`. It is synchronous, small, and produces ranked layouts that visually communicate the activity→resource dependency hierarchy immediately.

---

## Key Findings

**@xyflow/react v12 API surface (verified from installed source):**

- The primary component is `<ReactFlow />` (not `ReactFlowRenderer`). Import as `import { ReactFlow } from '@xyflow/react'`.
- `useNodesState` / `useEdgesState` return `[nodes, setNodes, onNodesChange]` — the three-tuple pattern. Pass `onNodesChange` to `<ReactFlow onNodesChange={...} />`.
- `useReactFlow()` returns `{ setNodes, setEdges, fitView, getNodes, getEdges, updateNode, updateNodeData, ... }`. The instance is only available inside a `ReactFlowProvider` subtree.
- `useNodesInitialized()` returns a boolean that flips `true` after all nodes have been measured and given width/height by the DOM. This is the correct trigger point for running dagre layout: run layout inside a `useEffect` gated on `nodesInitialized === true`, then call `setNodes` with updated positions.
- Graph utility functions `getIncomers`, `getOutgoers`, `getConnectedEdges` are re-exported from `@xyflow/react` directly. Use these for blast-radius / selection highlighting — no external graph library needed.
- `MarkerType.ArrowClosed` is the correct enum value for directed edge arrowheads. Import from `@xyflow/react`.
- CSS: import `@xyflow/react/dist/style.css` (full themed stylesheet) or `@xyflow/react/dist/base.css` (unstyled base). The full `style.css` works with Tailwind v4 without conflict.

**React Compiler is enabled (`reactCompiler: true` in next.config.ts):**

- `babel-plugin-react-compiler@1.0.0` is installed as a dev dependency.
- The React Compiler auto-memoizes components and hooks. This means you must NOT mutate state directly. In particular: dagre mutates its own internal `Graph` object during layout computation — this is fine because you construct a fresh dagre `Graph` instance each time layout runs (not a React state object). The rule is: never mutate React state or props directly.
- @xyflow/react uses zustand internally for its store. The React Compiler is compatible with zustand-based libraries as long as you don't break the Rules of Hooks.

**Next.js 16.2.1 + Server Components:**

- @xyflow/react depends on `useState`, `useEffect`, and browser DOM APIs (`ResizeObserver`, event listeners). It cannot run as a Server Component.
- The entire graph canvas component tree must be a Client Component. Add `'use client'` to the top-level graph component file. All child components imported from that file automatically become client components — no need to add `'use client'` to every node/edge renderer.
- Data loading from `data/graph.json` can happen in a Server Component (the page) and be passed as a prop to the Client Component. This is the recommended pattern per Next.js docs: Server Component fetches, Client Component renders.
- `params` in page components is now a `Promise<{...}>` in Next.js 16 — must be awaited. Not relevant here since there are no dynamic routes, but worth knowing.

**Graph analysis — SPOF detection:**

- SPOF detection (resource nodes depended on by more than one activity) is pure array arithmetic on the `dependencies` array from `graph.json`. No external library needed.
- Dependency count per resource: `dependencies.filter(d => d.to === nodeId).length`.
- Cycle detection: The dataset has no cycles (confirmed: all edges go from `act-*` to `res-*`, except `act-8 → act-6` which is a single activity-to-activity edge, still acyclic). If cycle detection is needed at runtime, `@dagrejs/graphlib`'s `alg.isAcyclic()` is available for free via the dagre transitive dependency.

**Tailwind CSS v4:**

- v4 uses a CSS-first config (`@import "tailwindcss"` in CSS, no `tailwind.config.js` by default). Utility classes work identically to v3 for what this project needs.
- The `@tailwindcss/postcss` plugin (v4) is already installed. No additional Tailwind configuration needed for this project.

**No state management library needed:**

- `useNodesState` / `useEdgesState` from @xyflow/react plus `useState` for sidebar selection state is sufficient for a single-page, single-graph UI.
- Adding Zustand, Jotai, or Redux for a project of this scope is over-engineering.

---

## What NOT to Use

| Library | Reason to avoid |
|---------|----------------|
| `elkjs` | Async + Web Worker setup; 2.5 MB bundle; overkill for 23 nodes. Adds complexity with zero benefit at this scale. |
| `d3-hierarchy` | Requires strict tree topology (single parent per node). This graph has shared resources — multiple activities depend on the same resource (res-1, res-12, etc.) — so d3-hierarchy cannot represent it. |
| `d3-force` | Force-directed layout hides the layered activity→resource structure that is the point of the visualization. Users cannot read the hierarchy at a glance. |
| `reactflow` (old package name) | The old npm package. The new package is `@xyflow/react`. Already installed correctly. Do not install `reactflow` as well — it will create a duplicate bundled instance. |
| `dagre` (unscoped) | The original `dagre` package is unmaintained. Use `@dagrejs/dagre` which is the actively maintained fork. |
| `graphlib` (unscoped) | Same reason — use `@dagrejs/graphlib` (available as dagre's dep) instead. |
| External state managers (Zustand, Jotai, Redux) | Single-page read-only visualization. `useState` + React Flow's built-in state hooks are sufficient. |
| `next-themes` or similar | No theming requirement. Tailwind v4 `dark:` variants can be used directly if dark mode is added later. |

---

## Confidence Levels

| Recommendation | Confidence | Source |
|---------------|-----------|--------|
| @dagrejs/dagre for layout | HIGH | Verified against installed @xyflow/react v12.10.2 API — `useNodesInitialized` docstring explicitly shows dagre integration pattern; React Flow official examples use dagre |
| `'use client'` required for @xyflow/react | HIGH | Verified from Next.js 16 bundled docs (server-and-client-components.md) + @xyflow/react package.json (uses useState/useEffect/ResizeObserver) |
| useNodesInitialized as layout trigger | HIGH | Verified from installed type declaration with embedded JSDoc example showing exactly this pattern |
| getIncomers / getOutgoers from @xyflow/react | HIGH | Verified from installed dist/esm/index.d.ts — both functions are re-exported |
| React Compiler compatibility with dagre | MEDIUM | React Compiler ships as `1.0.0` (stable). Risk is mutations inside layout functions, not inside React state. Pattern is safe as long as dagre Graph instance is constructed locally, not stored in state. Cannot verify React Compiler + dagre combination directly without a running environment. |
| No additional graph analysis library needed | HIGH | Verified: dataset is 23 nodes, 29 edges; all required operations (SPOF counting, adjacency for highlight) are O(n) array operations; @xyflow/react already exports getIncomers/getOutgoers |
| elkjs not needed | HIGH | Dataset scale makes async layout overhead unjustified; dagre covers the use case fully |
| d3-hierarchy incompatible | HIGH | Graph contains diamond topology (multiple activities → same resource) confirmed from graph.json analysis; d3-hierarchy requires strict tree |

---

## Installation

```bash
pnpm add @dagrejs/dagre
pnpm add -D @types/dagre
```

`@dagrejs/graphlib` installs automatically as a dependency of `@dagrejs/dagre`. No separate install required.

All other needed functionality (`getIncomers`, `getOutgoers`, `getConnectedEdges`, `MarkerType`, layout trigger via `useNodesInitialized`) is already provided by the installed `@xyflow/react@12.10.2`.

---

## Sources

- `/Users/sachinbaral/Downloads/dep-graph-viewer/node_modules/@xyflow/react/dist/esm/index.d.ts` — confirmed exported API surface
- `/Users/sachinbaral/Downloads/dep-graph-viewer/node_modules/@xyflow/react/dist/esm/hooks/useNodesInitialized.d.ts` — confirmed layout trigger pattern with JSDoc example
- `/Users/sachinbaral/Downloads/dep-graph-viewer/node_modules/@xyflow/react/dist/esm/hooks/useNodesEdgesState.d.ts` — confirmed state hook API
- `/Users/sachinbaral/Downloads/dep-graph-viewer/node_modules/@xyflow/react/dist/esm/types/instance.d.ts` — confirmed ReactFlowInstance helper methods
- `/Users/sachinbaral/Downloads/dep-graph-viewer/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` — confirmed 'use client' requirement for third-party components using browser APIs
- `/Users/sachinbaral/Downloads/dep-graph-viewer/next.config.ts` — confirmed React Compiler is enabled
- `/Users/sachinbaral/Downloads/dep-graph-viewer/data/graph.json` — confirmed graph topology (23 nodes, 29 edges, diamond shapes, one act-to-act edge)
- `/Users/sachinbaral/Downloads/dep-graph-viewer/package.json` — confirmed installed versions
