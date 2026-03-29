# Architecture Research

**Project:** Dependency Graph Viewer
**Stack:** Next.js 16.2.1, React 19, @xyflow/react 12.10.2, Tailwind CSS v4
**Researched:** 2026-03-29
**Confidence:** HIGH — all claims verified from installed package type definitions and Next.js bundled docs

---

## Component Structure

### Top-Level Layout

`src/app/page.tsx` is a Next.js App Router Server Component. It cannot hold React state or use browser APIs directly. The entire React Flow canvas must be a Client Component subtree. The recommended pattern (confirmed in Next.js 16 docs) is to keep `page.tsx` as a server component that renders a single `'use client'` entry boundary.

```
src/
  app/
    page.tsx              — Server Component, renders <GraphPage />
    layout.tsx            — existing, no changes needed
    globals.css           — existing
  components/
    GraphPage.tsx         — 'use client' root; owns all state
    GraphCanvas.tsx       — ReactFlow wrapper; pure display + event delegation
    nodes/
      ActivityNode.tsx    — custom node for activity type
      ResourceNode.tsx    — custom node for resource type
    InfoSidebar.tsx       — selection detail panel
    Toolbar.tsx           — reload button + sort toggles
  lib/
    transform.ts          — raw JSON → ReactFlow nodes/edges
    spof.ts               — SPOF detection logic
    layout.ts             — dagre layout computation
  types/
    graph.ts              — domain types (GraphJson, ActivityNode, ResourceNode, etc.)
```

### Component Responsibilities

| Component | Responsibility | Client/Server |
|-----------|---------------|---------------|
| `page.tsx` | Route entry point; renders `<GraphPage />` | Server |
| `GraphPage.tsx` | Owns all state: nodes, edges, selectedId, sort orders. Passes derived props down | Client |
| `GraphCanvas.tsx` | Renders `<ReactFlow>` with nodeTypes, handlers for onNodeClick, onPaneClick. No internal state | Client |
| `ActivityNode.tsx` | Renders a single activity node; receives `NodeProps<ActivityNodeType>` | Client |
| `ResourceNode.tsx` | Renders a single resource node; shows SPOF badge when `data.isSpof === true` | Client |
| `InfoSidebar.tsx` | Shows selected node details; driven entirely by props, no internal state | Client |
| `Toolbar.tsx` | Reload button + two sort-order toggles; calls callbacks from `GraphPage` | Client |

---

## State Management

### Recommendation: React `useState` in `GraphPage.tsx` — no Zustand needed

The graph in this project is small (23 nodes, 29 edges) and has a clear owner: `GraphPage`. The `useNodesState` / `useEdgesState` hooks from `@xyflow/react` (verified in `useNodesEdgesState.d.ts`) return `[nodes, setNodes, onNodesChange]` tuples that plug directly into `<ReactFlow nodes={nodes} onNodesChange={onNodesChange} />`. This is the intended controlled-flow pattern and is sufficient for this project.

**Do not use React Flow's internal store for app-level state.** `useStore` and `useStoreApi` exist (confirmed in the index.d.ts exports) but are for low-level internals. Reading `selected` state from those hooks instead of `onNodeClick` props leaks internal concerns into app code.

**Do not add Zustand.** The `useNodesEdgesState` docs explicitly note Zustand as an alternative for production apps with complex shared state. This project has one owner component; the overhead is not justified.

### State shape in `GraphPage.tsx`

```typescript
// React Flow controlled state
const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

// App-level selection (one node at a time, or null)
const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

// Sort preferences
const [activitySort, setActivitySort] = useState<'criticality' | 'default'>('default');
const [resourceSort, setResourceSort] = useState<'criticality' | 'default'>('default');
```

Selection drives two things: sidebar content (which node to show) and visual dimming of unrelated nodes/edges. Both are derived: the sidebar reads `nodes.find(n => n.id === selectedNodeId)` and the dimming logic is applied by modifying `className` on nodes and `style` on edges before passing them to `<ReactFlow>`.

**Edge highlight approach:** React Flow edges accept a `style` prop and a `className` prop (confirmed in `Edge` type from `edges.d.ts`). On selection, compute the set of directly connected edge IDs from the edges array, then pass all edges through a map that sets `style={{ opacity: isConnected ? 1 : 0.15 }}`. This is pure derivation — no separate edge-state mutation.

---

## Data Flow

### Step 1: Load raw JSON

`page.tsx` is a Server Component. It can `import graphData from '@/data/graph.json'` (static import) and pass it as a prop to `<GraphPage graphData={graphData} />`. This keeps data fetching in the server tier and avoids a client-side `fetch`. The "Reload" button is the one exception: it triggers a client-side re-fetch, which can use `fetch('/graph.json')` (or a dynamic import) inside `GraphPage`.

