# Concerns

## Critical

| Concern | Location | Impact |
|---------|----------|--------|
| Incomplete implementation | `src/app/page.tsx` | Only placeholder content exists — core graph viewer features not yet built |
| No graph data source | N/A | No data file or API for graph data; needs to be defined before graph can render |

## Architecture

- **No component structure** — `src/components/` doesn't exist yet; no organization for the React Flow graph components
- **No error handling** — No `error.tsx`, no error boundaries, no loading states
- **No type definitions** — No `src/types/` directory for graph node/edge types

## Code Quality

- **`allowJs: true` in tsconfig** — Permits JavaScript files despite strict TypeScript mode; potential for type-unsafe code to slip in
- **Incomplete ESLint config** — Missing React hooks rules and import ordering rules; relies solely on Next.js preset
- **No Prettier** — No auto-formatting configured; code style drift possible in team settings
- **No pre-commit hooks** — No Husky/lint-staged to enforce lint/type-check before commits

## Dependencies

- **Experimental React Compiler** (`babel-plugin-react-compiler@1.0.0`) — Pinned to a pre-stable version; may have breaking changes or bugs
- **Tailwind CSS v4** — New major version with different syntax (`@import "tailwindcss"` vs v3 `@tailwind` directives); less ecosystem tooling support than v3
- **Next.js 16.2.1** — Very recent release; less community battle-testing than stable v14/v15

## Performance

- **No graph layout algorithm chosen** — React Flow supports multiple layout engines (dagre, elk, d3-hierarchy); choice affects visual quality and performance at scale
- **Large graph rendering** — No virtualization strategy for graphs with hundreds/thousands of nodes

## Testing

- **Zero test coverage** — No test framework, no tests; risky for graph logic (cycle detection, SPOF analysis)
- **No graph data validation** — No runtime schema validation for input data

## Security

- **No input sanitization** — If graph data comes from user input or external files, no validation layer exists yet
- **Client-side only concern** — No server-side auth or API routes planned yet

## Deployment

- **No environment config** — No `.env.example`, no documented environment variables
- **No CI/CD pipeline** — No GitHub Actions or similar configured
