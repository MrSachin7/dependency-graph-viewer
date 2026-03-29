# Phase 2: SPOF Detection - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Augment resource nodes to show (1) a SPOF ring + dependency count badge for any resource depended on by more than one activity, and (2) a resource type label badge on every resource node. SPOF computation is pure logic derived from the dependency graph. No new interaction behavior — clicking/selection is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### SPOF Computation
- **D-01:** A resource is a SPOF if it appears as the target of more than one dependency edge. Compute counts in `src/lib/graph.ts` (server-side, alongside existing `transformGraphData`). Pass `isSPOF: boolean` and `dependencyCount: number` as fields in `ResourceNodeData` so the node component can render without re-computing.
- **D-02:** SPOF computation happens at data transform time (server-side in page.tsx pipeline), not in the React component. The node component is purely presentational — it receives SPOF status as props.

### SPOF Visual Treatment
- **D-03:** SPOF ring: **amber/orange** (`ring-2 ring-amber-400` or equivalent Tailwind v4 class). Rings around the node border — not replacing the green border, layered on top.
- **D-04:** Dependency count badge: **top-right corner, overlapping the node edge**. Small circle (≈18×18px), amber background (`bg-amber-400`), white text, absolute-positioned outside the node's normal flow. Shows the integer count (e.g., "3" for 3 dependencies).
- **D-05:** Non-SPOF resource nodes: no ring, no badge — appearance identical to Phase 1 (green border only).

### Resource Type Indicator
- **D-06:** Small **text label badge** positioned bottom-left inside the node. Shortened labels:
  - `technology` → `TECH`
  - `third_party` → `3P`
  - `people` → `PEOPLE`
  - `building` → `BLDG`
  - `equipment` → `EQUIP`
- **D-07:** Badge style: small pill, light gray background (`bg-gray-100`), gray text (`text-gray-500`), `text-[10px]` font size. Visually secondary — doesn't compete with the node name.

### Node Layout
- **D-08:** ResourceNode grows taller — **two-row layout**:
  - Row 1 (top): resource name (same as Phase 1 — truncated, green text, medium weight)
  - Row 2 (bottom): resource type badge (left-aligned, small pill)
  - Approximate new height: **~64px** (was 44px)
- **D-09:** SPOF ring + count badge are absolutely positioned overlays — they do not affect the node's internal flex layout. The node container uses `relative` positioning; the badge uses `absolute top-0 right-0 translate-x-1/2 -translate-y-1/2`.

### Claude's Discretion
- Exact Tailwind class composition (within the constraints above)
- Whether to use `ring` utility or `outline` for the SPOF ring
- Type label abbreviation adjustments if any label looks awkward at small size
- Dagre layout re-run behavior after node height change (re-layout is automatic since `useNodesInitialized` gates the layout)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data Schema
- `data/graph.json` — Source data. Dependencies are in `dependencies[]` array as `{from, to}` pairs. Resource nodes have `resource_type` field. Read this to understand SPOF computation inputs.
- `src/types/graph.types.ts` — Current type definitions. `ResourceNodeData` must be extended to add `isSPOF: boolean` and `dependencyCount: number`.

### Existing Implementation
- `src/lib/graph.ts` — Current `transformGraphData` function. SPOF computation logic must be added here.
- `src/components/nodes/ResourceNode.tsx` — Current ResourceNode component (Phase 1). This is what gets modified for Phase 2.

### Requirements
- `.planning/REQUIREMENTS.md` §GRAPH-05, SPOF-01, SPOF-02, SPOF-03 — The 4 requirements this phase must satisfy.

### Project Constraints
- `CLAUDE.md` — Tech stack lock, TypeScript strict mode, no `any`, Tailwind v4

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/graph.types.ts` — `ResourceNodeData` already has `resource_type` typed as a union. Add `isSPOF` and `dependencyCount` fields here.
- `src/lib/graph.ts` — `transformGraphData` already loops over nodes and edges. SPOF count computation fits naturally here — one extra pass over `dependencies` to count per target.
- `src/components/nodes/ResourceNode.tsx` — Current component is the direct target for modification. Uses `memo`, Tailwind classes, `@xyflow/react` handles.

### Established Patterns
- **Absolute badge positioning** — Phase 1 handles are positioned via React Flow's built-in system. The SPOF count badge should use `absolute` CSS on a `relative`-positioned wrapper (standard React pattern, no new library needed).
- **Tailwind v4** — Use canonical classes (`w-40` not `w-[160px]`). Important modifier syntax: `bg-amber-400!` not `!bg-amber-400`.
- **TypeScript strict mode** — All new fields on `ResourceNodeData` must be non-optional or have explicit defaults.

### Integration Points
- `src/lib/graph.ts` → extend `transformGraphData` to return SPOF data alongside existing node/edge data
- `src/types/graph.types.ts` → extend `ResourceNodeData` with `isSPOF` and `dependencyCount`
- `src/components/nodes/ResourceNode.tsx` → render two-row layout with conditional SPOF overlay and type badge
- `src/app/page.tsx` → no changes needed (server component already passes transformed data through)

</code_context>

<specifics>
## Specific Ideas

- SPOF badge position: `absolute top-0 right-0 translate-x-1/2 -translate-y-1/2` on a `relative` container — standard notification badge pattern
- Node grows from 44px → ~64px; dagre layout re-runs automatically via `useNodesInitialized` gate from Phase 1
- Amber color choice rationale: 9–10 of 15 resources are SPOFs — using red would make the whole graph feel alarming; amber communicates "at risk" without "critical failure"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-spof-detection*
*Context gathered: 2026-03-29*
