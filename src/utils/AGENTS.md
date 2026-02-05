# utils/ - Pure Helper Functions

This directory contains pure utility functions with no side effects.

## What Belongs Here

- String manipulation (slugify, truncate, capitalize)
- Date formatting helpers
- Array/object transformations
- Math utilities
- Type guards and validators
- Formatting functions (currency, numbers, percentages)

## What Does NOT Belong Here

These belong in `lib/` instead:

- Client instances (database, auth, API clients)
- Configuration and environment setup
- Framework integrations and adapters
- Schemas and type definitions for external libraries

## Rules

### Pure Functions Only

Functions should have no side effects:

```typescript
// ✅ Good: Pure function
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-')
}

// ❌ Bad: Has side effects (belongs in lib/)
export function createClient() {
  return new SomeClient(process.env.API_KEY)
}
```

### Single Responsibility

Each file should focus on one domain:

```
utils/
├── string.ts       # String manipulation
├── date.ts         # Date formatting
├── array.ts        # Array helpers
└── format.ts       # Number/currency formatting
```

### No External Dependencies (Preferably)

Prefer vanilla TypeScript. If a dependency is needed, keep it minimal:

```typescript
// ✅ Good: No dependencies
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ⚠️ Acceptable: Minimal dependency for complex task
import { format } from 'date-fns'
export function formatDate(date: Date): string {
  return format(date, 'PPP')
}
```

## Note on lib/utils.ts

The `lib/utils.ts` file with the `cn()` function is a shadcn/ui convention.
It stays in `lib/` for compatibility with shadcn CLI tooling.
