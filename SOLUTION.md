# SOLUTION.md — Implementation Log

**Assignment:** Dependency Graph Viewer
**Candidate:** Sachin Baral
**Model used:** `global.anthropic.claude-sonnet-4-6` (Claude Sonnet 4.6 via Bedrock)

---

## Approach

I used **Claude Code** with a structured workflow called GSD ("Get Shit Done") — a planning-first methodology that breaks work into phases, plans each phase before writing code, and verifies every phase before moving on. This keeps AI-assisted development disciplined: no code is written without a plan, no phase is closed without verification.

The workflow for this assignment ran as:

```
Discuss Phase → Plan Phase → Execute Phase (parallel agents) → Verify Phase
```

All planning artifacts live in `.planning/` — readable evidence of the architectural thinking behind every decision.

---

## What Was Built

### Required Features

| Feature | Status | Notes |
|---------|--------|-------|
| Graph renders all nodes and edges | ✅ | 23 nodes, 30 edges from graph.json |
| Activities and resources visually distinct | ✅ | Blue (activity) vs green (resource), distinct node shapes |
| Directed edges with arrowheads | ✅ | `smoothstep` edges with `ArrowClosed` markers |
| SPOF detection — not tooltip-only | ✅ | Amber ring + dependency count badge, always visible |
| Click to highlight connections | ✅ | Blue ring on selected, dimmed non-connected nodes/edges |
| Click background/selected node to clear | ✅ | Both handled |
| Info panel with node details | ✅ | Fixed overlay sidebar, slides in on selection |
| SPOF indicator in info panel | ✅ | Amber warning box with activity dependency list |
| Reload button | ✅ | Re-fetches and re-renders, resets all state |
| Sort activities by criticality | ✅ | critical → high → medium → low |
| Sort resources by criticality | ✅ | SPOF-first, then by dependency count descending |

### Beyond Requirements (Senior Differentiators)

| Feature | Rationale |
|---------|-----------|
| Emoji-prefixed resource type badges (💻🔗👥🏢⚙️) | More scannable at small node sizes than text labels |
| RTO value displayed on activity nodes | Dataset field surfaced where it's immediately useful |
| Smooth 150ms opacity transitions on selection | Polished interaction feel |
| "Depended on by" activity name list in sidebar | Turns the SPOF count into actionable blast-radius detail |

---

## Architecture Decisions

### Why dagre for layout

`@dagrejs/dagre` is the industry standard for directed graphs in React Flow. The data has a natural activity→resource hierarchy that dagre's `TB` (top-bottom) layout handles cleanly. Nodes start at `{x:0, y:0}` and dagre overwrites positions after mount — a deliberate pattern to avoid a layout flash.

### Why data transform lives in `src/lib/graph.ts`

All derived data — SPOF status, dependency counts, `dependingActivityNames` — is computed once at transform time, not inside components. This keeps `GraphCanvas`, `InfoPanel`, and node components pure renderers that receive typed props. Switching to a backend would mean changing one call in `page.tsx`; everything downstream stays identical.

### Why InfoPanel is an overlay, not a sidebar column

Originally the panel was a fixed-width column in the flex layout. This meant 320px of whitespace was reserved even when no node was selected, shrinking the graph canvas unnecessarily. The final design positions the panel `absolute right-0` so it overlays the canvas — the graph always uses full width, and the panel slides in on top when a node is selected.

### Why `router.refresh()` for reload

Next.js App Router's `router.refresh()` re-runs the server component (`page.tsx`) which re-reads `graph.json` and passes fresh props to `GraphCanvas`. This resets all React state (selection, sort) cleanly in one call without a manual state reset cascade.

### Strict TypeScript — `satisfies` over type assertions

All node data objects use `satisfies ActivityNodeData` and `satisfies ResourceNodeData` at the construction site in `graph.ts`. This catches type mismatches at the point of creation rather than downstream, which is safer than a cast. No `any` types anywhere.

