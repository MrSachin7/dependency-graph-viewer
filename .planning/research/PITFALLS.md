# Pitfalls Research

**Project:** Dependency Graph Viewer
**Stack:** Next.js 16.2.1 + React 19.2.4 + @xyflow/react 12.10.2 + Tailwind CSS v4 + TypeScript strict
**Researched:** 2026-03-29
**Confidence:** HIGH — all findings grounded in installed package source and Next.js 16 docs

---

## Critical Pitfalls

Mistakes that will break the app or produce a blank canvas.

### Pitfall 1: Importing @xyflow/react in a Server Component

**What goes wrong:** The app throws a hard error during SSR or build. `@xyflow/react` begins its ESM bundle with `"use client"` — it uses `createContext`, `useEffect`, `useRef`, `useState`, and browser-only ResizeObserver. Importing it in any Server Component (a file without `"use client"` in App Router) causes a build-time error.

**Evidence:** Line 1 of `node_modules/@xyflow/react/dist/esm/index.js` is literally `"use client"`. The library is a pure client library.

**Consequences:** Next.js App Router crashes at build or at runtime with "You're importing a component that needs `createContext`" (or similar React Server Components error).

**Prevention:** Every file that imports from `@xyflow/react` must be a Client Component. Add `"use client"` as the first line. This includes the graph wrapper, custom node components, custom edge components, any hook that calls `useReactFlow`, `useNodesState`, etc.

**Scope:** The graph container component itself must be Client. The page (`app/page.tsx`) can remain a Server Component if it imports the graph container as a child — the client boundary is at the container, not the page.

---

### Pitfall 2: Missing `@xyflow/react` CSS import

**What goes wrong:** Nodes render as invisible or mispositioned. Edges are invisible. The canvas cannot be interacted with. Handles are invisible, nodes overlap, and the viewport behaves erratically.

**Evidence:** `node_modules/@xyflow/react/dist/style.css` contains all structural layout CSS — including `.react-flow`, node positioning, handle positioning, z-index layers, and all CSS custom properties (`--xy-*`) used for theming. Without it, the DOM is present but unstyled.

**Consequences:** Completely broken visual output. This is silent — no error is thrown.

**Prevention:** Import `@xyflow/react/dist/style.css` once, in the root layout or in the Client Component that contains `<ReactFlow />`:

```tsx
import '@xyflow/react/dist/style.css'
```

This import must be in a Client Component or the layout file. The Next.js 16 docs confirm that external package CSS can be imported anywhere in the `app/` directory.

---

### Pitfall 3: Defining `nodeTypes` or `edgeTypes` inline (not as a stable reference)

**What goes wrong:** React Flow warns in development: "It looks like you created a new nodeTypes or edgeTypes object." The graph re-renders all nodes on every render, causing extreme performance degradation and flickering.

**Evidence:** `useNodeOrEdgeTypesWarning` (line 3088–3102 in the ESM bundle) checks reference equality of the `nodeTypes` object on every render. When it detects a new object reference, it fires `error002`. This is a reference-equality check, so `{ custom: CustomNode }` defined inline triggers it on every render.

**Consequences:** Every parent render causes all nodes to remount completely. With 23 nodes and 29 edges, this is visually noticeable as flicker. In the worst case it causes infinite render loops if node state updates trigger parent renders.

**Prevention:** Define `nodeTypes` and `edgeTypes` outside the component body, or at module level:

```tsx
// CORRECT: defined outside the component
const nodeTypes = {
  activity: ActivityNode,
  resource: ResourceNode,
} satisfies NodeTypes

export default function GraphView() {
  return <ReactFlow nodeTypes={nodeTypes} ... />
}
```

```tsx
// WRONG: defined inside the component body
export default function GraphView() {
  const nodeTypes = { activity: ActivityNode, resource: ResourceNode } // new object each render
  return <ReactFlow nodeTypes={nodeTypes} ... />
}
```

