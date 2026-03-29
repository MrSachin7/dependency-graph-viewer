# Phase 1: Static Graph Render - Research

**Researched:** 2026-03-29
**Domain:** @xyflow/react 12.10.2, @dagrejs/dagre 3.0.0, Next.js 16 App Router, Tailwind CSS v4
**Confidence:** HIGH

## Summary

Phase 1 renders 23 nodes (8 activities, 15 resources) and 30 edges from `data/graph.json` in a zoomable, pannable canvas. Activity and resource nodes are visually distinct by color (blue vs. green). Edges use `smoothstep` type with `MarkerType.ArrowClosed`. Nodes are positioned via a dagre TB hierarchical layout. The canvas is hidden until `useNodesInitialized()` returns `true` to prevent the 0,0 snap flash.

The stack is fully locked by the scaffold. `@xyflow/react 12.10.2` is already installed and confirmed. `@dagrejs/dagre` is NOT installed — it must be added before implementation begins. Next.js 16 uses Turbopack by default for dev and build; this has no impact on this phase since no webpack config exists. React Compiler is enabled in `next.config.ts` (`reactCompiler: true`), which can conflict with `useNodesState` — the `"use no memo"` escape hatch is documented below.

The data layer is simple: `graph.json` has a flat `nodes` array and a `dependencies` array. One edge is activity-to-activity (`act-8 → act-6`), which means `act-6` needs both a `target` handle and a `source` handle. The actual edge count in the file is **30**, not 29 as mentioned in some planning documents — verify before asserting counts in tests.

**Primary recommendation:** Install `@dagrejs/dagre` first. Build in this order: types → data transform utility → custom node components → hooks (useGraphData, useDagreLayout) → GraphCanvas → page.tsx wiring.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Pure full-viewport canvas — no header, no title bar, no chrome outside the canvas.
- **D-02:** Graph fills 100vh. React Flow's built-in `<Controls />` component sits bottom-left inside the canvas.
- **D-03:** Activity nodes show name only (e.g., "Onboarding"). No criticality badge — that's Phase 4 scope.
- **D-04:** Resource nodes show name only (e.g., "Core Banking"). No resource type badge — that's Phase 2 (GRAPH-05) scope.
- **D-05:** graph.json is read server-side in a Server Component (page.tsx) and passed as props to the client GraphCanvas component. No useEffect fetch, no loading flash, data is available on first paint.
- **D-06:** Canvas renders with `opacity: 0` until `useNodesInitialized()` returns true (all node dimensions measured and dagre layout applied). Then reveal — no 0,0 snap visible to the user.
- **D-07:** Graph code split across dedicated files:
  - `src/components/GraphCanvas.tsx` — React Flow wrapper ("use client")
  - `src/components/nodes/ActivityNode.tsx` — custom activity node
  - `src/components/nodes/ResourceNode.tsx` — custom resource node
  - `nodeTypes` const defined at module scope in GraphCanvas.tsx (not inside the component body)
- **D-08:** Data transformation (graph.json → React Flow nodes/edges) lives in `src/lib/graph.ts`. GraphCanvas receives already-transformed data as props. page.tsx reads the file, transforms, passes down.

