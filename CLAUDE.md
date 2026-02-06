# Claude Code Guidelines

Project-specific instructions for Claude Code.

## Project Overview

Next.js App Router + Convex + Tailwind/shadcn stack following [Bulletproof React](https://github.com/alan2207/bulletproof-react) patterns.

## Directory Guidelines

See the AGENTS.md file in each directory for detailed conventions:

| File | Purpose |
| ---- | ------- |
| `AGENTS.md` | Project architecture, state management, core principles |
| `src/app/AGENTS.md` | App Router conventions, Server vs Client Components |
| `src/components/AGENTS.md` | Shared UI components, Lucide icon conventions |
| `src/features/AGENTS.md` | Feature module structure, Convex hook patterns |
| `src/lib/AGENTS.md` | Configuration vs utilities distinction |
| `src/utils/AGENTS.md` | Pure helpers, tryCatch error handling |
| `convex/AGENTS.md` | Backend patterns, validation, authorization, OCC |

## Key Principles

1. **Unidirectional flow**: shared → features → app (no cross-feature imports)
2. **No barrel files**: Import directly from source files
3. **Server Components by default**: Client Components only when needed
4. **Colocate code**: Feature-specific code in features/, shared code in components/

## Skills

Use `/skill-name` to invoke:

- `/conventional-commit` - Commit message formatting
- `/shadcn` - shadcn/ui component docs
- `/convex-best-practices` - Convex patterns
- `/frontend-design` - Distinctive UI design
- `/nextjs-pwa` - PWA setup

## Documentation

Fetch docs when using unfamiliar APIs:

- Next.js: `https://nextjs.org/docs/llms.txt`
- Convex: `https://docs.convex.dev/llms.txt`
- shadcn/ui: `https://ui.shadcn.com/llms.txt`
- nuqs: `https://nuqs.47ng.com/llms.txt`
- Zod: `https://zod.dev/llms.txt`