If the map must be constructed dynamically (unlikely here), wrap it in `useMemo` with a stable dependency array.

---

### Pitfall 4: Calling `useReactFlow` or other flow hooks outside the ReactFlow context

**What goes wrong:** Runtime error: `"Seems like you have not used zustand provider as an ancestor"`. The React Flow hooks depend on a Zustand store provided by `<ReactFlow>` (or `<ReactFlowProvider>`).

**Evidence:** `useStore` in the ESM bundle (lines 38–44) checks `useContext(StoreContext)` and throws `zustandErrorMessage` (error001) if the context value is null.

**Consequences:** Hard runtime crash. Common when trying to call `useReactFlow()` from a sidebar component or a parent that is not wrapped by `<ReactFlow>`.

**Prevention:** Keep all `useReactFlow`, `useNodes`, `useEdges`, `useViewport`, `useNodeConnections`, etc. calls inside components that are children of `<ReactFlow>`. If a sibling or parent component needs to interact with the flow state (e.g., the sidebar), either:
1. Lift state out of React Flow entirely (keep selected node in a `useState` in the parent, pass down).
2. Wrap the entire layout in `<ReactFlowProvider>` and then both the graph and sidebar share the same store context.

For this project (sidebar + graph at the same level), option 1 is simpler: manage `selectedNodeId` in the page/layout component and pass it as a prop to both the graph and the sidebar.

---

### Pitfall 5: The ReactFlow container must have explicit dimensions

**What goes wrong:** The canvas renders with zero height. All nodes are invisible. The graph appears blank.

**Evidence:** `<ReactFlow>` renders as a `position: absolute; width: 100%; height: 100%` div. If the parent has no height, the canvas collapses to 0px.

**Consequences:** Empty white box. Silent failure.

**Prevention:** The parent container must have an explicit height. Use Tailwind `h-screen` or `h-full` with the chain of parents also having defined heights:

```tsx
// The parent of <ReactFlow> needs a height
<div className="h-screen w-full">
  <ReactFlow ... />
</div>
```

Alternatively, use the `width` and `height` props on `<ReactFlow>` directly for fixed pixel dimensions.

---

## Common Mistakes

### Mistake 1: Applying layout before nodes are measured (the dagre/layout timing problem)

**What goes wrong:** Dagre layout runs before React Flow has measured the nodes. Since `node.width` and `node.height` are undefined at this point, dagre assigns `NaN` positions. Nodes stack at `(0, 0)`.

**Why it happens:** `@xyflow/react` measures node dimensions asynchronously via ResizeObserver after the first render. Dagre needs the node dimensions to calculate edge routing correctly.

**Prevention:** Use `useNodesInitialized()` to gate layout calculation:

```tsx
const nodesInitialized = useNodesInitialized()

useEffect(() => {
  if (!nodesInitialized) return
  // NOW it's safe to call dagre with actual node dimensions
  const layouted = runDagreLayout(nodes, edges)
  setNodes(layouted)
}, [nodesInitialized])
```

The `useNodesInitialized` hook (confirmed in the installed source) returns `true` only after all nodes have been measured and given dimensions. On the initial render pass, pass nodes with `position: { x: 0, y: 0 }` as placeholder positions — they will be replaced after layout runs.

---

### Mistake 2: Calling `fitView` before layout is complete

**What goes wrong:** `fitView` is called (or `fitView` prop is set to `true`) while nodes are still at `(0, 0)` before dagre has run. The viewport fits to the wrong bounds and then snaps incorrectly when layout completes.

**Prevention:** Use `fitView` via `useReactFlow().fitView()` in the same `useEffect` as layout, called after `setNodes`:

```tsx
useEffect(() => {
  if (!nodesInitialized) return
  const layouted = runDagreLayout(nodes, edges)
  setNodes(layouted)
  // fitView runs on the NEXT frame after setNodes propagates
  window.requestAnimationFrame(() => {
    reactFlowInstance.fitView({ padding: 0.1 })
  })
}, [nodesInitialized])
```

