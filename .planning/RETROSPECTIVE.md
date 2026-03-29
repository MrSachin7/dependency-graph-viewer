# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-29
**Phases:** 5 | **Plans:** 8 | **Tasks:** 14

### What Was Built

- React Flow canvas with 23 nodes, 30 edges, dagre TB layout, visually distinct activity (blue) vs resource (green) nodes
- SPOF detection with amber ring + dependency count badge on 10 SPOF resource nodes; resource type labels on all 15
- Click-to-select interaction with opacity dimming (0.2) of unconnected nodes/edges, blue selection ring
- Fixed 320px sidebar InfoPanel showing full node details, SPOF warning, and SPOF activity dependency list
- Toolbar: Reload (router.refresh), Sort Activities (criticality), Sort Resources (SPOF-first + dep count)
- Senior polish: emoji type badges (💻🔗👥🏢⚙️), RTO second row, smooth opacity transitions (150ms)
- `dependingActivityNames` data layer pre-computed in graph.ts, consumed by InfoPanel

### What Worked

- **Wave-based parallel execution** — Plans 05-01 and 05-02 ran in parallel with no conflicts; data layer ready for Wave 2
- **GSD planning discipline** — Phase context sessions surfaced the Next.js 16 breaking changes early; AGENTS.md reminder prevented stale API assumptions
- **Pre-computing in graph.ts** — keeping InfoPanel stateless and sourcing all derived data from the transform layer was clean and type-safe
- **`satisfies` type keyword** — catching type mismatches at the assignment site vs assertion kept the strict TypeScript constraint easy to maintain
- **Single-day delivery** — all 5 phases shipped on the same day; GSD kept execution focused

### What Was Inefficient

- Phase 3 ROADMAP.md checkbox was not updated by gsd-tools (stale `[ ]` for Phase 3 persisted into archival)
- Initial NODE_HEIGHT constant was set to 48 but needed to be 64 after adding RTO row in Phase 5 — height mismatch required a separate chore commit

### Patterns Established

- **Data transform as source of truth** — all computed/derived node data (isSPOF, dependencyCount, dependingActivityNames) lives in `src/lib/graph.ts`, not in components
- **Collocated type narrowing** — `satisfies NodeType` checks at the data construction site, not downstream
- **router.refresh() for reload** — clean App Router pattern that resets all React state without a manual state reset cascade
- **Wave grouping** — data-layer plans (Wave 1) before UI-consuming plans (Wave 2) proved correct dependency ordering

### Key Lessons

1. **Read node_modules/next/dist/docs/ for Next.js 16** — API changes are real and training data is stale; the AGENTS.md instruction to do this prevented several potential dead ends
2. **Pre-compute before render** — graph.ts is the right place for all SPOF logic, activity name mapping, etc. Keeping components as pure renderers simplified testing and verification
3. **HEIGHT constants propagate** — changing node height in a component requires updating the dagre layout hook constant too; document this coupling explicitly in future plans
4. **Phase 5 differentiators were high-ROI** — emoji badges and RTO display took <30min each but meaningfully elevate the submission's visual quality

### Cost Observations

- Model mix: ~100% Sonnet 4.6 (executor + verifier agents)
- Sessions: 1 day, ~5-6 GSD sessions
- Notable: Parallel wave execution (Wave 1 × 2 agents) completed without merge conflicts — worktree isolation worked cleanly

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~6 | 5 | First milestone — baseline established |

### Cumulative Quality

| Milestone | TypeScript Strict | No `any` | LOC |
|-----------|-------------------|----------|-----|
| v1.0 | ✓ | ✓ | 646 |
