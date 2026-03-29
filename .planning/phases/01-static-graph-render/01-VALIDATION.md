---
phase: 1
slug: static-graph-render
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (installed in Plan 01-01 Wave 0) |
| **Config file** | vitest.config.ts (created in Plan 01-01 Task 1) |
| **Quick run command** | `pnpm test src/lib/graph.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test src/lib/graph.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01-01 | 0 | GRAPH-01 | unit | `pnpm test src/lib/graph.test.ts` | ❌ W0 creates it | ⬜ pending |
| 1-01-02 | 01-01 | 0 | GRAPH-04 | unit | `pnpm test src/lib/layout.test.ts` | ❌ W0 creates it | ⬜ pending |
| 1-02-01 | 01-02 | 1 | GRAPH-01, GRAPH-03 | unit | `pnpm test src/lib/graph.test.ts` | ✅ after W0 | ⬜ pending |
| 1-02-02 | 01-02 | 1 | GRAPH-04 | unit | `pnpm test src/lib/layout.test.ts` | ✅ after W0 | ⬜ pending |
| 1-03-01 | 01-03 | 2 | GRAPH-02 | manual | visual check (see Manual-Only section) | n/a | ⬜ pending |
| 1-03-02 | 01-03 | 2 | GRAPH-02 | manual | visual check (see Manual-Only section) | n/a | ⬜ pending |
| 1-04-01 | 01-04 | 3 | GRAPH-01..04 | ts+unit | `pnpm test 2>&1 \| tail -5` | ✅ after W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration with `@/*` alias resolving to `./src/`
- [ ] `src/lib/graph.test.ts` — failing stubs for GRAPH-01, GRAPH-02, GRAPH-03 (RED phase — import error until Plan 01-02)
- [ ] `src/lib/layout.test.ts` — failing stubs for GRAPH-04 (RED phase — import error until Plan 01-02)
- [ ] Install vitest + @vitejs/plugin-react as devDependencies

Wave 0 is complete when `pnpm test` exits non-zero with module-not-found errors (not syntax errors, not "no test files found").

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Canvas zoom and pan feel smooth | GRAPH-01 | Browser interaction cannot be automated in unit tests | Open dev server, zoom with scroll wheel and drag canvas — should feel responsive |
| Visual distinction between activity and resource nodes (blue vs green, different border radius) | GRAPH-02 | Color and shape perception requires visual check — unit tests verify handle count and type, not rendered appearance | Open canvas, confirm activity nodes have blue borders (#2563eb) and resource nodes have green borders (#16a34a) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or are marked manual-only
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (graph.test.ts, layout.test.ts, vitest.config.ts)
- [ ] No watch-mode flags (scripts use `vitest run`, not `vitest`)
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
