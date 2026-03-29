# Phase 1: Static Graph Render - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 01-static-graph-render
**Areas discussed:** Page chrome, Node label content, Loading / transition behavior, Component architecture

---

## Page Chrome

| Option | Description | Selected |
|--------|-------------|----------|
| Pure canvas — no chrome | Graph fills 100vh. No header, no title bar. React Flow Controls bottom-left inside canvas. | ✓ |
| Thin header with title | A small fixed header (48px) shows the app name. Canvas fills remaining height. | |
| Header + action area | Header with title plus space for action buttons (sort toggles, reload). | |

**User's choice:** Pure canvas — no chrome
**Notes:** Clean, immersive feel. Sets template for all future phases.

---

## Node Label Content

### Activity Nodes

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | E.g. "Onboarding". Clean, fits 160×48px card. Criticality level is Phase 4 scope. | ✓ |
| Name + criticality badge | E.g. "Onboarding" + "CRITICAL". Crowds the small card, overlaps Phase 4 scope. | |

**User's choice:** Name only

### Resource Nodes

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | E.g. "Core Banking". Resource type icons/badges are Phase 2 scope (GRAPH-05). | ✓ |
| Name + type badge | E.g. "Core Banking" + "technology". Overlaps Phase 2 scope. | |

**User's choice:** Name only

---

## Loading / Transition Behavior

### Data Loading

| Option | Description | Selected |
|--------|-------------|----------|
| Server-side | graph.json read in Server Component, passed as props. No loading flash. | ✓ |
| Client-side fetch | Graph component fetches via fetch() in useEffect. Shows loading state briefly. | |

**User's choice:** Server-side

### Layout Flash (dagre pre-layout moment)

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden canvas — show only when ready | opacity:0 until useNodesInitialized() fires, then reveal. Avoids 0,0 snap. | ✓ |
| Nodes snap into position | Nodes render at 0,0 briefly then jump to dagre positions. Simpler code. | |
| Centered spinner | Loading spinner while dagre runs, then swap in graph. | |

**User's choice:** Hidden canvas — show only when ready

---

## Component Architecture

### File Organization

| Option | Description | Selected |
|--------|-------------|----------|
| GraphCanvas + separate node components | GraphCanvas.tsx + ActivityNode.tsx + ResourceNode.tsx. Clean separation, extensible. | ✓ |
| Single GraphCanvas component | All graph logic in one file. Simpler but grows unwieldy across phases 2-4. | |

**User's choice:** GraphCanvas + separate node components

### Data Logic Location

| Option | Description | Selected |
|--------|-------------|----------|
| src/lib/graph.ts utility | Transformation logic in graph.ts. GraphCanvas receives transformed data as props. | ✓ |
| Inside GraphCanvas component | Transformation inline in GraphCanvas. Mixes data and UI concerns. | |

**User's choice:** src/lib/graph.ts utility

---

## Claude's Discretion

- Exact Tailwind class composition for node cards
- dagre configuration tuning (within UI-SPEC anchors)
- TypeScript type definitions for graph data shapes
- Error boundary implementation

## Deferred Ideas

None — discussion stayed within phase scope.
