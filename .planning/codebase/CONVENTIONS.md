# Conventions

## TypeScript

- **Strict mode** enabled (`"strict": true` in tsconfig.json)
- No `any` types
- `Readonly<>` used for component props where immutability matters
- Type imports: `import type { Foo } from 'bar'`
- Target: ES2017, module resolution: `bundler`

## Naming

| Context | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `RootLayout`, `Home` |
| Variables/functions | camelCase | `geistSans`, `metadata` |
- CSS custom properties | kebab-case | `--background`, `--font-geist-sans` |
| Files (pages/layouts) | Next.js conventions | `page.tsx`, `layout.tsx` |

## React / Next.js Patterns

- **Server Components by default** — no `"use client"` unless browser APIs needed
- **Metadata:** exported `metadata` const in page/layout files
- **Fonts:** `next/font/google` with CSS variable injection
- **Path alias:** `@/*` for all src imports

## Styling

- **Tailwind CSS v4** — utility-first, imported via `@import "tailwindcss"` in globals.css
- **CSS custom properties** for theming (`--background`, `--foreground`)
- **`@theme inline`** directive maps CSS vars to Tailwind tokens
- Tailwind classes used directly in JSX

## Linting

- ESLint 9.x with flat config (`eslint.config.mjs`)
- `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` rules
- `.claude/` directory excluded from linting
- Run: `pnpm lint`

## Import Order

```typescript
// 1. Type imports
import type { Metadata } from "next";
// 2. Framework imports
import { Geist } from "next/font/google";
// 3. Local imports (using @/ alias)
import "./globals.css";
```

## Error Handling

No custom error handling patterns established yet. Next.js defaults apply.