### Step 2: Transform to React Flow format (`src/lib/transform.ts`)

```
GraphJson → { nodes: AppNode[], edges: AppEdge[] }
```

This transform runs once on load and on every reload. It:
1. Computes SPOF set: `Map<nodeId, inDegree>` from `dependencies`. Any resource node with `inDegree > 1` is a SPOF.
2. Builds `AppNode[]`: one per `GraphJson.nodes` entry. Each node carries its full domain data in `node.data` plus computed fields (`isSpof`, `dependencyCount`).
3. Builds `AppEdge[]`: one per `GraphJson.dependencies` entry with `id = \`\${from}-\${to}\``, `source = from`, `target = to`.
4. Feeds through dagre layout (`src/lib/layout.ts`) to assign `node.position`.

The transform is a pure function — takes `GraphJson` in, returns `{ nodes, edges }` out. Nothing stateful.

### Step 3: Apply sort orders

When `activitySort` or `resourceSort` changes, re-run layout on the current node set with updated grouping. Sort is applied inside layout before dagre assigns positions, so only positions change — `data` is untouched.

### Step 4: Apply selection-derived visual state

Before passing to `<ReactFlow>`, derive display-time decorations:

```typescript
const connectedIds = useMemo(() => {
  if (!selectedNodeId) return null;
  const connected = new Set<string>();
  edges.forEach(e => {
    if (e.source === selectedNodeId || e.target === selectedNodeId) {
      connected.add(e.source);
      connected.add(e.target);
    }
  });
  return connected;
}, [selectedNodeId, edges]);

const displayNodes = useMemo(() =>
  nodes.map(n => ({
    ...n,
    className: selectedNodeId && !connectedIds?.has(n.id) && n.id !== selectedNodeId
      ? 'opacity-20'
      : '',
  })),
  [nodes, selectedNodeId, connectedIds]
);

const displayEdges = useMemo(() =>
  edges.map(e => ({
    ...e,
    style: {
      opacity: selectedNodeId &&
        e.source !== selectedNodeId && e.target !== selectedNodeId
          ? 0.1 : 1,
    },
  })),
  [edges, selectedNodeId]
);
```

### Step 5: React Flow renders

`<ReactFlow nodes={displayNodes} edges={displayEdges} nodeTypes={nodeTypes} />`. React Flow owns all viewport state internally.

---

## Build Order

Build in this sequence to maintain a working state at every step:

1. **Types** (`src/types/graph.ts`) — define `GraphJson`, `ActivityData`, `ResourceData`, `AppNode`, `AppEdge`. Everything downstream depends on these being correct.

2. **Transform + SPOF logic** (`src/lib/transform.ts`, `src/lib/spof.ts`) — pure functions, unit-testable in isolation. SPOF detection must be correct before nodes are rendered.

3. **Layout** (`src/lib/layout.ts`) — dagre layout function. Depends on `AppNode` and `AppEdge` types. Returns positioned nodes.

4. **Custom node components** (`ActivityNode.tsx`, `ResourceNode.tsx`) — receive `NodeProps<T>` and render domain content. Both need `Handle` components from `@xyflow/react` for edges to connect. No hooks needed in these components.

5. **`GraphCanvas.tsx`** — wrap `<ReactFlow>` with `nodeTypes`, `fitView`, `onNodeClick`, `onPaneClick`. Accept `nodes`, `edges`, `onNodeClick`, `onPaneClick` as props. Start with no selection state wired — just verify the graph renders.

6. **`GraphPage.tsx`** — add `useNodesState` / `useEdgesState`, wire selection, derive `displayNodes` / `displayEdges`. This is where dimming behaviour appears.

7. **`InfoSidebar.tsx`** — purely presentational; receives `selectedNode: AppNode | null`.

8. **`Toolbar.tsx`** — reload button + sort toggles.

9. **`page.tsx`** — connect everything: static import of `graph.json`, pass to `<GraphPage>`.

---

## Key Abstractions

### Domain Types (`src/types/graph.ts`)

