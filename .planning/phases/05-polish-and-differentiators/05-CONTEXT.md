# Phase 5: Polish and Differentiators - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Four targeted enhancements that signal senior-level attention to detail:
1. Resource type icons on node badges (emoji + text, no new dependencies)
2. RTO value displayed on activity nodes (second row, "4h RTO" format)
3. Smooth ~150ms opacity transition on selection dim/undim (CSS transition)
4. SPOF sidebar lists the activity names that depend on the resource

Does NOT include: new interactions, new node types, new controls, layout changes beyond node height adjustment.

</domain>

<decisions>
## Implementation Decisions

### Resource Type Icons
- **D-01:** Add emoji prefix to the existing text badge in `ResourceNode.tsx`. Keep the abbreviated text — show both emoji and label (e.g., 💻 TECH, 🔗 3P, 👥 PEOPLE, 🏢 BLDG, ⚙️ EQUIP).
- **D-02:** No icon library to install — emoji only. Badge format becomes `{emoji} {LABEL}` within the existing gray pill.

### RTO on Activity Node
- **D-03:** Add a second row to `ActivityNode.tsx` below the name. Node grows from `h-12` (48px) to approximately `h-16` (64px), matching resource node height.
- **D-04:** Format: compact `"4h RTO"` — e.g., `1h RTO`, `48h RTO`. Muted smaller text, visually secondary to the name.
- **D-05:** `NODE_HEIGHT` constant in `src/hooks/useDagreLayout.ts` must be updated from `48` to `64` so dagre computes correct rank spacing for the taller nodes.

### Opacity Transition
- **D-06:** Add `transition-opacity duration-150` Tailwind classes to the root `div` of both `ActivityNode.tsx` and `ResourceNode.tsx`. React Flow sets `style.opacity` on the node wrapper; the CSS transition animates the change to ~150ms.

### SPOF Activity List in Sidebar
- **D-07:** The amber warning box in `InfoPanel.tsx` stays as-is. Below it, add a bulleted list of activity names that depend on this resource.
- **D-08:** Display format: "Depended on by:" label, then a list of activity names (bullet/dot separated). Each name is plain text — no priority badges needed.
- **D-09:** Data flow: `graph.ts` `transformGraphData` must compute `dependingActivityNames: string[]` per resource node — the names (not IDs) of activities whose dependency edges point to this resource. Add this field to `ResourceNodeData` in `graph.types.ts`.

### Claude's Discretion
- Exact emoji choices per resource type (within the five types: technology, third_party, people, building, equipment)
- Exact Tailwind classes for the RTO second row (size, color — should be muted, smaller than the name)
- Whether the activity list in sidebar uses `<ul>` or inline dots

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in codebase files below.

### Key files to read before implementing
- `src/components/nodes/ActivityNode.tsx` — current single-row node; adding second row here
- `src/components/nodes/ResourceNode.tsx` — current text badge; adding emoji prefix here
- `src/components/InfoPanel.tsx` — ResourceDetail function; adding activity list below SPOF warning
- `src/hooks/useDagreLayout.ts` — NODE_HEIGHT constant at line 6; must update from 48 → 64
- `src/types/graph.types.ts` — ResourceNodeData interface; add dependingActivityNames field
- `src/lib/graph.ts` — transformGraphData; add dependingActivityNames computation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TYPE_LABELS` map in `ResourceNode.tsx` — maps resource_type to text abbreviation; extend with emoji prefix in same map or a parallel `TYPE_ICONS` map
- `PRIORITY_STYLES` in `InfoPanel.tsx` — badge styling pattern available if needed for activity list items
- `Field` component in `InfoPanel.tsx` — label+value pattern for sidebar fields; activity list is a different pattern (list not field)

### Established Patterns
- Node styling via Tailwind classes on `div` wrapper — consistent approach, no inline styles inside nodes
- Two-row node layout already exists in `ResourceNode.tsx` (name row + badge row) — `ActivityNode.tsx` needs to match this pattern
- `opacity` applied via React Flow `style` prop on node data — transition class on the node's root div will intercept this
- `satisfies` keyword used in `graph.ts` for type-safe object construction — follow same pattern when adding new fields

### Integration Points
- `ResourceNodeData` type → `graph.ts` (producer) → `ResourceNode.tsx` + `InfoPanel.tsx` (consumers). Adding `dependingActivityNames` touches all three.
- `NODE_HEIGHT` in `useDagreLayout.ts` is used for both node registration and position calculation — single constant, single change point.

</code_context>

<specifics>
## Specific Ideas

- "emoji icons + keep text" — user confirmed emoji prefix alongside existing abbreviation (not replacement)
- "second row below name" — layout mirrors the two-row resource node pattern already in the codebase
- "bulleted list below warning box" — extends the existing SPOF warning block rather than replacing it

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-polish-and-differentiators*
*Context gathered: 2026-03-29*
