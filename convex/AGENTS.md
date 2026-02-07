# convex/ - Convex Backend

This directory contains Convex backend functions, schema, and generated types.

## Structure

```
convex/
├── schema.ts           # Database schema definition
├── model/              # Business logic & helper functions
│   ├── users.ts
│   ├── projects.ts
│   └── ...
├── [feature].ts        # Public API (queries/mutations) per feature
├── crons.ts            # Scheduled jobs (if needed)
└── _generated/         # Auto-generated - DO NOT EDIT
    ├── api.d.ts
    └── dataModel.d.ts
```

## Rules

### Organize by Feature

Create separate files per domain, matching your `features/` structure:

```
convex/
├── users.ts            # User queries/mutations
├── projects.ts         # Project queries/mutations
├── teams.ts            # Team queries/mutations
└── model/
    ├── users.ts        # User business logic
    ├── projects.ts     # Project business logic
    └── teams.ts        # Team business logic
```

### Use model/ for Business Logic

Keep public API files thin. Put business logic in `model/`:

```typescript
// convex/model/projects.ts (Business Logic)
import { QueryCtx, MutationCtx } from '../_generated/server'

export async function getProjectWithAccess(ctx: QueryCtx, projectId: Id<'projects'>) {
  const user = await getCurrentUser(ctx)
  const project = await ctx.db.get(projectId)
  
  if (!project) throw new ConvexError({ code: 'NotFound' })
  if (project.ownerId !== user._id) throw new ConvexError({ code: 'Forbidden' })
  
  return project
}
```

```typescript
// convex/projects.ts (Public API - Thin Wrapper)
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import * as Projects from './model/projects'

export const get = query({
  args: { id: v.id('projects') },
  handler: async (ctx, { id }) => {
    return Projects.getProjectWithAccess(ctx, id)
  },
})
```

### Always Validate Arguments AND Returns

Use Convex validators for all public functions:

```typescript
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    teamId: v.id('teams'),
  },
  returns: v.id('projects'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('projects', { ...args })
  },
})

export const get = query({
  args: { id: v.id('projects') },
  returns: v.union(v.null(), v.object({
    _id: v.id('projects'),
    _creationTime: v.number(),
    name: v.string(),
    teamId: v.id('teams'),
  })),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})
```

### Always Check Authorization

Every public query/mutation should verify the user has access:

```typescript
export const update = mutation({
  args: { id: v.id('projects'), name: v.string() },
  handler: async (ctx, { id, name }) => {
    // 1. Get authenticated user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError({ code: 'Unauthorized' })
    
    // 2. Check resource access
    const project = await ctx.db.get(id)
    if (project?.ownerId !== identity.subject) {
      throw new ConvexError({ code: 'Forbidden' })
    }
    
    // 3. Perform mutation
    await ctx.db.patch(id, { name })
  },
})
```

### Use Indexes, Not .filter()

Define indexes in schema and use them:

```typescript
// schema.ts
export default defineSchema({
  projects: defineTable({
    name: v.string(),
    ownerId: v.string(),
    teamId: v.id('teams'),
  })
    .index('by_owner', ['ownerId'])
    .index('by_team', ['teamId']),
})

// projects.ts
// ❌ Bad - scans entire table
const projects = await ctx.db
  .query('projects')
  .filter(q => q.eq(q.field('ownerId'), userId))
  .collect()

// ✅ Good - uses index
const projects = await ctx.db
  .query('projects')
  .withIndex('by_owner', q => q.eq('ownerId', userId))
  .collect()
```

### Use Internal Functions for Background Jobs

```typescript
import { internalMutation } from './_generated/server'

// For crons or scheduled jobs - not exposed to client
export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    // cleanup logic
  },
})
```

### Error Handling

Use `ConvexError` for application errors:

```typescript
import { ConvexError } from 'convex/values'

throw new ConvexError({ 
  code: 'NotFound', 
  message: 'Project not found' 
})

throw new ConvexError({ 
  code: 'Forbidden', 
  message: 'You do not have access to this project' 
})
```

### Avoid Write Conflicts (OCC)

Convex uses Optimistic Concurrency Control. Minimize conflicts:

```typescript
// Make mutations idempotent - check state before updating
export const complete = mutation({
  args: { id: v.id('tasks') },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const task = await ctx.db.get(id)
    if (!task || task.status === 'completed') return null
    
    await ctx.db.patch(id, { status: 'completed' })
    return null
  },
})

// Patch directly when possible - no read needed
export const updateContent = mutation({
  args: { id: v.id('notes'), content: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, content }) => {
    await ctx.db.patch(id, { content })
    return null
  },
})

// Use Promise.all for parallel independent updates
export const reorder = mutation({
  args: { ids: v.array(v.id('items')) },
  returns: v.null(),
  handler: async (ctx, { ids }) => {
    await Promise.all(ids.map((id, i) => ctx.db.patch(id, { order: i })))
    return null
  },
})
```

### TypeScript Types

Use generated types for type safety:

```typescript
import { Id, Doc } from './_generated/dataModel'

type ProjectId = Id<'projects'>
type Project = Doc<'projects'>

const scores: Record<Id<'users'>, number> = {}
```

## Schema Best Practices

```typescript
// schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index('by_token', ['tokenIdentifier']),

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_owner', ['ownerId'])
    .index('by_created', ['createdAt']),
})
```

## Environment Variables

Convex functions do **NOT** use t3 env. Instead, read `process.env` directly:

```typescript
// ✅ Good: Direct process.env in Convex functions
export const sendEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY not configured')

    // Use apiKey...
  },
})

// ❌ Bad: Don't import src/ env in Convex
import { env } from '~/lib/env'  // ❌ Can't access NEXT_PUBLIC_* here
```

**Why?** Convex functions run on the server only. t3 env is designed for Next.js frontend/API routes and includes client-accessible variables (`NEXT_PUBLIC_*`), which Convex doesn't support.

### Secret Management

For sensitive secrets, use the [Convex dashboard](https://dashboard.convex.dev) to set environment variables—they're managed separately from `.env.local`.

## References

- [Convex Docs](https://docs.convex.dev)
- [Convex Best Practices](https://docs.convex.dev/production/best-practices)
