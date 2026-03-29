# Phase 4: Toolbar Controls - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 04-toolbar-controls
**Areas discussed:** Reload mechanism, Sort toggle behavior, Toolbar placement

---

## Reload Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| router.refresh() | Re-runs server component, re-reads file, resets all state | ✓ |
| Client fetch via API route | Add /api/graph route, GraphCanvas fetches on click | |
| Move fetch to client entirely | Put graph.json in /public, remove server-side read | |

**User's choice:** router.refresh()
**Notes:** Cleanest with current architecture; also resets selection and sort state automatically.

---

## Sort Toggle Behavior

### Sort effect

| Option | Description | Selected |
|--------|-------------|----------|
| Re-run dagre with sorted nodes | Sort node list, re-run dagre layout — clean hierarchical positions | ✓ |
| Shift y-positions manually | Keep horizontal positions, only adjust vertical | |

**User's choice:** Re-run dagre with sorted nodes

### Sort state (toggle off)

| Option | Description | Selected |
|--------|-------------|----------|
| Restore original load order | Revert to original dagre layout from graph.json load order | ✓ |
| Stay in current positions | Once sorted, positions persist until reload | |

**User's choice:** Restore original load order
**Notes:** Toggle acts as on/off for sort view.

---

## Toolbar Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Top header bar above canvas | Fixed bar above ReactFlow canvas, always visible, no node overlap | ✓ |
| ReactFlow <Panel> overlay | Float over canvas top-left or top-center | |

**User's choice:** Top header bar above canvas
**Notes:** Canvas height becomes calc(100vh - toolbar-height). Layout: `[ Reload ] [ Sort Activities ▼ ] [ Sort Resources ▼ ]`

---

## Claude's Discretion

- Exact toolbar height and background color
- Sort toggle visual active state implementation
- Whether useDagreLayout hook is extended or a new invocation path created
- Transition animation on node reposition after sort

## Deferred Ideas

None — discussion stayed within phase scope.
