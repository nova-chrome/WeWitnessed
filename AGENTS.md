# Project Architecture

> Adapted from [Bulletproof React](https://github.com/alan2207/bulletproof-react) for Next.js App Router + Convex

## Stack

- **Framework**: Next.js (App Router)
- **Database/Backend**: Convex
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript (strict)

## Project Structure

```
.
├── app/                    # Next.js App Router (routes, layouts, pages)
├── components/             # Shared UI components
│   └── ui/                 # shadcn/ui components
├── features/               # Feature-based modules
│   └── [feature]/
│       ├── components/     # Feature-specific components
│       ├── hooks/          # Feature-specific hooks
│       ├── types/          # Feature-specific types
│       └── utils/          # Feature-specific utilities
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── [feature].ts        # Queries/mutations by feature
│   └── _generated/         # Auto-generated (don't edit)
├── hooks/                  # Shared hooks
├── lib/                    # Configuration & integrations
├── utils/                  # Pure helper functions
├── types/                  # Shared TypeScript types
└── public/                 # Static assets
```

### lib/ vs utils/

| `lib/` | `utils/` |
|--------|----------|
| Configuration & integrations | Pure helper functions |
| Client instances (auth, db) | String manipulation |
| Environment setup | Date formatting |
| Framework adapters | Array/object helpers |
| Schemas (nuqs, zod) | Formatting (currency, numbers) |

```typescript
// lib/auth-client.ts - Integration
export const authClient = createAuthClient({ ... })

// utils/format.ts - Pure function
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
```

**Exception**: `lib/utils.ts` with `cn()` is a shadcn/ui convention - keep it there.

## Core Principles

### 1. Feature-Based Organization

Organize code by feature, not by type. Each feature is self-contained:

```
features/
├── auth/
│   ├── components/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── hooks/
│   │   └── use-auth.ts
│   └── types/
│       └── auth.ts
├── projects/
│   ├── components/
│   │   ├── project-card.tsx
│   │   └── project-list.tsx
│   └── hooks/
│       └── use-projects.ts
```

### 2. Unidirectional Code Flow

Code flows in one direction: `shared → features → app`

```
✅ app/ can import from features/, components/, lib/, hooks/
✅ features/ can import from components/, lib/, hooks/
✅ components/ can import from lib/, hooks/
❌ features/ cannot import from app/
❌ components/ cannot import from features/
❌ features/ cannot import from other features/
```

### 3. No Cross-Feature Imports

Features should not import from each other. Compose features at the app level.

```tsx
// ❌ Bad: Cross-feature import
// features/projects/components/project-card.tsx
import { UserAvatar } from '@/features/users/components/user-avatar'

// ✅ Good: Use shared component or compose at app level
import { Avatar } from '@/components/ui/avatar'
```

### 4. Colocate Related Code

Keep components, hooks, types close to where they're used:
- Feature-specific code → `features/[feature]/`
- Shared across features → `components/`, `hooks/`, `lib/`

### 5. No Barrel Files

Do NOT create `index.ts` barrel files for re-exporting. Import directly from the source file:

```tsx
// ❌ Bad: Barrel file re-exports
// features/auth/components/index.ts
export { LoginForm } from './login-form'
export { UserButton } from './user-button'

// ❌ Bad: Importing from barrel
import { UserButton } from '@/features/auth/components'

// ✅ Good: Direct imports
import { UserButton } from '@/features/auth/components/user-button'
```

### 6. Lucide Icons Convention

Always import lucide-react icons with the `Icon` suffix:

```tsx
// ❌ Bad: No suffix
import { RefreshCw, X, Loader2 } from "lucide-react"

// ✅ Good: Icon suffix
import { RefreshCwIcon, XIcon, Loader2Icon } from "lucide-react"
```

Use `size-*` for icon dimensions instead of `h-* w-*`:

```tsx
// ❌ Bad
<RefreshCwIcon className="h-4 w-4" />

// ✅ Good
<RefreshCwIcon className="size-4" />
```

### 7. Server Components by Default

In Next.js App Router, prefer Server Components. Use Client Components only when needed:
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Hooks (useState, useEffect, Convex hooks)

```tsx
// Server Component (default) - no directive needed
export default function ProjectPage() {
  return <ProjectList />
}

// Client Component - explicit directive
'use client'
export function ProjectForm() {
  const [name, setName] = useState('')
  // ...
}
```

## State Management

### State Categories

| Type | Where | Example |
|------|-------|---------|
| **Server State** | Convex | Database records, user data |
| **URL State** | nuqs | `/projects/123`, `?filter=active` |
| **Form State** | TanStack Form | Form inputs, validation |
| **UI State** | zustand | Modals, sidebars, local toggles |

### URL State with nuqs

Use [nuqs](https://nuqs.47ng.com/) for type-safe URL state management:

```tsx
'use client'

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs'

export function ProjectFilters() {
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  
  return (
    <Input 
      value={search} 
      onChange={(e) => setSearch(e.target.value)} 
    />
  )
}
```

For multiple related params, use `useQueryStates`:

```tsx
const [filters, setFilters] = useQueryStates({
  q: parseAsString.withDefault(''),
  status: parseAsStringLiteral(['active', 'archived']).withDefault('active'),
  page: parseAsInteger.withDefault(1),
})
```

### UI State with zustand

Use [zustand](https://zustand-demo.pmnd.rs/) for client-side UI state that needs to be shared across components.

Following [TkDodo's patterns](https://tkdodo.eu/blog/working-with-zustand):

```tsx
// stores/ui-store.ts
import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  // ⬇️ separate namespace for actions
  actions: {
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
  }
}

// ⬇️ not exported - no one can subscribe to entire store
const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  actions: {
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
  },
}))

// ⬇️ export atomic selectors - one hook per piece of state
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen)

// ⬇️ export actions separately - they never change, so no re-renders
export const useUIActions = () => useUIStore((state) => state.actions)
```

```tsx
// Usage in components
'use client'

import { useSidebarOpen, useUIActions } from '@/stores/ui-store'

export function Sidebar() {
  const sidebarOpen = useSidebarOpen()
  const { toggleSidebar } = useUIActions()
  
  if (!sidebarOpen) return null
  return <aside>...</aside>
}
```

**Zustand rules:**
- **Don't export the store** - only export custom hooks with selectors
- **Atomic selectors** - one hook per piece of state, not `{ a, b } = useStore()`
- **Separate actions** - put in `actions` namespace, export via single `useActions` hook
- **Actions as events** - `toggleSidebar()` not `setSidebarOpen(!open)`
- **Small stores** - multiple focused stores, not one giant store

**When to use zustand vs useState:**
- `useState` - Local to one component, doesn't need sharing
- `zustand` - Shared across multiple components (modals, sidebars, toasts)

### Key Rules

1. **Convex is the source of truth** for server data - no need for React Query or SWR
2. **URL is state** - use nuqs for filters, pagination, search
3. **Lift state only when necessary** - start local, elevate if needed
4. **Avoid global state** unless truly global (theme, auth)

## Error Handling

1. Use Error Boundaries for recoverable UI errors
2. Handle Convex errors in mutations with try/catch
3. Use `error.tsx` files for route-level error handling
4. Track errors in production with tools like Sentry

## Testing Strategy

| Type | Tool | Focus |
|------|------|-------|
| Unit | Vitest | Utilities, hooks, pure functions |
| Integration | Vitest + Testing Library | Features, component interactions |
| E2E | Playwright | Critical user flows |

## Library Usage

Before using library APIs, verify current syntax to avoid deprecated patterns.

### Documentation Sources

| Library | llms.txt | Context7 ID |
|---------|----------|-------------|
| Zod | `https://zod.dev/llms.txt` | `/websites/zod_dev_v4` |
| Next.js | `https://nextjs.org/docs/llms.txt` | `/vercel/next.js` |
| Convex | `https://convex.dev/llms.txt` | `/llmstxt/convex_dev_llms_txt` |
| shadcn/ui | `https://ui.shadcn.com/llms.txt` | - |
| nuqs | `https://nuqs.47ng.com/llms.txt` | - |
| TanStack Form | - | `/tanstack/form` |

### When to Look Up Docs

- Using an unfamiliar API or pattern
- Getting deprecation warnings or type errors
- Library was recently updated (check package.json versions)
- Unsure about correct syntax or best practices

### How to Look Up

1. **Context7**: Query for specific API usage
2. **Fetch llms.txt**: Get documentation index
3. **Check skill**: Load project skill if available (`/shadcn`, etc.)

## References

- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Convex Docs](https://docs.convex.dev)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [nuqs Docs](https://nuqs.47ng.com/)