---

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Server component — reads graph.json, calls transformGraphData
│   └── layout.tsx            # Root layout
├── components/
│   ├── GraphCanvas.tsx       # Client component — React Flow canvas, all interaction state
│   ├── InfoPanel.tsx         # Overlay sidebar — slides in on node selection
│   ├── Toolbar.tsx           # Reload + sort controls
│   └── nodes/
│       ├── ActivityNode.tsx  # Blue node: name, priority badge, RTO row
│       └── ResourceNode.tsx  # Green node: emoji type badge, SPOF ring + count badge
├── hooks/
│   └── useDagreLayout.ts     # Applies dagre layout to nodes after mount
├── lib/
│   └── graph.ts              # Data transform + SPOF computation + dependingActivityNames
└── types/
    └── graph.types.ts        # All TypeScript interfaces — GraphJson, ActivityNodeData, ResourceNodeData
```

---

## Phase-by-Phase Log

### Phase 1 — Static Graph Render
**Goal:** Canvas with 23 nodes, 30 edges, dagre layout, visually distinct node types.

- Installed `@dagrejs/dagre` as production dependency
- Defined `GraphJson`, `ActivityNodeData`, `ResourceNodeData` types
- Built `transformGraphData()` — maps raw JSON to React Flow nodes + edges
- Created `ActivityNode` and `ResourceNode` custom components
- Built `useDagreLayout` hook — runs dagre TB layout after node mount
- Wired everything into `GraphCanvas` and `page.tsx`

**Key decision:** Opacity starts at 0, transitions to 1 after dagre applies positions — avoids a flash of all nodes stacked at origin.

---

### Phase 2 — SPOF Detection
**Goal:** 9 SPOF resource nodes identifiable at a glance.

- Extended `ResourceNodeData` with `isSPOF: boolean` and `dependencyCount: number`
- SPOF = `dependencyCount > 1` (matches assignment spec)
- `ResourceNode` redesigned: two-row layout, amber ring when SPOF, count badge
- Resource type label pill added (TECH / 3P / PEOPLE / BLDG / EQUIP)

**Result:** 10 nodes flagged (depCount > 1 threshold); all amber rings visible without any click.

---

### Phase 3 — Selection and Info Panel
**Goal:** Click-to-highlight blast radius with sidebar details.

- `selectedNodeId` state in `GraphCanvas`
- `onNodeClick` / `onPaneClick` handlers toggle selection
- Node opacity: selected node + connected nodes = 1.0, everything else = 0.2
- Edge opacity follows the same pattern (connected edges stay bright)
- `InfoPanel` component: fixed overlay, slides in right on selection
- Activity detail: name, priority badge, RTO, owner
- Resource detail: type badge, SPOF warning box, contact, vendor

---

### Phase 4 — Toolbar Controls
**Goal:** Reload, sort activities, sort resources.

- `Toolbar.tsx` with three controls: Reload, Sort Activities toggle, Sort Resources toggle
- `useDagreLayout` extended with `layoutKey` — incrementing this re-runs dagre with new node order
- Sort is pure: `[...nodes].sort(...)` on each render, no mutation
- Reload: `router.refresh()` re-runs server component, resets all client state

---

### Phase 5 — Polish and Differentiators
**Goal:** Senior-level details that distinguish the submission.

- `dependingActivityNames: string[]` added to `ResourceNodeData`, pre-computed in `graph.ts`
- Emoji-prefixed type badges on `ResourceNode` (💻 TECH, 🔗 3P, 👥 PEOPLE, 🏢 BLDG, ⚙️ EQUIP)
- RTO second row on `ActivityNode` (e.g. "4h RTO") — `NODE_HEIGHT` bumped 48→64
- `transition-opacity duration-150` on both node types for smooth selection animations
- InfoPanel "Depended on by" bulleted list for SPOF nodes

---

## How Claude Code Was Used

This assignment was built entirely through Claude Code — no manual code editing outside of the agent. The workflow:

1. **`/gsd:discuss-phase`** — Claude asked targeted questions to surface assumptions before planning
2. **`/gsd:plan-phase`** — Claude produced a detailed `PLAN.md` with tasks, file targets, and success criteria
3. **`/gsd:execute-phase`** — Parallel executor agents implemented each plan and committed atomically
4. **`/gsd:verify-work`** — Verifier agent checked every must-have against the actual codebase

The `.planning/` directory contains all artifacts: phase context, discussion logs, plans, summaries, and verification reports. It's a complete audit trail of how the app was built.

---

## Running the App

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. No environment variables required.
