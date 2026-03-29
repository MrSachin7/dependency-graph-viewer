# Phase 2: SPOF Detection - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 02-spof-detection
**Areas discussed:** SPOF visual treatment, Resource type indicator, Node layout

---

## SPOF Visual Treatment

### Ring color

| Option | Description | Selected |
|--------|-------------|----------|
| Amber/orange ring | Warning signal — communicates 'at risk' | ✓ |
| Red ring | High-urgency signal — can feel alarming when 9/15 nodes are SPOFs | |
| You decide | Claude picks based on palette | |

**User's choice:** Amber/orange ring
**Notes:** Recommended choice accepted

### Badge placement

| Option | Description | Selected |
|--------|-------------|----------|
| Top-right corner, overlapping edge | Standard notification badge placement | ✓ |
| Inside node, below name | Contained but uses vertical space | |
| You decide | Claude picks | |

**User's choice:** Top-right corner, overlapping node edge
**Notes:** Recommended choice accepted

---

## Resource Type Indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Small text label badge (TECH, PEOPLE, etc.) | Bottom-left, readable without icon knowledge | ✓ |
| Single emoji per type | Visual, small, less accessible | |
| You decide | Claude picks | |

**User's choice:** Text label badge
**Notes:** Recommended choice accepted. Labels: TECH, 3P, PEOPLE, BLDG, EQUIP

---

## Node Height With Both Indicators

| Option | Description | Selected |
|--------|-------------|----------|
| Grow taller — two-row layout (~64px) | Name row + type badge row, SPOF overlays outside | ✓ |
| Same height, fit in one row | Cramped at 44px | |
| You decide | Claude picks | |

**User's choice:** Grow taller — two-row layout
**Notes:** Recommended choice accepted

---

## Claude's Discretion

- Exact Tailwind class composition
- Whether to use `ring` or `outline` for SPOF indicator
- Dagre re-layout behavior (automatic via useNodesInitialized gate)
