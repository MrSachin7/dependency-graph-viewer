# Dependency Graph Viewer

## What This Is

A frontend take-home assignment for Fortiv — a dependency graph viewer built on Next.js 16.2.1 + React 19 + @xyflow/react. It visualizes which critical business activities depend on which resources (systems, people, buildings, vendors), highlights single points of failure with always-visible badges, and lets users explore blast radius by clicking any node. The info panel shows full node details and, for SPOF resources, lists every activity that depends on them.

## Core Value

A user looking at the graph can immediately see which resources are SPOFs and, by clicking any node, understand exactly what depends on what — without reading a table.

## Current State

**v1.0 shipped 2026-03-29.** All 5 phases complete, 8 plans, 14 tasks. 646 LOC TypeScript. Full feature set delivered: static graph canvas, SPOF detection, click-to-select interaction, toolbar controls, and senior-level polish (emoji type badges, RTO display, opacity transitions, activity name listing in sidebar).

## Requirements

### Validated

- ✓ Next.js 16 + React 19 + TypeScript scaffold — existing
- ✓ @xyflow/react installed — existing
- ✓ Tailwind CSS v4 configured — existing
- ✓ data/graph.json present (8 activities, 15 resources, 29 dependencies) — existing
- ✓ Render activity and resource nodes with directed edges; activities and resources visually distinct — v1.0 (Phase 1)
- ✓ SPOF detection: resource nodes depended on by >1 node flagged with persistent badge and ring/border — v1.0 (Phase 2)
- ✓ Click a node to highlight its immediate connections; everything else visually de-emphasized — v1.0 (Phase 3)
- ✓ Click background or selected node again to clear selection — v1.0 (Phase 3)
- ✓ Sidebar info panel shows node details on selection; includes SPOF indicator for resource nodes — v1.0 (Phase 3)
- ✓ Reload button re-fetches graph.json and re-renders the graph — v1.0 (Phase 4)
- ✓ Toggle to order activities by criticality (critical → high → medium → low) — v1.0 (Phase 4)
- ✓ Toggle to order resources by criticality (SPOF first, then by dependency count) — v1.0 (Phase 4)
- ✓ Emoji-prefixed type badges on resource nodes (💻 🔗 👥 🏢 ⚙️) — v1.0 (Phase 5)
- ✓ RTO second row on activity nodes — v1.0 (Phase 5)
- ✓ Smooth opacity transitions on node interactions — v1.0 (Phase 5)
- ✓ InfoPanel "Depended on by" activity list for SPOF resource nodes — v1.0 (Phase 5)

### Active

*(no active requirements — v1.0 complete)*

### Out of Scope

- Backend / API / authentication — static JSON file only
- Pixel-perfect design — functional and clear is sufficient
- Automatic layout perfection — reasonable initial layout is fine
- Mobile responsiveness — desktop-only viewport assumed
- Edge color/style by relationship type (V2-01)
- Zoom to fit on load (V2-03)
- Keyboard navigation (V2-04)
- Export graph as PNG (V2-05)

## Context

- **Data:** `data/graph.json` — 8 activities, 15 resources, 29 dependency edges. One activity-to-activity edge exists (act-8 → act-6), so the graph is not strictly bipartite.
- **SPOF nodes:** res-1 (Core Banking, 3 deps), res-3 (Data Warehouse, 2), res-4 (Salesforce, 2), res-5 (VPN, 2), res-7 (IT Team, 2), res-9 (HQ Office, 2), res-10 (Primary DC, 3), res-11 (AWS, 2), res-12 (M365, 4) — 9 SPOF nodes total, 10 counted with dep >1 threshold
- **Assignment context:** Senior frontend take-home evaluated on code quality, architectural decisions, and differentiators.
- **Codebase:** 646 LOC TypeScript across `src/` (types, lib, hooks, components)

## Constraints

- **Tech stack:** Next.js 16.2.1 + React 19 + @xyflow/react + Tailwind CSS v4 — locked by scaffold
- **TypeScript:** Strict mode, no `any`, all props fully typed
- **No backend:** Data loaded from static JSON file only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Graph layout: dagre (TB) | Industry standard for directed graphs; handles layered activity→resource structure | ✓ Good — clean hierarchy |
| Info panel: fixed sidebar (320px) | Avoids occlusion of graph nodes; details visible while graph remains interactive | ✓ Good |
| Resource criticality order: SPOF first, then dep count | SPOFs = highest risk; dep count breaks ties | ✓ Good |
| Reload via router.refresh() + reference change detection | Clean Next.js App Router pattern; resets all React state cleanly | ✓ Good |
| Emoji badges for resource types (💻🔗👥🏢⚙️) | More scannable than text labels at small node sizes | ✓ Good |
| dependingActivityNames pre-computed in graph.ts | Keeps InfoPanel pure/stateless; computation collocated with data transform | ✓ Good |
| SPOF threshold: dependency count > 1 | User-specified requirement | ✓ Good |

---
*Last updated: 2026-03-29 after v1.0 milestone*