### Claude's Discretion
- Exact Tailwind class composition for node cards (within UI-SPEC constraints: blue border for activities, green for resources, white fill, rounded corners)
- dagre configuration tuning within the spec anchors (rankSep 80, nodeSep 40, TB direction)
- TypeScript type definitions for graph data shapes
- Error boundary implementation for graph render failures

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GRAPH-01 | Graph renders all activity and resource nodes from graph.json as directed edges | graph.json confirmed: 8 activities + 15 resources + 30 edges; transformGraphData maps to RF Node[] + Edge[] |
| GRAPH-02 | Activity nodes and resource nodes are visually distinct (different shape, color, or label style) | Custom node components with Tailwind color tokens: blue-600 (#2563eb) for activities, green-600 (#16a34a) for resources |
| GRAPH-03 | Edges are directed (arrows show dependency direction: activity → resource) | @xyflow/react MarkerType.ArrowClosed confirmed exported; edge type smoothstep confirmed |
| GRAPH-04 | Initial layout is computed automatically using dagre (@dagrejs/dagre) in a hierarchical arrangement | @dagrejs/dagre 3.0.0 confirmed on npm registry; NOT installed — requires `pnpm add @dagrejs/dagre`; dagre graph API confirmed stable |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

| Directive | Value |
|-----------|-------|
| Framework | Next.js 16.2.1 — locked by scaffold |
| React | 19.2.4 — locked by scaffold |
| Graph library | @xyflow/react 12.10.2 — locked, already installed |
| CSS | Tailwind CSS v4 — locked, imported via `@import "tailwindcss"` |
| TypeScript | Strict mode, no `any`, all props fully typed, `Readonly<>` for component props |
| Data source | Static JSON file only — no backend, no API routes |
| Server Components | Default; add `"use client"` only when browser APIs needed |
| Path alias | `@/*` maps to `src/` — all imports use `@/components/...`, `@/lib/...` |
| Linting | `pnpm lint` — ESLint 9 flat config |
| React Compiler | Enabled via `reactCompiler: true` in next.config.ts |
| Build | Turbopack by default in Next.js 16 (dev + build) |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @xyflow/react | 12.10.2 | Graph canvas rendering, node/edge management, viewport | Already installed; locked by scaffold |
| @dagrejs/dagre | 3.0.0 (latest) | Automatic hierarchical node layout (TB direction) | Required by GRAPH-04; official dagre successor package |
| next | 16.2.1 | App Router, Server Components for JSON loading | Locked by scaffold |
| react | 19.2.4 | UI rendering | Locked by scaffold |
| tailwindcss | 4.x | Utility CSS for node cards | Locked by scaffold |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dagrejs/graphlib | 4.0.1 | Peer dep of @dagrejs/dagre | Installed automatically as transitive dep |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dagrejs/dagre | elkjs | ELK produces better layouts for complex graphs but requires Web Worker setup; overkill for 23 nodes |
| @dagrejs/dagre | d3-dag | Less mature; dagre is the @xyflow/react community standard |

**Installation (missing package only):**
```bash
pnpm add @dagrejs/dagre
```

**Version verification:** `@dagrejs/dagre@3.0.0` confirmed via `npm view @dagrejs/dagre dist-tags` on 2026-03-29. `@xyflow/react@12.10.2` confirmed via installed `node_modules/@xyflow/react/package.json`.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx         # existing — root layout, Geist fonts, no changes needed
│   ├── globals.css        # existing — --background token, Tailwind import
│   └── page.tsx           # REPLACE — async Server Component: reads graph.json, calls transformGraphData, renders GraphCanvas
├── components/
│   ├── GraphCanvas.tsx    # NEW — "use client"; ReactFlow wrapper; nodeTypes at module scope
│   └── nodes/
│       ├── ActivityNode.tsx  # NEW — memo; blue border; source+target handles
│       └── ResourceNode.tsx  # NEW — memo; green border; target handle only
├── hooks/
│   ├── useGraphData.ts    # NEW (per UI-SPEC) — loads + transforms graph.json client-side (alternate to D-05 approach)
│   └── useDagreLayout.ts  # NEW — runs dagre on initialized nodes, returns positioned Node[]
├── lib/
│   └── graph.ts           # NEW — transformGraphData(raw: GraphJson): { nodes: Node[], edges: Edge[] }
└── types/
    └── graph.types.ts     # NEW — GraphJson, GraphNode, GraphEdge, ActivityNodeData, ResourceNodeData
```

**Conflict note:** The CONTEXT.md (D-05, D-08) describes server-side data loading in page.tsx with a `src/lib/graph.ts` transform utility. The UI-SPEC's Component Inventory lists a `useGraphData` hook for client-side loading. The CONTEXT.md locked decision (D-05) takes precedence: page.tsx reads the JSON server-side and passes transformed data as props. The `useGraphData` hook from UI-SPEC can be omitted or implemented as a thin wrapper — planner should follow D-05 + D-08 as the authoritative architecture.

### Pattern 1: Server Component reads JSON, passes to Client Component
**What:** page.tsx is an async Server Component that reads `data/graph.json` using Node.js `fs` module, transforms it, and passes as serializable props to `<GraphCanvas>`.
**When to use:** Eliminates loading flash; data available on first SSR paint; required by D-05.
**Example:**
```typescript
// src/app/page.tsx — Server Component (no "use client")
import { readFileSync } from 'fs';
import { join } from 'path';
import type { GraphJson } from '@/types/graph.types';
import { transformGraphData } from '@/lib/graph';
import GraphCanvas from '@/components/GraphCanvas';

export default async function Page() {
  const raw: GraphJson = JSON.parse(
    readFileSync(join(process.cwd(), 'data/graph.json'), 'utf-8')
  );
  const { nodes, edges } = transformGraphData(raw);
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <GraphCanvas initialNodes={nodes} initialEdges={edges} />
    </div>
  );
}
```

### Pattern 2: nodeTypes defined at module scope
**What:** `nodeTypes` and `edgeTypes` objects defined outside the component function body.
**When to use:** Always — defining inside component body causes all 23 nodes to remount on every render because the object reference changes.
**Example:**
```typescript
// Source: @xyflow/react skill SKILL.md — "Register in nodeTypes (define OUTSIDE component)"
import ActivityNode from '@/components/nodes/ActivityNode';
import ResourceNode from '@/components/nodes/ResourceNode';

