# Structure

## Directory Layout

```
dep-graph-viewer/
├── src/
│   └── app/                   # Next.js App Router root
│       ├── layout.tsx          # Root layout (fonts, metadata, html/body)
│       ├── page.tsx            # Home page
│       └── globals.css         # Global styles (Tailwind v4 + theme)
├── public/                    # Static assets (currently empty of SVGs)
├── .claude/                   # Claude Code / GSD tooling
│   └── get-shit-done/
├── .planning/                 # GSD planning artifacts
│   └── codebase/
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── next.config.ts             # Next.js config
├── postcss.config.mjs         # PostCSS (Tailwind v4)
├── CLAUDE.md                  # Claude instructions
└── AGENTS.md                  # Agent instructions
```

## Key Locations

| Purpose | Path |
|---------|------|
| App entry / root layout | `src/app/layout.tsx` |
| Home page | `src/app/page.tsx` |
| Global styles | `src/app/globals.css` |
| Static assets | `public/` |
| TypeScript config | `tsconfig.json` |
| ESLint config | `eslint.config.mjs` |

## Naming Conventions

- **Pages/Layouts:** `page.tsx`, `layout.tsx` (Next.js file conventions)
- **Components:** PascalCase (`RootLayout`, `Home`)
- **CSS variables:** kebab-case with `--` prefix (`--background`, `--foreground`)
- **Path alias:** `@/*` maps to `./src/*`

## Adding New Code

- New pages: `src/app/[route]/page.tsx`
- New layouts: `src/app/[route]/layout.tsx`
- Shared components: `src/components/` (create directory)
- Utilities/helpers: `src/lib/` (create directory)
- Types: `src/types/` (create directory)
- Import using `@/` alias (e.g., `import { Foo } from '@/components/Foo'`)
