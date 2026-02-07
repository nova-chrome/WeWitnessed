# lib/ - Configuration & Integrations

This directory contains configuration, client instances, and external service integrations.

## What Belongs Here

- Client instances (auth, database, API clients)
- Environment configuration (t3-env)
- Framework adapters and integrations
- Shared schemas for external libraries (nuqs, zod schemas)
- Service configuration

## Current Files

| File | Purpose |
|------|---------|
| `auth-client.ts` | Better Auth client instance |
| `convex.ts` | Convex client utilities |
| `env.ts` | Type-safe environment variables (t3-env) - **src/ only** |
| `search-params.ts` | nuqs URL state schemas |
| `utils.ts` | shadcn/ui `cn()` helper (exception) |

## What Does NOT Belong Here

These belong in `utils/` instead:

- Pure helper functions (string manipulation, formatting)
- Stateless transformations
- Math utilities

## Rules

### Configuration Over Implementation

Files here configure and export instances, not implement business logic:

```typescript
// ✅ Good: Configuration
import { createAuthClient } from "better-auth/client"
export const authClient = createAuthClient({ ... })

// ❌ Bad: Business logic (belongs in features/)
export async function loginUser(email: string, password: string) {
  // ... implementation
}
```

### Centralized Exports

Each integration should have a single entry point:

```typescript
// lib/auth-client.ts - Single source of truth
export const authClient = createAuthClient({ ... })

// Components import from here
import { authClient } from '@/lib/auth-client'
```

## Environment Variables (t3 env)

### When to Use

t3 env is for **client and server code within `src/`** only:

- Server-only variables (secrets, API keys for server components/actions)
- Client-accessible variables (prefixed with `NEXT_PUBLIC_`)
- Variables used in pages, components, and route handlers

### NOT for Convex Backend

Do NOT use t3 env in `convex/` directory. Convex functions:

- Cannot access client variables (`NEXT_PUBLIC_*`)
- Should read environment variables directly: `process.env.VARIABLE_NAME`
- Have their own secret management in the Convex dashboard

### Usage Pattern

```typescript
// src/lib/env.ts or imported from there
import { env } from '~/lib/env'

// Safe to use everywhere in src/
const convexUrl = env.NEXT_PUBLIC_CONVEX_URL  // Client & server
const deployment = env.CONVEX_DEPLOYMENT      // Server only (if needed in RSCs)
```