// CORRECT: module scope
const nodeTypes = {
  activity: ActivityNode,
  resource: ResourceNode,
};

export default function GraphCanvas({ initialNodes, initialEdges }: GraphCanvasProps) {
  // ...
  return <ReactFlow nodeTypes={nodeTypes} ... />;
}
```

### Pattern 3: dagre layout gated on useNodesInitialized
**What:** `useNodesInitialized()` returns `true` only after React Flow has measured all node dimensions. Run dagre inside a `useEffect` that depends on this flag.
**When to use:** Always for auto-layout — running dagre before measurement stacks all nodes at position 0,0.
**Example:**
```typescript
// Source: @xyflow/react dist/esm/hooks/useNodesInitialized.d.ts (verified in node_modules)
import { useNodesInitialized, useReactFlow } from '@xyflow/react';
import { useEffect } from 'react';

export function useDagreLayout(nodes: Node[], edges: Edge[]) {
  const nodesInitialized = useNodesInitialized();
  const { setNodes } = useReactFlow();

  useEffect(() => {
    if (!nodesInitialized) return;
    const positioned = runDagre(nodes, edges);
    setNodes(positioned);
  }, [nodesInitialized]);
}
```

### Pattern 4: opacity-0 canvas reveal
**What:** Wrap `<ReactFlow>` in a container with `opacity-0` class; switch to `opacity-100` after `useNodesInitialized()` is true and dagre positions have been applied.
**When to use:** Required by D-06 to prevent the jarring snap from 0,0 to final positions.
**Example:**
```typescript
const nodesInitialized = useNodesInitialized();
const [layoutApplied, setLayoutApplied] = useState(false);

// After dagre runs, set layoutApplied = true
<div
  style={{ width: '100%', height: '100vh' }}
  className={layoutApplied ? 'opacity-100 transition-opacity duration-300' : 'opacity-0'}
>
  <ReactFlow ... />
</div>
```

### Pattern 5: Custom node with memo + Handle
**What:** Custom node components wrapped in `React.memo`, with `Handle` components for connection points.
**When to use:** All custom nodes — memo prevents unnecessary re-renders; Handle components register connection points.
**Example:**
```typescript
// Source: @xyflow/react skill SKILL.md
import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ActivityNodeData } from '@/types/graph.types';

type ActivityNodeType = Node<ActivityNodeData, 'activity'>;

