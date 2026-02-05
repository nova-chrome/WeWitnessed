# features/ - Feature-Based Modules

This directory contains feature-based modules. Each feature is a self-contained unit with its own components, hooks, types, and utilities.

## Structure

```
features/
└── [feature-name]/
    ├── components/     # Feature-specific components
    ├── hooks/          # Feature-specific hooks (including Convex hooks)
    ├── types/          # Feature-specific TypeScript types
    └── utils/          # Feature-specific utilities
```

## Rules

### Self-Contained Features

Each feature should be independent and contain everything it needs:

```
features/projects/
├── components/
│   ├── project-card.tsx
│   ├── project-list.tsx
│   ├── project-form.tsx
│   └── project-filters.tsx
├── hooks/
│   ├── use-projects.ts      # Wraps Convex useQuery
│   ├── use-create-project.ts # Wraps Convex useMutation
│   └── use-project-filters.ts
├── types/
│   └── project.ts
└── utils/
    └── project-helpers.ts
```

### No Cross-Feature Imports

Features MUST NOT import from other features:

```tsx
// ❌ Forbidden: Cross-feature import
// features/dashboard/components/overview.tsx
import { ProjectCard } from '@/features/projects/components/project-card'

// ✅ Good: Use shared component or compose at app level
import { Card } from '@/components/ui/card'
```

### Convex Hooks Pattern

Wrap Convex queries/mutations in feature-specific hooks:

```tsx
// features/projects/hooks/use-projects.ts
'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function useProjects(filters?: ProjectFilters) {
  const projects = useQuery(api.projects.list, filters ?? {})
  
  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
  }
}
```

```tsx
// features/projects/hooks/use-create-project.ts
'use client'

import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function useCreateProject() {
  const createProject = useMutation(api.projects.create)
  
  return {
    createProject,
  }
}
```

### Components Are Client Components

Feature components using Convex hooks must be Client Components:

```tsx
// features/projects/components/project-list.tsx
'use client'

import { useProjects } from '../hooks/use-projects'

export function ProjectList() {
  const { projects, isLoading } = useProjects()
  
  if (isLoading) return <ProjectListSkeleton />
  
  return (
    <div className="grid gap-4">
      {projects.map(project => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  )
}
```

## Imports

Features CAN import from:
- `@/components/*` - Shared UI components
- `@/hooks/*` - Shared hooks
- `@/lib/*` - Utilities
- `@/types/*` - Shared types
- `@/convex/_generated/*` - Convex generated API

Features CANNOT import from:
- `@/features/*` - Other features
- `@/app/*` - App routes

## When to Create a Feature

Create a new feature when:
- It has multiple related components
- It has its own data model in Convex
- It represents a distinct domain concept

Keep it simple - not everything needs to be a feature. Small, one-off components can live in `components/`.
