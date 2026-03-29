# Phase 5: Polish and Differentiators - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 05-polish-and-differentiators
**Areas discussed:** Resource type icons, RTO on activity node, SPOF activity list in sidebar, Opacity transition

---

## Resource Type Icons

| Option | Description | Selected |
|--------|-------------|----------|
| Emoji icons + keep text | Add emoji prefix to existing text badge (💻 TECH, 🔗 3P, etc.). No dependencies. | ✓ |
| Replace text with emoji only | Show just the emoji, no abbreviation text. Cleaner but less explicit. | |
| Icon component (SVG inline) | Hand-crafted SVG icons per type. Most polished, requires SVG paths. | |

**User's choice:** Emoji icons + keep text
**Notes:** Keep the abbreviation alongside the emoji so the badge remains readable to reviewers unfamiliar with the data.

---

## RTO on Activity Node

### Placement
| Option | Description | Selected |
|--------|-------------|----------|
| Second row below name | Node grows to ~64px. '4h RTO' in muted text. Matches resource node two-row layout. | ✓ |
| Inline after name | Keep h-12, fit 'Name · 4h' on one line. Risks truncation. | |
| Tiny badge overlay | Badge bottom-left like resource type. Node stays single-row. | |

**User's choice:** Second row below name

### Format
| Option | Description | Selected |
|--------|-------------|----------|
| Compact: '4h RTO' | Short, scannable. '1h RTO', '48h RTO'. | ✓ |
| Full: '4 hours' | More readable, more space. Same format as InfoPanel. | |
| Just '4h' | Most compact. May be unclear without label. | |

**User's choice:** Compact: '4h RTO'

---

## SPOF Activity List in Sidebar

| Option | Description | Selected |
|--------|-------------|----------|
| Bulleted list below warning box | Keep amber box, add list of activity names below it. | ✓ |
| Inside the warning box | Expand amber box to include names inline. Compact but can get long. | |
| Separate section | Distinct 'Depended on by' section with priority badges per activity. | |

**User's choice:** Bulleted list below warning box
**Notes:** Keeps the warning box intact; activity list is additive below it.

---

## Opacity Transition

| Option | Description | Selected |
|--------|-------------|----------|
| CSS transition on node wrapper | transition-opacity duration-150 on ActivityNode and ResourceNode divs. | ✓ |
| You decide | Claude picks implementation approach. | |

**User's choice:** CSS transition on node wrapper (~150ms)

---

## Claude's Discretion

- Exact emoji choices per resource type
- Tailwind class composition for RTO second row (size, color)
- Whether activity list uses `<ul>` or inline dots

## Deferred Ideas

None.
