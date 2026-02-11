# Claude Code Guidelines

Project-specific instructions for Claude Code.

## Project Overview

Next.js App Router + Convex + Tailwind/shadcn stack following [Bulletproof React](https://github.com/alan2207/bulletproof-react) patterns.

## Directory Guidelines

- @AGENTS.md
- @src/app/AGENTS.md
- @src/components/AGENTS.md
- @src/features/AGENTS.md
- @src/lib/AGENTS.md
- @src/utils/AGENTS.md
- @convex/AGENTS.md

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