const ActivityNode = memo(function ActivityNode({ data }: NodeProps<ActivityNodeType>) {
  return (
    <div className="w-[160px] h-[48px] bg-white border-2 border-blue-600 rounded-lg flex items-center justify-center px-4">
      <Handle type="target" position={Position.Top} />
      <span className="text-[13px] font-medium text-blue-600 text-center leading-tight truncate">
        {data.name}
      </span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
```

### Pattern 6: dagre graph construction
**What:** Build a `graphlib.Graph`, set node/edge data, call `dagre.layout()`, extract positioned coordinates.
**When to use:** In `useDagreLayout` hook or `src/lib/graph.ts` layout utility.
**Example:**
```typescript
// Source: @dagrejs/dagre README + community patterns
import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 48; // use uniform height for dagre ranking

export function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const { x, y } = g.node(node.id);
    return {
      ...node,
      position: {
        x: x - NODE_WIDTH / 2,
        y: y - NODE_HEIGHT / 2,
      },
    };
  });
}
```

### Anti-Patterns to Avoid
- **nodeTypes inside component body:** Causes all 23 nodes to remount on every render. Define at module scope.
- **Running dagre before `useNodesInitialized()`:** All nodes render at position 0,0, causing jarring snap. Gate on the hook.
- **`"use client"` on page.tsx:** page.tsx must remain a Server Component to read the filesystem and pass data as props (D-05).
- **Using `any` in TypeScript:** Prohibited by CLAUDE.md. Define explicit types for GraphJson, NodeData shapes.
- **`useEffect` fetch of graph.json in client:** Prohibited by D-05; causes loading flash and network round-trip in dev.
- **Relative imports instead of `@/` alias:** CLAUDE.md requires `@/*` for all src imports.
- **`ReactFlowProvider` omission:** `useNodesInitialized`, `useReactFlow`, and other hooks require the provider context. If GraphCanvas is the only React Flow component, the `<ReactFlow>` component itself provides the context — no separate `<ReactFlowProvider>` wrapper needed in that case. Only add `<ReactFlowProvider>` if using RF hooks outside the `<ReactFlow>` render tree.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hierarchical graph layout | Custom node positioning algorithm | `@dagrejs/dagre` | Handles rank assignment, crossing minimization, edge routing — extremely complex to do correctly |
| Zoom/pan canvas | Custom canvas with wheel/pointer events | `<ReactFlow>` with `fitView` | RF handles viewport math, touch events, browser quirks |
| Arrowhead SVG markers | Custom `<defs><marker>` SVG | `MarkerType.ArrowClosed` from @xyflow/react | RF renders arrowheads inline; custom markers have z-index and color-sync issues |
| Smooth step edge paths | Custom cubic bezier calculation | `edge.type: 'smoothstep'` on Edge data | RF's built-in smoothstep path handles source/target position automatically |
| Node dimension measurement | `ResizeObserver` per node | `useNodesInitialized()` | RF already tracks measurement state; re-implementing is redundant |
| Graph state management | `useState` with manual array mutations | `useNodesState` + `useEdgesState` | RF's built-in hooks handle React Flow's internal change events correctly |

**Key insight:** React Flow's built-in edge types (`smoothstep`, `bezier`, `step`) and marker types handle the vast majority of visual edge requirements. Custom edge components are only needed for label overlays or animated strokes — not required in Phase 1.

---

## Common Pitfalls

### Pitfall 1: React Compiler conflicts with useNodesState
**What goes wrong:** React Compiler (enabled via `reactCompiler: true`) may over-optimize `useNodesState` and cause stale graph state — nodes appear frozen or don't update after dagre positions are applied.
**Why it happens:** React Compiler's automatic memoization can incorrectly deduplicate state updates that React Flow relies on for position tracking.
**How to avoid:** Add `"use no memo"` directive at the top of `GraphCanvas.tsx` if stale state is observed.
**Warning signs:** Nodes render at initial positions (0,0) and never move to dagre positions; or node updates in later phases fail to reflect.
```typescript
// GraphCanvas.tsx
"use client";
"use no memo"; // add this if React Compiler causes stale state
```

### Pitfall 2: nodeTypes defined inside component body
**What goes wrong:** All 23 nodes remount on every parent render — visible as flickering and loss of node drag state.
**Why it happens:** A new object reference is created each render, making React think the node type registry changed entirely.
**How to avoid:** Define `const nodeTypes = { activity: ActivityNode, resource: ResourceNode }` at the top level of `GraphCanvas.tsx`, outside any function.
**Warning signs:** React DevTools shows all nodes unmounting/remounting on state changes unrelated to node content.

### Pitfall 3: act-6 missing target handle
**What goes wrong:** The edge `act-8 → act-6` fails to render or renders without a visible connection point.
**Why it happens:** If `ActivityNode` only has a `source` handle (Position.Bottom), the `act-8 → act-6` edge has no target anchor.
**How to avoid:** Activity nodes need BOTH `<Handle type="target" position={Position.Top} />` AND `<Handle type="source" position={Position.Bottom} />`. The UI-SPEC notes this explicitly.
**Warning signs:** Console warning about missing handle; edge appears to connect to node center instead of handle position.

### Pitfall 4: Canvas blank/invisible on first render
**What goes wrong:** The entire canvas appears blank even after nodes are positioned.
**Why it happens:** Missing `@xyflow/react/dist/style.css` import. The CSS file contains critical styles for node rendering, edge paths, and handle visibility.
**How to avoid:** Import `'@xyflow/react/dist/style.css'` in `GraphCanvas.tsx` (as the sole `"use client"` boundary).
**Warning signs:** Canvas container renders with correct dimensions but no nodes visible; no errors in console.

### Pitfall 5: dagre positions are center-origin, React Flow expects top-left
**What goes wrong:** All nodes are offset — they appear shifted by half their width/height.
**Why it happens:** Dagre returns the center (x, y) of each node. React Flow positions nodes by their top-left corner.
**How to avoid:** Subtract half the node dimensions when mapping dagre output:
```typescript
position: { x: dagreNode.x - NODE_WIDTH / 2, y: dagreNode.y - NODE_HEIGHT / 2 }
```
**Warning signs:** Nodes render but are all shifted in the same direction; edges connect to visually incorrect positions.

### Pitfall 6: @dagrejs/dagre import path
**What goes wrong:** TypeScript error `Module '@dagrejs/dagre' has no exported member 'graphlib'` or similar.
**Why it happens:** Package may need a default import rather than named imports in some bundler configurations.
**How to avoid:** Use default import: `import dagre from '@dagrejs/dagre'`. Access graphlib via `dagre.graphlib.Graph`. Verify `@types/dagrejs__dagre` is not needed — the package ships its own types as of v1.0+.
**Warning signs:** TypeScript errors on `dagre.graphlib` or `dagre.layout`.

### Pitfall 7: Turbopack + Node.js `fs` module in Server Component
**What goes wrong:** `Module not found: Can't resolve 'fs'` in Turbopack builds.
**Why it happens:** If `graph.ts` (the transform utility) somehow gets bundled into the client bundle, Turbopack will not polyfill Node.js builtins.
**How to avoid:** Ensure `transformGraphData` is only imported from Server Components (page.tsx). The `fs.readFileSync` call must remain in `page.tsx` or a server-only utility. Do NOT import `fs` inside `src/lib/graph.ts` if that file might be imported by client components. Split: page.tsx does `readFileSync`, passes raw JSON to `transformGraphData` which is pure (no `fs`).
**Warning signs:** Turbopack build error mentioning `fs` or `path` in a client-side module.

---

## Code Examples

### TypeScript types for graph.json schema
```typescript
// src/types/graph.types.ts
// Source: Verified against data/graph.json structure

export interface ActivityNodeData {
  name: string;
  rto_hours: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
}

export interface ResourceNodeData {
  name: string;
  resource_type: 'technology' | 'third_party' | 'people' | 'building' | 'equipment';
  contact: string;
  vendor?: string; // only present for third_party resources
}

export interface GraphJsonNode {
  id: string;
  type: 'activity' | 'resource';
  name: string;
  // activity fields
  rto_hours?: number;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  owner?: string;
  // resource fields
  resource_type?: 'technology' | 'third_party' | 'people' | 'building' | 'equipment';
  contact?: string;
  vendor?: string;
}

export interface GraphJsonEdge {
  from: string;
  to: string;
}

export interface GraphJson {
  nodes: GraphJsonNode[];
  dependencies: GraphJsonEdge[];
}
```

### Data transform utility (pure, no fs dependency)
```typescript
// src/lib/graph.ts
// Source: @xyflow/react skill SKILL.md TypeScript types section
import type { Node, Edge } from '@xyflow/react';
import type { GraphJson, ActivityNodeData, ResourceNodeData } from '@/types/graph.types';
import { MarkerType } from '@xyflow/react';

export function transformGraphData(raw: GraphJson): {
  nodes: Node<ActivityNodeData | ResourceNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<ActivityNodeData | ResourceNodeData>[] = raw.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: 0, y: 0 }, // dagre will overwrite these
    data: n.type === 'activity'
      ? { name: n.name, rto_hours: n.rto_hours!, priority: n.priority!, owner: n.owner! } as ActivityNodeData
      : { name: n.name, resource_type: n.resource_type!, contact: n.contact!, vendor: n.vendor } as ResourceNodeData,
  }));

  const edges: Edge[] = raw.dependencies.map((dep, i) => ({
    id: `e-${dep.from}-${dep.to}-${i}`,
    source: dep.from,
    target: dep.to,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
    style: { stroke: '#64748b', strokeWidth: 1.5 },
  }));

  return { nodes, edges };
}
```

### Edge count fact-check
```
Actual edges in graph.json: 30 (verified via Node.js script 2026-03-29)
Planning documents state 29 — this is a documentation discrepancy.
The 30th edge: act-8 → res-9 (HQ Office)
```

### @xyflow/react CSS import (required)
```typescript
// In GraphCanvas.tsx — "use client" boundary
import '@xyflow/react/dist/style.css';
```

### ReactFlowProvider usage note
```typescript
// useNodesInitialized() and useDagreLayout() must be called INSIDE the ReactFlow context.
// Option A (preferred): call hooks inside a child component rendered within <ReactFlow>
// Option B: wrap with <ReactFlowProvider> in page.tsx and use useReactFlow() externally
// For this phase: GraphCanvas renders <ReactFlow> + child component that calls useDagreLayout
// The <ReactFlow> component itself provides context — no separate <ReactFlowProvider> needed
// UNLESS hooks are called outside the <ReactFlow> render tree.
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `reactflow` package | `@xyflow/react` package | v11 → v12 (2024) | Import paths changed; old `reactflow` imports break |
| `dagre` (npm) | `@dagrejs/dagre` (npm) | 2022 | The original `dagre` package is unmaintained; `@dagrejs/dagre` is the maintained fork |
| `experimental.turbopack` in next.config | Top-level `turbopack` config | Next.js 15 → 16 | `experimental.turbopack` still works but is deprecated |
| `next lint` CLI command | `eslint` CLI directly | Next.js 16 | `pnpm lint` runs `eslint` (already configured in package.json) |

**Deprecated/outdated:**
- `reactflow` (non-scoped package): Replaced by `@xyflow/react`. Do NOT use `reactflow` imports.
- `dagre` (non-scoped package): Replaced by `@dagrejs/dagre`. Do NOT install the old `dagre`.
- `useHandleConnections` from @xyflow/react: Deprecated, use `useNodeConnections` instead (not relevant for Phase 1, noted for future phases).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | Yes | Darwin 25.4.0 host | — |
| pnpm | Package manager | Yes | present (pnpm-lock.yaml) | — |
| @xyflow/react | Graph canvas | Yes | 12.10.2 (installed) | — |
| @dagrejs/dagre | GRAPH-04 layout | No | Not installed | None — must install: `pnpm add @dagrejs/dagre` |
| Tailwind CSS v4 | Node styling | Yes | 4.2.2 (installed) | — |
| TypeScript | Type checking | Yes | 5.x (devDep) | — |

**Missing dependencies with no fallback:**
- `@dagrejs/dagre` — required by GRAPH-04; no viable fallback for auto-layout. Must be installed in Wave 0 before any layout code is written.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test runner configured in package.json |
| Config file | None — see Wave 0 |
| Quick run command | N/A until framework installed |
| Full suite command | N/A until framework installed |

**Note on nyquist_validation:** Config has `workflow.nyquist_validation: true`. However, no test framework is present in the project. Phase 1 is a frontend UI rendering phase — the meaningful validations are visual/behavioral (node count, edge direction, zoom/pan). Pure unit tests for `transformGraphData` and `applyDagreLayout` are feasible; visual tests require a browser environment.

Recommendation: Use `vitest` (compatible with Vite-based tooling, Turbopack-friendly, no Jest config overhead) for the two pure utility functions. Visual/browser validation gates are manual for Phase 1.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GRAPH-01 | `transformGraphData` returns 23 nodes and 30 edges | unit | `pnpm test src/lib/graph.test.ts` | No — Wave 0 |
| GRAPH-02 | Activity nodes have type `'activity'`, resource nodes have type `'resource'` | unit | `pnpm test src/lib/graph.test.ts` | No — Wave 0 |
| GRAPH-03 | All edges have `markerEnd.type === MarkerType.ArrowClosed` | unit | `pnpm test src/lib/graph.test.ts` | No — Wave 0 |
| GRAPH-04 | `applyDagreLayout` returns nodes with non-zero, non-uniform positions | unit | `pnpm test src/lib/graph.test.ts` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test src/lib/graph.test.ts` (once created)
- **Per wave merge:** Full test suite + manual browser check (node count, edges visible, zoom/pan working)
- **Phase gate:** All unit tests green + manual visual verification before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/graph.test.ts` — covers GRAPH-01, GRAPH-02, GRAPH-03, GRAPH-04 (pure utility unit tests)
- [ ] `vitest.config.ts` — or add vitest to package.json scripts
- [ ] Framework install: `pnpm add -D vitest` — if chosen

---

## Open Questions

1. **useGraphData hook vs. D-05 server-side loading**
   - What we know: UI-SPEC Component Inventory lists `useGraphData` hook; CONTEXT.md D-05/D-08 specify server-side loading in page.tsx
   - What's unclear: Whether the planner should create the hook as a thin adapter or skip it entirely
   - Recommendation: Follow D-05/D-08 (locked decisions take precedence). Skip `useGraphData` hook. page.tsx reads via `fs.readFileSync`, calls `transformGraphData`, passes as props.

2. **Actual edge count discrepancy**
   - What we know: graph.json has 30 dependencies, not 29 as stated in the phase goal description
   - What's unclear: Whether this matters for the plan
   - Recommendation: Use 30 as the authoritative count. Phase description "29 edges" was a documentation error. Plan tasks and tests should assert 30 edges.

3. **ReactFlowProvider placement**
   - What we know: `useNodesInitialized` and `useDagreLayout` need to be called inside the React Flow context; the `<ReactFlow>` component itself provides the context
   - What's unclear: Whether a layout hook called inside GraphCanvas (which renders `<ReactFlow>`) needs an inner wrapper component
   - Recommendation: Create an inner `GraphLayout` component rendered as a child of `<ReactFlow>` that calls `useDagreLayout` and the opacity reveal logic. This is a common @xyflow/react pattern for layout hooks.

---

## Sources

### Primary (HIGH confidence)
- Installed `node_modules/@xyflow/react/package.json` — version 12.10.2 confirmed
- Installed `node_modules/@xyflow/react/dist/esm/hooks/useNodesInitialized.d.ts` — TypeScript signature verified
- Installed `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` — Next.js 16 breaking changes
- Installed `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` — Server/Client Component patterns
- `data/graph.json` — Node.js script analysis: 23 nodes (8 activity, 15 resource), 30 edges, 1 activity-to-activity edge
- `.claude/skills/react-flow-implementation/SKILL.md` — nodeTypes module scope pattern, custom node pattern, Controls/Background usage
- `.claude/skills/react-flow-implementation/ADDITIONAL_COMPONENTS.md` — Controls, Background API confirmed
- `npm view @dagrejs/dagre` — v3.0.0 confirmed as latest, NOT installed

### Secondary (MEDIUM confidence)
- @xyflow/react dist/esm inline comments — `useNodesInitialized` usage pattern with `useEffect` + `dagre.layout` verified in source
- `next.config.ts` — `reactCompiler: true` confirmed; React Compiler conflict with useNodesState documented

### Tertiary (LOW confidence)
- Community pattern: inner component calling layout hooks inside `<ReactFlow>` — standard pattern but not in official docs; inferred from hook API contract

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via node_modules or npm registry
- Architecture: HIGH — locked by CONTEXT.md decisions; patterns verified via skill files and Next.js 16 docs
- Pitfalls: HIGH — nodeTypes/dagre origin/handle/CSS pitfalls verified in source; React Compiler conflict is documented in STATE.md
- Data schema: HIGH — directly inspected graph.json via Node.js script

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (30 days — stable libraries)
