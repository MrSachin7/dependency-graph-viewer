# Phase 3: Selection and Info Panel - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 03-selection-and-info-panel
**Areas discussed:** Dim/highlight effect, Sidebar design, Click behavior edge cases

---

## Dim/Highlight Effect

### Unconnected opacity

| Option | Description | Selected |
|--------|-------------|----------|
| Opacity 0.2 — strong dim | Clear blast radius focus | ✓ |
| Opacity 0.4 — gentle dim | Softer, less dramatic | |
| You decide | | |

**User's choice:** Opacity 0.2

### Selected node treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Blue ring (ring-2 ring-blue-500) | Explicit selection indicator | ✓ |
| No ring — just not dimmed | Simpler, contrast-only | |
| You decide | | |

**User's choice:** Blue ring

---

## Sidebar Design

### Width and empty state

| Option | Description | Selected |
|--------|-------------|----------|
| 320px, hint text when empty | "Click any node to explore" | ✓ |
| 280px, hidden when empty | Slides in on selection | |
| You decide | | |

**User's choice:** 320px with hint text

### Activity node fields

| Option | Description | Selected |
|--------|-------------|----------|
| All fields (Name, Priority, RTO, Owner) | Complete context | ✓ |
| Name and Priority only | Minimal | |
| You decide | | |

**User's choice:** All fields

### SPOF risk statement

| Option | Description | Selected |
|--------|-------------|----------|
| ⚠️ {N} activities depend on this resource — single point of failure | Warning, count, clear label | ✓ |
| SPOF: Depended on by {N} activities | Label-style | |
| You decide | | |

**User's choice:** ⚠️ {N} activities depend on this resource — single point of failure

---

## Click Behavior Edge Cases

| Option | Description | Selected |
|--------|-------------|----------|
| Switch directly to new selection | No background click needed | ✓ |
| Require background click first | Two-click flow | |

**User's choice:** Switch directly

---

## Claude's Discretion

- Sidebar padding and field label styling
- Whether sidebar overlays or pushes canvas
- Transition animations
- Priority badge color implementation