```typescript
// Raw JSON shape
export type GraphJson = {
  nodes: GraphJsonNode[];
  dependencies: { from: string; to: string }[];
};

type GraphJsonNodeBase = { id: string; type: 'activity' | 'resource' };

export type GraphJsonActivity = GraphJsonNodeBase & {
  type: 'activity';
  name: string;
  rto_hours: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
};

export type GraphJsonResource = GraphJsonNodeBase & {
  type: 'resource';
  resource_type: 'technology' | 'third_party' | 'people' | 'building' | 'equipment';
  name: string;
  contact: string;
  vendor?: string;
};

export type GraphJsonNode = GraphJsonActivity | GraphJsonResource;

// React Flow node data payloads
export type ActivityData = {
  kind: 'activity';
  name: string;
  rto_hours: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
};

export type ResourceData = {
  kind: 'resource';
  resource_type: 'technology' | 'third_party' | 'people' | 'building' | 'equipment';
  name: string;
  contact: string;
  vendor?: string;
  isSpof: boolean;
  dependencyCount: number;
};

// Typed React Flow nodes (v12 pattern: Node<Data, TypeString>)
import { type Node, type Edge } from '@xyflow/react';

export type ActivityNode = Node<ActivityData, 'activity'>;
export type ResourceNode = Node<ResourceData, 'resource'>;
export type AppNode = ActivityNode | ResourceNode;
export type AppEdge = Edge<Record<string, never>>;
```

### Custom Node Pattern (v12, verified from `nodes.d.ts`)

```typescript
// ActivityNode.tsx
'use client';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ActivityNode } from '@/types/graph';

export default function ActivityNodeComponent({ data, selected }: NodeProps<ActivityNode>) {
  return (
    <div className={/* tailwind classes based on data.priority and selected */}>
      <Handle type="source" position={Position.Bottom} />
      <div>{data.name}</div>
      <Handle type="target" position={Position.Top} />
    </div>
  );
}
```

The `NodeProps<T>` generic is `NodePropsBase<T>` (from `@xyflow/system`). It provides `id`, `data`, `selected`, `dragging`, `positionAbsoluteX`, `positionAbsoluteY` among others. The `selected` boolean is provided by React Flow and does not need app-level state.

### SPOF Detection (`src/lib/spof.ts`)

```typescript
export function computeSpofSet(dependencies: { from: string; to: string }[]): Set<string> {
  const inDegree = new Map<string, number>();
  for (const dep of dependencies) {
    inDegree.set(dep.to, (inDegree.get(dep.to) ?? 0) + 1);
  }
  const spofs = new Set<string>();
  for (const [id, count] of inDegree) {
    if (count > 1) spofs.add(id);
  }
  return spofs;
}
```

SPOF detection lives in a pure utility — no React, no React Flow. This makes it trivially testable and reusable.

### nodeTypes Registration

Node types must be defined **outside the render function** (stable reference required by React Flow — recreating on every render causes remounting):

```typescript
// At module scope in GraphCanvas.tsx or a dedicated nodeTypes.ts file
import ActivityNodeComponent from './nodes/ActivityNode';
import ResourceNodeComponent from './nodes/ResourceNode';

export const nodeTypes = {
  activity: ActivityNodeComponent,
  resource: ResourceNodeComponent,
} as const;
```

### Selection and "Clear Selection" Behaviour

React Flow provides `onNodeClick` and `onPaneClick` on the `<ReactFlow>` component (confirmed in `component-props.d.ts`). The pattern:

```typescript
// In GraphPage.tsx
const handleNodeClick = useCallback((_event: React.MouseEvent, node: AppNode) => {
  setSelectedNodeId(prev => prev === node.id ? null : node.id);
}, []);

const handlePaneClick = useCallback(() => {
  setSelectedNodeId(null);
}, []);
```

Clicking an already-selected node sets `selectedNodeId` to `null` (toggle). Clicking the background also clears. Both requirements from the spec are handled with these two handlers.

---

## Critical Constraints from Verified Sources

**React Flow must be in a Client Component.** It uses `useState`, `useEffect`, and DOM APIs internally. Wrapping in a `'use client'` component is mandatory (Next.js 16 docs confirm this pattern for third-party libraries using client-only features).

**`nodeTypes` must be stable across renders.** Define at module scope, not inside the component body. React Flow internally uses object identity to decide whether to remount node renderers. Defining inside render recreates the object every render, causing all nodes to unmount and remount.

**`ReactFlowProvider` is required when calling hooks outside of `<ReactFlow>`.** `useReactFlow()`, `useOnSelectionChange()`, etc. can only be called inside a component that is a descendant of `<ReactFlow>` or `<ReactFlowProvider>`. `InfoSidebar` does not need React Flow state directly (it receives a prop), so no provider wrapping is needed. Only if a component outside `GraphCanvas` needs to call `useReactFlow()` would a `<ReactFlowProvider>` be necessary at the `GraphPage` level.

**Edge `style` and `className` are supported.** Confirmed in `Edge` type definition in `edges.d.ts` — `style?: CSSProperties` and `className?: string` are first-class properties. This is the correct way to dim edges on selection; no custom edge renderer is needed.

**`data/graph.json` — confirmed edge note.** The JSON includes `act-8 → act-6` as an activity-to-activity edge. The transform must not assume all edges go from activity to resource. Handles must be present on both source and target positions of every node type.
