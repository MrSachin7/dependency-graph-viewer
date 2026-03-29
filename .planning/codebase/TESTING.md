# Testing

## Current State

**No test framework configured.** The project is a fresh Next.js scaffold with no tests.

## Recommended Setup

Given the stack (Next.js 16, React 19, TypeScript, React Flow), recommended testing approach:

### Unit / Component Tests
- **Framework:** Vitest + React Testing Library
- **Install:** `pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom`

### E2E Tests
- **Framework:** Playwright
- **Install:** `pnpm add -D @playwright/test`

## Recommended File Structure

```
src/
├── components/
│   └── GraphNode/
│       ├── GraphNode.tsx
│       └── GraphNode.test.tsx    # Co-located unit tests
├── lib/
│   └── graph-utils.test.ts       # Utility function tests
tests/
└── e2e/
    └── graph-viewer.spec.ts      # Playwright E2E tests
```

## Test Patterns (When Implemented)

```typescript
// Component test pattern
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GraphNode } from '@/components/GraphNode'

describe('GraphNode', () => {
  it('renders node label', () => {
    render(<GraphNode label="react" />)
    expect(screen.getByText('react')).toBeInTheDocument()
  })
})
```

## Mocking

- Next.js router: `vi.mock('next/navigation')`
- React Flow: mock `@xyflow/react` hooks for isolated component tests

## CI

No CI pipeline configured. Recommended: GitHub Actions with `pnpm test` step.