Do NOT pass `fitView` as a prop on `<ReactFlow>` when using a layout algorithm — the prop runs during initial mount, before layout.

---

### Mistake 3: dagre is the legacy package; use `@dagrejs/dagre`

**What goes wrong:** The original `dagre` npm package is unmaintained and has open bugs in TypeScript types. The maintained fork is `@dagrejs/dagre`.

**Evidence:** `dagre` is not in `pnpm-lock.yaml` (not installed). The project decision recorded in PROJECT.md is to use dagre, so it needs to be installed.

**Prevention:** Install `@dagrejs/dagre` and its types:

```bash
pnpm add @dagrejs/dagre
pnpm add -D @dagrejs/types
```

The API is identical to `dagre` — the import path is the only change: `import Dagre from '@dagrejs/dagre'`.

---

### Mistake 4: Mutating node/edge objects instead of creating new ones

**What goes wrong:** React Flow uses reference equality for change detection. Mutating an existing node object (e.g., `node.selected = true`) does not trigger a re-render. The UI stays stale.

**Prevention:** Always create new node/edge objects when applying changes. Use `applyNodeChanges` and `applyEdgeChanges` from `@xyflow/react`, which return new arrays. When doing custom state updates (e.g., toggling a node's `data.highlighted` flag), use the functional form of `setNodes`:

```tsx
setNodes((nds) =>
  nds.map((n) =>
    n.id === clickedId ? { ...n, data: { ...n.data, highlighted: true } } : n
  )
)
```

---

### Mistake 5: Forgetting `nodrag` class on interactive elements inside custom nodes

**What goes wrong:** Clicking a button or input inside a custom node causes the node to start dragging instead of registering the click.

**Evidence:** The `<ReactFlow>` component intercepts pointer events on all node children for drag handling. The string `"nodrag"` (configurable via `noDragClassName` prop) marks elements where drag should not be initiated.

**Prevention:** Add `className="nodrag"` to all interactive elements (buttons, inputs, selects) inside custom node components:

```tsx
<button className="nodrag" onClick={handleClick}>Details</button>
```

Similarly, use `className="nowheel"` on any scrollable element inside a node to prevent the canvas from zooming when the user scrolls inside the node.

---

### Mistake 6: Not handling the `selected` prop in custom nodes

**What goes wrong:** React Flow passes a `selected: boolean` prop to every custom node via `NodeProps`. Ignoring it means the node has no visual feedback when selected. Combined with this project's "highlight immediate connections" requirement, selection state must be explicitly reflected in the node's visual output.

**Prevention:** Destructure and use the `selected` prop from `NodeProps<T>` in every custom node component:

```tsx
export function ActivityNode({ data, selected }: NodeProps<ActivityNodeType>) {
  return (
    <div className={selected ? 'ring-2 ring-blue-500' : ''}>
      {data.label}
    </div>
  )
}
```

---

## Next.js + React Flow Specific

### SSR / App Router Issues

**Issue 1: `window` / `document` access during SSR**

React Flow internally guards against SSR with `useIsomorphicLayoutEffect` (confirmed in installed hooks). However, any custom code that accesses `window`, `document`, or browser-specific APIs in a custom node or hook will crash during SSR if the component is not behind `"use client"`.

**Prevention:** Any file in `app/` that uses `useEffect`, `useState`, `useRef`, or imports from `@xyflow/react` must start with `"use client"`. The Server Component boundary should be at the page level, with the entire graph subtree as a client boundary.

**Issue 2: React Compiler (`reactCompiler: true` in next.config.ts) interaction with useNodesState/useEdgesState**

The React Compiler is enabled in this project's `next.config.ts`. The React Compiler automatically inserts memoization. `useNodesState` and `useEdgesState` from `@xyflow/react` are custom hooks that internally use Zustand store subscriptions. The React Compiler may optimize away what it perceives as redundant re-renders, potentially causing stale state in the flow.

**Confidence:** MEDIUM — this is a known category of issue with the React Compiler and external state libraries (Zustand in particular) as of early 2026. The React Compiler's compatibility with Zustand-based hooks is an active area.

**Prevention:** If the graph appears to not update correctly, add `"use no memo"` to the Client Component file that manages graph state, or configure the compiler in `annotation` mode and only opt-in specific components. Monitor for stale node/edge state.

**Issue 3: CSS import ordering with Tailwind v4 and React Flow styles**

Tailwind v4 uses a single `@import 'tailwindcss'` directive. If the React Flow CSS (`@xyflow/react/dist/style.css`) is imported after Tailwind in the CSS cascade, Tailwind resets may override React Flow's structural styles (particularly `position`, `display`, `width`, `height` rules on `.react-flow`).

**Prevention:** Import React Flow CSS in a Client Component file (not in `globals.css`), so Next.js's CSS chunking keeps it separate from the Tailwind bundle. The Next.js 16 docs confirm external package CSS can be imported in component files within the `app/` directory.

```tsx
// In your graph Client Component:
'use client'
import '@xyflow/react/dist/style.css'
import { ReactFlow } from '@xyflow/react'
```

This places the React Flow CSS in a separate chunk from `globals.css`, avoiding ordering conflicts.

---

## Performance Pitfalls

### Perf Pitfall 1: Triggering re-renders of all nodes when selection changes

**What goes wrong:** Storing selected node ID in a state variable held in the same component as `nodes` and `edges` causes all nodes to re-render on every selection change, because the `nodes` array reference changes (since each node's `selected` property changes).

**Why it happens:** React Flow's `applyNodeChanges` correctly returns a new array when selection changes, but if your `onNodeClick` handler also derives "highlighted" state for all nodes in the same `setNodes` call, you're recomputing and re-rendering all 23 nodes on every click.

**Prevention for this project:** Separate concerns:
- Let React Flow own `selected` state via its internal selection machinery.
- Keep `highlightedNodeId` in a separate `useState` that only affects visual styling.
- In custom node components, use the `selected` prop (passed by React Flow) for selection ring, and a separate prop from context or node `data` for highlight dimming.

Alternatively, use `useNodesData(nodeId)` to subscribe to a specific node's data without subscribing to all nodes.

### Perf Pitfall 2: Recreating callback functions on every render

**What goes wrong:** Passing `onNodeClick`, `onPaneClick`, `onNodesChange`, `onEdgesChange` as inline arrow functions creates new function references on every render. Each new reference triggers React Flow's internal effect comparisons and can cascade unnecessary re-renders.

**Prevention:** Wrap all event callbacks passed to `<ReactFlow>` in `useCallback`. This is especially important given the React Compiler is enabled — the Compiler's own memoization may not cover callbacks that close over external state correctly.

```tsx
const onNodeClick = useCallback(
  (_event: React.MouseEvent, node: AppNode) => {
    setSelectedId((prev) => (prev === node.id ? null : node.id))
  },
  [] // no external dependencies needed if using functional setState
)
```

### Perf Pitfall 3: Large data payloads in node `data` prop

**What goes wrong:** React Flow subscribes each node component to its `data` object via shallow equality. If `data` contains deeply nested objects or arrays that are recreated on each render, nodes re-render unnecessarily.

**Prevention:** Keep `data` flat and minimal. For this project (23 nodes, 15 resources, 8 activities), this is not a performance concern at scale, but is good practice:

```tsx
// Lean data shape
type ActivityData = {
  label: string
  criticality: 'critical' | 'high' | 'medium' | 'low'
  isSPOF: false
}

type ResourceData = {
  label: string
  isSPOF: boolean
  dependencyCount: number
}
```

### Perf Pitfall 4: `onlyRenderVisibleElements` is off by default

**What goes wrong:** With the default setting, all nodes and edges are always rendered in the DOM, even those outside the viewport. For this project's 23 nodes and 29 edges this is fine, but worth knowing.

**Prevention:** For this project size, leave `onlyRenderVisibleElements` at its default (`false`). The overhead of virtualization outweighs the savings for small graphs.

---

## Prevention Strategies

| Pitfall | Where It Manifests | Prevention |
|---------|-------------------|------------|
| Missing `"use client"` | Build error, SSR crash | Add directive to every file importing from `@xyflow/react` |
| Missing CSS import | Blank/broken canvas | `import '@xyflow/react/dist/style.css'` in the graph Client Component |
| Inline `nodeTypes` definition | All nodes remount on every render | Define `nodeTypes` at module scope or with `useMemo` |
| Flow hooks outside context | Runtime crash | Keep hooks inside `<ReactFlow>` children; lift selection state to parent |
| No explicit container height | Zero-height canvas | Wrap `<ReactFlow>` in a `h-screen` or `h-full` div with a proper height chain |
| Layout before `nodesInitialized` | All nodes at `(0, 0)` | Gate layout effect on `useNodesInitialized()` returning `true` |
| `fitView` before layout | Wrong viewport bounds | Call `fitView()` programmatically after `setNodes(layoutedNodes)` |
| Using `dagre` instead of `@dagrejs/dagre` | Type errors, stale bugs | Install `@dagrejs/dagre` |
| Mutating node objects | Stale UI | Use `applyNodeChanges` or spread-create new node objects |
| No `nodrag` on buttons in custom nodes | Dragging instead of clicking | Add `className="nodrag"` to all interactive elements |
| Ignoring `selected` prop in custom nodes | No selection visual feedback | Destructure and use `selected` in every custom node |
| React Compiler + Zustand stale state | Graph not updating | Add `"use no memo"` if stale state observed in graph component |
| CSS ordering: Tailwind resets RF styles | Invisible or mispositioned nodes | Import RF CSS in Client Component, not in `globals.css` |

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Scaffolding graph component | Blank canvas from SSR or missing CSS | First: `"use client"` + CSS import + container height |
| Custom activity/resource nodes | Inline `nodeTypes`, no `nodrag` on controls | Module-level `nodeTypes`, `nodrag` on any click targets |
| SPOF detection + click-to-highlight | Re-rendering all nodes on click | Separate `selectedId` state from `nodes` array; use `data` flags only for persistent state |
| Dagre layout | Nodes at `(0,0)`, `fitView` fires before layout | `useNodesInitialized` gate; programmatic `fitView` after layout |
| Reload button | Resetting flow state — causes nodeTypes warning if component re-mounts | Keep `nodeTypes` at module scope so it survives remounts |
| Criticality sort toggle | Recomputing all node positions triggers full re-render | Only update `position` or `data.order`, not the entire node object structure |

## Sources

- `node_modules/@xyflow/react/dist/esm/index.js` — source of truth for: `"use client"` directive (line 1), `useNodeOrEdgeTypesWarning` (line 3088–3102), `zustandErrorMessage` / error001 (line 14), `useNodesInitialized` (line 4096)
- `node_modules/@xyflow/react/dist/esm/types/component-props.d.ts` — `ReactFlowProps` interface: `nodesDraggable`, `noDragClassName`, `onlyRenderVisibleElements`, `fitView`
- `node_modules/@xyflow/react/dist/esm/types/nodes.d.ts` — `NodeProps<T>`, `BuiltInNode` — confirms `selected` is part of props via `NodePropsBase`
- `node_modules/@xyflow/react/dist/style.css` — confirms CSS must be explicitly imported
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` — App Router `"use client"` boundary rules
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — CSS import rules in App Router (external packages can import anywhere in `app/`)
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/reactCompiler.md` — React Compiler integration with Next.js 16, `"use no memo"` opt-out
- `next.config.ts` — `reactCompiler: true` is active in this project
- `pnpm-lock.yaml` — confirms `dagre` / `@dagrejs/dagre` are NOT currently installed
