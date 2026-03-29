# Milestones

## v1.0 MVP (Shipped: 2026-03-29)

**Phases completed:** 5 phases, 8 plans, 14 tasks

**Key accomplishments:**

- @dagrejs/dagre@3.0.0 added as production dependency enabling dagre-based hierarchical layout for Plan 02
- React Flow canvas with 23 nodes and 30 edges, dagre TB layout, blue activity vs green resource distinction, opacity-reveal on initialization
- SPOF computation via dependency count in graph.ts, amber ring + count badge on 10 SPOF resource nodes, and resource type label pill (TECH/3P/PEOPLE/BLDG/EQUIP) on all 15 resource nodes
- Click-to-select interaction with blue ring, opacity dimming of unconnected nodes/edges, and fixed 320px sidebar showing activity/resource details including SPOF warning
- Toolbar with Reload, Sort Activities, Sort Resources added to GraphCanvas — sort applies via pure event handlers, reload resets all state via router.refresh() initialNodes reference change detection
- ResourceNodeData extended with dependingActivityNames string array, populated by mapping activity names through dependency edges in transformGraphData
- Emoji-prefixed resource type badges, RTO second row on activity nodes, and smooth opacity transitions — the senior differentiators D-01 through D-06
- SPOF resource sidebar now lists all depending activity names below the amber warning box, sourced directly from `data.dependingActivityNames`

---
