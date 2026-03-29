# Dependency Graph Viewer — Submission

> **Interviewer:** Everything you need is below. Start with [What's Delivered](#whats-delivered), then [SOLUTION.md](./SOLUTION.md) for architecture, then [`.planning/`](#how-this-was-built----the-planning-directory) for the full audit trail.

**Model used:** `global.anthropic.claude-sonnet-4-6` (Claude Sonnet 4.6 via Bedrock)

## Running the App

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. No environment variables required.

---

## What's Delivered

All required features are implemented and verified:

| Feature | Status | Notes |
|---------|--------|-------|
| Graph renders all nodes and edges | ✅ | 23 nodes, 30 edges from `data/graph.json` |
| Activities and resources visually distinct | ✅ | Blue activity nodes vs green resource nodes |
| Directed edges with arrowheads | ✅ | `smoothstep` edges, `ArrowClosed` markers |
| SPOF detection — not tooltip-only | ✅ | Amber ring + dependency count badge, always visible |
| Click to highlight connections | ✅ | Blue ring, unconnected nodes/edges dimmed to 0.2 |
| Click background/selected node to clear | ✅ | Both handled |
| Info panel with node details | ✅ | Overlay sidebar slides in on selection |
| SPOF indicator in info panel | ✅ | Amber warning box + activity dependency list |
| Reload button | ✅ | Re-fetches data, resets all state |
| Sort activities by criticality | ✅ | critical → high → medium → low |
| Sort resources by criticality | ✅ | SPOF-first, then by dependency count |

**Beyond requirements:**
- Emoji-prefixed resource type badges (💻 TECH, 🔗 3P, 👥 PEOPLE, 🏢 BLDG, ⚙️ EQUIP)
- RTO value displayed on activity nodes
- Smooth 150ms opacity transitions on selection interactions
- "Depended on by" activity name list in sidebar for SPOF resources

See **[SOLUTION.md](./SOLUTION.md)** for architecture decisions and a phase-by-phase implementation log.

---

## Conversation Export

The complete Claude Code conversation is exported as a `.txt` file in the repository root — every prompt, agent response, planning discussion, and execution step from start to finish.

To export a fresh copy at any point: run `/export` inside Claude Code.

---

## How This Was Built — The `.planning/` Directory

This project was built using a planning-first AI workflow called **GSD**. Rather than prompting Claude to write code directly, every piece of work went through a structured cycle:

```
Discuss → Plan → Execute → Verify
```

The `.planning/` directory is a complete, machine-readable audit trail of that process.

### Directory Map

```
.planning/
├── PROJECT.md              # Living project brief — requirements, decisions, current state
├── ROADMAP.md              # Phase structure and milestone summary
├── MILESTONES.md           # Shipped milestones with accomplishment list
├── RETROSPECTIVE.md        # What worked, what didn't, lessons learned
│
├── phases/
│   ├── 01-static-graph-render/
│   │   ├── 01-CONTEXT.md         # Why this phase; constraints; key decisions made
│   │   ├── 01-DISCUSSION-LOG.md  # Alternatives considered before planning
│   │   ├── 01-01-PLAN.md         # Task-level plan with file targets and success criteria
│   │   ├── 01-01-SUMMARY.md      # What was actually built (written post-execution)
│   │   ├── 01-VERIFICATION.md    # Verifier agent report — every must-have checked against codebase
│   │   └── 01-UI-SPEC.md         # Visual design contract for node components
│   │
│   ├── 02-spof-detection/
│   ├── 03-selection-and-info-panel/
│   ├── 04-toolbar-controls/
│   └── 05-polish-and-differentiators/
│
└── milestones/
    ├── v1.0-ROADMAP.md           # Full archived roadmap at v1.0 ship
    └── v1.0-REQUIREMENTS.md      # All 20 requirements with phase traceability
```

### Reading a Phase (Example: Phase 2 — SPOF Detection)

Each phase tells the full story of a feature:

1. **`CONTEXT.md`** — what problem this phase solves and the constraints going in
2. **`DISCUSSION-LOG.md`** — alternatives considered and why they were rejected
3. **`PLAN.md`** — exact tasks the executor agent ran, with file targets and acceptance criteria
4. **`SUMMARY.md`** — what was actually built, written by the executor agent after completion
5. **`VERIFICATION.md`** — an independent verifier agent checking every success criterion against the real codebase (not just trusting the executor)

This means you can trace any line of code back to a requirement, a decision, and a rationale.

### Suggested Reading Order

1. **[SOLUTION.md](./SOLUTION.md)** — architecture and phase-by-phase log (start here)
2. **[.planning/PROJECT.md](./.planning/PROJECT.md)** — all 20 v1 requirements mapped to phases and status
3. **[.planning/phases/01-static-graph-render/01-CONTEXT.md](./.planning/phases/01-static-graph-render/01-CONTEXT.md)** — how the graph canvas architecture was designed
4. **[.planning/phases/05-polish-and-differentiators/05-VERIFICATION.md](./.planning/phases/05-polish-and-differentiators/05-VERIFICATION.md)** — final verification report (12/12 must-haves)

---

## Source Structure

```
src/
├── app/
│   └── page.tsx              # Server component — reads graph.json, transforms data
├── components/
│   ├── GraphCanvas.tsx       # React Flow canvas with all interaction state
│   ├── InfoPanel.tsx         # Overlay sidebar — slides in on node selection
│   ├── Toolbar.tsx           # Reload + sort controls
│   └── nodes/
│       ├── ActivityNode.tsx  # Blue: name, priority badge, RTO row
│       └── ResourceNode.tsx  # Green: emoji type badge, SPOF ring + count badge
├── hooks/
│   └── useDagreLayout.ts     # Applies dagre TB layout after mount
├── lib/
│   └── graph.ts              # Data transform, SPOF computation, dependingActivityNames
└── types/
    └── graph.types.ts        # GraphJson, ActivityNodeData, ResourceNodeData
```

---

## Tech Stack

- **Next.js 16.2.1** + **React 19** — App Router, server components by default
- **@xyflow/react 12.10.2** — React Flow graph canvas
- **@dagrejs/dagre** — automatic hierarchical (TB) layout
- **Tailwind CSS v4** — utility-first styling
- **TypeScript 5** — strict mode throughout; `satisfies` for type safety at construction; no `any`

---

# Original Assignment Brief

**Role:** Senior Frontend Engineer
**Time:** 1–2 hours
**Deadline:** Please return within 2-3 days of receiving this

---

## Background

Fortiv is a business continuity management platform. One of its core features is a **dependency graph** — a visual map of which critical business activities rely on which resources (systems, people, buildings, vendors). When something fails, the graph helps organizations quickly understand the blast radius.

Your task is to build a simplified version of this interface.

---

## The Task

Build a **dependency graph viewer** using the provided dataset (`data/graph.json`) with Claude Code.

### Required features

**Graph rendering**
- Render activities and resources as nodes using consistent visualization, with directed edges showing dependencies
- Activities and resources should be visually distinct (different shape, color, or label style — your call)

**Interaction**
- Clicking a node highlights its immediate connections (the node itself, its edges, and the nodes at the other end of those edges)
- Everything else should be visually de-emphasized when a selection is active
- Clicking the background or the selected node again clears the selection

**Single Point of Failure detection**
- Any resource node that is depended on by more than one node should be flagged as a Single Point of Failure (SPOF)
- SPOF nodes must be visually distinct at a glance — not just a tooltip

**Info panel**
- When a node is selected, show a panel (sidebar or overlay) with the node's details from the dataset
- For resource nodes, include a SPOF indicator if applicable

**Interactivity**
- There should be a button the user can click to reload the data and show an updated graph
- There should be an option where activities can be ordered based on their criticality or not
- There should be an option where resources can be ordered based on their criticality or not

### Technical requirements

- Build with Claude Code
- React 19 + TypeScript (strict mode — no `any`, props fully typed)
- React Flow for the graph
- Tailwind CSS for styling
- No backend — load from the provided JSON file

---

## What we are not looking for

- Pixel-perfect design — functional and clear is enough
- Automatic layout perfection — a reasonable initial layout is fine

---

## Setup

You are required to use Claude Code to do this assignment. Below are environment setup details to have Claude Code connect to to our environment. Usage is logged & monitored. You can use either Sonnet or Opus models below:

```
export ANTHROPIC_MODEL='global.anthropic.claude-sonnet-4-6'

or

export ANTHROPIC_MODEL='global.anthropic.claude-opus-4-6-v1'

export AWS_REGION="eu-central-1"
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_SMALL_FAST_MODEL='eu.anthropic.claude-haiku-4-5-20251001-v1:0'
export AWS_BEARER_TOKEN_NAME=<redacted>
export AWS_BEARER_TOKEN_BEDROCK=<redacted>
```

Bootstrap however you prefer. A standard Vite + React + TypeScript scaffold works well:

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm add @xyflow/react tailwindcss
```

Place the provided `data/graph.json` wherever makes sense in your project.

---

## Submission

Send us:
- Export of the complete conversation with the coding agent - include any questions, follow-ups - the entire conversation you had with the agent and specify which model was used (use `/export` with Claude Code).
- The coding agent should be used to write and update `SOLUTION.md` as an implementation log to track your progress through the implementation with the agent.
- A link to a Git repository (GitHub, GitLab, etc.) with your code (or attached zip)

---

## Data format

See `data/graph.json`. The structure:

```ts
type NodeType = "activity" | "resource";
type ResourceType = "technology" | "people" | "building" | "third_party" | "equipment";

interface ActivityNode {
  id: string;
  type: "activity";
  name: string;
  rto_hours: number;          // Recovery Time Objective in hours
  priority: "critical" | "high" | "medium" | "low";
  owner: string;
}

interface ResourceNode {
  id: string;
  type: "resource";
  resource_type: ResourceType;
  name: string;
  vendor?: string;            // present for third_party resources
  contact?: string;           // responsible owner or contact
}

interface Dependency {
  from: string;               // activity id
  to: string;                 // resource id
}

interface GraphData {
  nodes: (ActivityNode | ResourceNode)[];
  dependencies: Dependency[];
}
```
